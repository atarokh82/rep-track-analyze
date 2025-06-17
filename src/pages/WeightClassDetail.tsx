import { useState } from "react";
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
import { ArrowLeft, User, LogOut, Sparkles, Loader2 } from "lucide-react";
import { useExercises } from "@/hooks/useExercises";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { analyzeWorkout } from "@/lib/claude";
import { toast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WeightClassDetail = () => {
  const { exerciseId, weight } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { exercise, isLoading } = useExercises(exerciseId);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get workouts for this weight class
  const weightClassWorkouts = exercise?.history?.filter(
    w => w.weight === parseFloat(weight!)
  ) || [];

  // Calculate weight class stats
  const weightClassStats = weightClassWorkouts.length ? {
    weight: parseFloat(weight!),
    maxReps: Math.max(...weightClassWorkouts.map(w => w.reps)),
    minReps: Math.min(...weightClassWorkouts.map(w => w.reps)),
    avgReps: Math.round(
      weightClassWorkouts.reduce((sum, w) => sum + w.reps, 0) / 
      weightClassWorkouts.length
    ),
    count: weightClassWorkouts.length,
    totalVolume: weightClassWorkouts.reduce(
      (sum, w) => sum + (w.weight * w.reps), 
      0
    ),
  } : null;

  // Prepare data for the chart
  const chartData = weightClassWorkouts
    .map(workout => ({
      date: format(new Date(workout.created_at), 'MM/dd/yyyy'),
      reps: workout.reps,
      timestamp: new Date(workout.created_at).getTime(),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  // Get AI analysis
  const { data: analysis, isLoading: isAnalyzing } = useQuery({
    queryKey: ['workout-analysis', exerciseId, weight],
    queryFn: async () => {
      if (!exercise || !weightClassStats || !weightClassWorkouts) {
        throw new Error('Missing required data for analysis');
      }

      return analyzeWorkout({
        exerciseTitle: exercise.title,
        description: exercise.description,
        weightClass: weightClassStats,
        workoutHistory: weightClassWorkouts.map(w => ({
          reps: w.reps,
          created_at: w.created_at,
        })),
      });
    },
    enabled: !!exercise && !!weightClassStats && !!weightClassWorkouts,
    retry: false,
    onError: (error) => {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to generate workout analysis. Please try again later.",
        variant: "destructive",
      });
    },
  });

  if (!exerciseId || !weight) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Navigation Bar */}
      <nav className="bg-card border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link to={`/exercise/${exerciseId}`} className="mr-4">
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
              <DropdownMenuItem onClick={handleLogout}>
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading || !exercise ? (
          <>
            <div className="mb-8">
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-6 w-96" />
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">
                {exercise.title} - {weight} lbs
              </h2>
              <p className="text-muted-foreground">
                {exercise.description || 'No description provided'}
              </p>
            </div>

            <div className="grid gap-8">
              {/* Stats Overview Card */}
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Weight Class Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Sets</p>
                      <p className="text-2xl font-bold">{weightClassStats?.count}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Max Reps</p>
                      <p className="text-2xl font-bold">{weightClassStats?.maxReps}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Avg Reps</p>
                      <p className="text-2xl font-bold">{weightClassStats?.avgReps}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Min Reps</p>
                      <p className="text-2xl font-bold">{weightClassStats?.minReps}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">Total Volume</p>
                      <p className="text-2xl font-bold">
                        {weightClassStats?.totalVolume.toLocaleString()} lbs
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Chart */}
              {chartData.length > 0 && (
                <Card className="rounded-xl">
                  <CardHeader>
                    <CardTitle>Progress Chart</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ width: '100%', height: '400px' }}>
                      <ResponsiveContainer>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="reps" 
                            stroke="#4caf50" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Analysis Card */}
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>AI Analysis</span>
                    {isAnalyzing && (
                      <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isAnalyzing ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-16" />
                        </div>
                      ))}
                    </div>
                  ) : analysis ? (
                    <div className="grid gap-6">
                      <div>
                        <h3 className="font-semibold mb-2 text-primary">Progress Trends</h3>
                        <p className="text-muted-foreground">{analysis.progressTrends}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 text-primary">Strengths</h3>
                        <p className="text-muted-foreground">{analysis.strengths}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 text-primary">Areas for Improvement</h3>
                        <p className="text-muted-foreground">{analysis.weaknesses}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 text-primary">Recommendations</h3>
                        <p className="text-muted-foreground">{analysis.recommendations}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Failed to generate analysis. Please try again later.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Workout History Card */}
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Workout History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {weightClassWorkouts.map((workout) => (
                      <div 
                        key={workout.id} 
                        className="flex items-center justify-between p-4 rounded-lg bg-muted"
                      >
                        <div>
                          <p className="font-medium">
                            {format(new Date(workout.created_at), 'MMMM d, yyyy h:mm a')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {workout.reps} reps at {workout.weight} lbs
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WeightClassDetail;
