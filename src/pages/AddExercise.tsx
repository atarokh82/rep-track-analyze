import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";

const AddExercise = () => {
  const [selectedExercise, setSelectedExercise] = useState("");
  const [exerciseTitle, setExerciseTitle] = useState("");
  const [exerciseDescription, setExerciseDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  // Mock previous exercises - will be replaced with real data later
  const previousExercises = [
    "Bench Press",
    "Squats", 
    "Deadlifts",
    "Overhead Press",
    "Pull-ups"
  ];

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to database logic later
    console.log("Adding exercise:", {
      selectedExercise,
      exerciseTitle,
      exerciseDescription,
      weight,
      reps
    });
    
    // Reset weight and reps fields but keep exercise selection
    setWeight("");
    setReps("");
  };

  const isFormValid = (selectedExercise || (exerciseTitle && exerciseDescription)) && weight && reps;

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
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold mb-8">Add Exercise</h2>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Exercise Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddExercise} className="space-y-6">
              {/* Exercise Selection */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Previous Exercise</Label>
                  <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Choose from previous exercises" />
                    </SelectTrigger>
                    <SelectContent>
                      {previousExercises.map((exercise) => (
                        <SelectItem key={exercise} value={exercise}>
                          {exercise}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-center text-muted-foreground">
                  — OR —
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="exerciseTitle">Exercise Title</Label>
                    <Input
                      id="exerciseTitle"
                      type="text"
                      placeholder="e.g., Bench Press"
                      value={exerciseTitle}
                      onChange={(e) => setExerciseTitle(e.target.value)}
                      className="rounded-lg"
                      disabled={!!selectedExercise}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exerciseDescription">Description (Variations)</Label>
                    <Input
                      id="exerciseDescription"
                      type="text"
                      placeholder="e.g., Incline, Decline, Flat"
                      value={exerciseDescription}
                      onChange={(e) => setExerciseDescription(e.target.value)}
                      className="rounded-lg"
                      disabled={!!selectedExercise}
                    />
                  </div>
                </div>
              </div>

              {/* Weight and Reps */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="185"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reps">Repetitions</Label>
                  <Input
                    id="reps"
                    type="number"
                    placeholder="8"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="rounded-lg"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full rounded-full h-12"
                disabled={!isFormValid}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Exercise
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddExercise;
