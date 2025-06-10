
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BarChart3 } from "lucide-react";

const ExerciseDetail = () => {
  const { id } = useParams();
  
  // Mock data - will be replaced with real data later
  const exercise = {
    id: id,
    title: "Bench Press",
    variations: "Incline, Decline, Flat",
    workouts: [
      { date: "2025-06-09", weight: 185, reps: 8 },
      { date: "2025-06-07", weight: 180, reps: 10 },
      { date: "2025-06-05", weight: 185, reps: 6 },
      { date: "2025-06-03", weight: 175, reps: 12 },
    ]
  };

  const handleAnalyze = () => {
    // TODO: Connect to AI assistant for analysis
    console.log("Analyzing exercise data for:", exercise.title);
  };

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
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Link to="/" className="w-full">Log Out</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{exercise.title}</h2>
          <p className="text-muted-foreground">Variations: {exercise.variations}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Workout History */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Workout History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exercise.workouts.map((workout, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{workout.date}</p>
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
              <p className="text-muted-foreground mb-6">
                Get AI-powered insights about your performance including min, max, and average reps for each weight class.
              </p>
              <Button onClick={handleAnalyze} className="w-full rounded-full">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analyze Performance
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetail;
