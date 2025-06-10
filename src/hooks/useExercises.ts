
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
}

interface CreateExerciseData {
  title: string;
  description?: string;
  weight: number;
  reps: number;
}

export const useExercises = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: exercises = [], isLoading } = useQuery({
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

  const createExerciseMutation = useMutation({
    mutationFn: async (exerciseData: CreateExerciseData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('exercises')
        .insert({
          ...exerciseData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating exercise:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises', user?.id] });
      toast({
        title: "Exercise added!",
        description: "Your exercise has been successfully recorded.",
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

  // Get unique exercise titles for the dropdown
  const getUniqueExerciseTitles = () => {
    const uniqueTitles = Array.from(new Set(exercises.map(exercise => exercise.title)));
    return uniqueTitles;
  };

  return {
    exercises,
    isLoading,
    createExercise: createExerciseMutation.mutate,
    isCreating: createExerciseMutation.isPending,
    getUniqueExerciseTitles,
  };
};
