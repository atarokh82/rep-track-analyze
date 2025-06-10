
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const Dashboard = () => {
  // Mock data - will be replaced with real data later
  const exercises = [
    { id: 1, title: "Bench Press", variations: "Incline, Decline, Flat" },
    { id: 2, title: "Squats", variations: "Back, Front, Goblet" },
    { id: 3, title: "Deadlifts", variations: "Conventional, Sumo, Romanian" },
  ];

  const hasExercises = exercises.length > 0;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Navigation Bar */}
      <nav className="bg-card border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">FitTracker</h1>
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Your Exercises</h2>
          <Link to="/add-exercise">
            <Button className="rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Exercise
            </Button>
          </Link>
        </div>

        {hasExercises ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <Link key={exercise.id} to={`/exercise/${exercise.id}`}>
                <Card className="rounded-xl hover-scale cursor-pointer">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{exercise.title}</h3>
                    <p className="text-muted-foreground">{exercise.variations}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mb-8">
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80"
                alt="Start exercising"
                className="w-64 h-64 object-cover rounded-xl mx-auto opacity-50"
              />
            </div>
            <h3 className="text-2xl font-semibold mb-4">No exercises yet</h3>
            <p className="text-muted-foreground mb-8">Start tracking your workouts by adding your first exercise</p>
            <Link to="/add-exercise">
              <Button className="rounded-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Exercise
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
