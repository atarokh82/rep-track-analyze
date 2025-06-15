import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  id: string;
  title: string;
  description: string | null;
  weight: number;
  reps: number;
  created_at: string;
  user_id: string;
}

interface CreateExerciseData {
  title: string;
  description?: string;
  weight: number;
  reps: number;
}

interface GroupedExercise {
  title: string;
  description: string | null;
  workouts: Exercise[];
}

export const useExercises = (exerciseId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all exercises
  const { data: exercises = [], isLoading: isLoadingExercises } = useQuery({
    queryKey: ['exercises', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching exercises:', error);
        throw error;
      }

      return data as Exercise[];
    },
    enabled: !!user,
  });

  // Fetch single exercise with its history
  const { data: exercise, isLoading: isLoadingExercise } = useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: async () => {
      if (!user || !exerciseId) return null;
      
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .single();

      if (exerciseError) {
        console.error('Error fetching exercise:', exerciseError);
        throw exerciseError;
      }

      // Get exercise history (exercises with same title AND matching description)
      const query = supabase
        .from('exercises')
        .select('*')
        .eq('user_id', user.id)
        .eq('title', exerciseData.title);

      // If description is null, look for null descriptions
      // If description has a value, look for matching descriptions
      if (exerciseData.description === null) {
        query.is('description', null);
      } else {
        query.eq('description', exerciseData.description);
      }

      const { data: historyData, error: historyError } = await query.order('created_at', { ascending: false });

      if (historyError) {
        console.error('Error fetching exercise history:', historyError);
        throw historyError;
      }

      return {
        ...exerciseData,
        history: historyData,
      };
    },
    enabled: !!user && !!exerciseId,
  });

  // Create exercise mutation
  const createExerciseMutation = useMutation({
    mutationFn: async (data: CreateExerciseData) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('exercises')
        .insert([{
          ...data,
          user_id: user.id,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast({
        title: "Success",
        description: "Exercise added successfully",
      });
    },
    onError: (error) => {
      console.error('Failed to create exercise:', error);
      toast({
        title: "Error",
        description: "Failed to add exercise. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete exercise mutation
  const deleteExerciseMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      if (!user) throw new Error('Not authenticated');

      // First get the exercise to be deleted to get its title and description
      const { data: exerciseData, error: fetchError } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .single();

      if (fetchError) throw fetchError;

      // Then delete all exercises with matching title and description
      const query = supabase
        .from('exercises')
        .delete()
        .eq('user_id', user.id)
        .eq('title', exerciseData.title);

      // Handle null descriptions separately
      if (exerciseData.description === null) {
        query.is('description', null);
      } else {
        query.eq('description', exerciseData.description);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast({
        title: "Success",
        description: "Exercise deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Failed to delete exercise:', error);
      toast({
        title: "Error",
        description: "Failed to delete exercise. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get unique exercise titles for the dropdown
  const getUniqueExerciseTitles = () => {
    const uniqueTitles = Array.from(new Set(exercises.map(exercise => exercise.title)));
    return uniqueTitles;
  };

  // Get unique exercise variations for a specific title
  const getExerciseVariations = (title: string) => {
    const exercisesWithTitle = exercises.filter(ex => ex.title === title);
    const uniqueVariations = Array.from(new Set(exercisesWithTitle
      .map(ex => ex.description)
      .filter((desc): desc is string => !!desc))); // Filter out null/undefined
    return uniqueVariations;
  };

  // Group exercises by title and description
  const getGroupedExercises = () => {
    const grouped = exercises.reduce((acc: GroupedExercise[], exercise) => {
      const existingGroup = acc.find(
        g => g.title === exercise.title && g.description === exercise.description
      );

      if (existingGroup) {
        existingGroup.workouts.push(exercise);
      } else {
        acc.push({
          title: exercise.title,
          description: exercise.description,
          workouts: [exercise],
        });
      }

      return acc;
    }, []);

    // Sort groups by most recent workout
    return grouped.sort((a, b) => {
      const aLatest = new Date(Math.max(...a.workouts.map(w => new Date(w.created_at).getTime())));
      const bLatest = new Date(Math.max(...b.workouts.map(w => new Date(w.created_at).getTime())));
      return bLatest.getTime() - aLatest.getTime();
    });
  };

  return {
    exercises,
    exercise,
    isLoading: isLoadingExercises || isLoadingExercise,
    createExercise: createExerciseMutation.mutate,
    isCreating: createExerciseMutation.isPending,
    deleteExercise: deleteExerciseMutation.mutate,
    isDeleting: deleteExerciseMutation.isPending,
    getUniqueExerciseTitles,
    getExerciseVariations,
    getGroupedExercises,
  };
};
