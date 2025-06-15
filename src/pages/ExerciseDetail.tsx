import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, User, LogOut } from "lucide-react";
import { useExercises } from "@/hooks/useExercises";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface WeightClass {
  weight: number;
  maxReps: number;
  avgReps: number;
  minReps: number;
  count: number;
  totalVolume: number;  // weight * total reps
}

interface ExerciseWorkout {
  id: string;
  weight: number;
  reps: number;
  created_at: string;
}

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { exercise, isLoading } = useExercises(id);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getWeightClasses = (workouts: ExerciseWorkout[]): WeightClass[] => {
    // Group workouts by weight
    const weightGroups = workouts.reduce((acc: { [key: number]: number[] }, workout) => {
      if (!acc[workout.weight]) {
        acc[workout.weight] = [];
      }
      acc[workout.weight].push(workout.reps);
      return acc;
    }, {});

    // Calculate comprehensive stats for each weight class
    return Object.entries(weightGroups)
      .map(([weight, reps]) => {
        const weightNum = parseFloat(weight);
        const totalReps = reps.reduce((a, b) => a + b, 0);
        return {
          weight: weightNum,
          maxReps: Math.max(...reps),
          minReps: Math.min(...reps),
          avgReps: Math.round(totalReps / reps.length),
          count: reps.length,
          totalVolume: weightNum * totalReps
        };
      })
      .sort((a, b) => b.weight - a.weight); // Sort by weight descending
  };

  if (!id) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Navigation Bar */}
      <nav className="bg-card border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/dashboard" className="mr-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">FitTracker</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="font-normal">
                <User className="mr-2 h-4 w-4" />
                <span>{user?.email}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {isLoading ? (
          <>
            <div className="mb-8">
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="rounded-xl">
                <CardHeader>
                  <Skeleton className="h-8 w-48 mb-4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-3 bg-muted rounded-lg">
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : exercise ? (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">{exercise.title}</h2>
              <p className="text-muted-foreground">
                {exercise.description || 'No description provided'}
              </p>
            </div>

            <div className="space-y-8">
              {/* Weight Classes Card */}
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Weight Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getWeightClasses(exercise.history).map((weightClass, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        <div>
                          <p className="text-lg font-semibold">{weightClass.weight} lbs</p>
                          <p className="text-sm text-muted-foreground">
                            {weightClass.count} set{weightClass.count !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Max: {weightClass.maxReps} reps</p>
                          <p className="text-sm text-muted-foreground">
                            Avg: {weightClass.avgReps} reps
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Workout History */}
                <Card className="rounded-xl">
                  <CardHeader>
                    <CardTitle>Workout History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {exercise.history?.map((workout) => (
                        <div 
                          key={workout.id} 
                          className="flex items-center p-3 rounded-lg bg-muted"
                        >
                          <div>
                            <p className="font-medium">
                              {format(new Date(workout.created_at), 'MMMM d, yyyy h:mm a')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {workout.weight} lbs × {workout.reps} reps
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Section */}
                <Card className="rounded-xl">
                  <CardHeader>
                    <CardTitle>Exercise Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {getWeightClasses(exercise.history).map((weightClass, index) => (
                        <div key={index} className="p-4 bg-muted rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{weightClass.weight} lbs</h3>
                              <p className="text-sm text-muted-foreground">
                                {weightClass.count} set{weightClass.count !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
                              Volume: {weightClass.totalVolume.toLocaleString()} lbs
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-background rounded-lg p-3">
                              <p className="text-sm text-muted-foreground mb-1">Maximum</p>
                              <p className="text-xl font-bold">{weightClass.maxReps}</p>
                              <p className="text-xs text-muted-foreground">reps</p>
                            </div>
                            <div className="bg-background rounded-lg p-3">
                              <p className="text-sm text-muted-foreground mb-1">Average</p>
                              <p className="text-xl font-bold">{weightClass.avgReps}</p>
                              <p className="text-xs text-muted-foreground">reps</p>
                            </div>
                            <div className="bg-background rounded-lg p-3">
                              <p className="text-sm text-muted-foreground mb-1">Minimum</p>
                              <p className="text-xl font-bold">{weightClass.minReps}</p>
                              <p className="text-xs text-muted-foreground">reps</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold mb-2">Exercise not found</h2>
            <p className="text-muted-foreground mb-6">
              The exercise you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link to="/dashboard">
              <Button>Return to Dashboard</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseDetail;
