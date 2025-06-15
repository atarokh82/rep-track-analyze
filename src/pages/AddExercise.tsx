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
import { useAuth } from "@/contexts/AuthContext";
import { useExercises } from "@/hooks/useExercises";

const AddExercise = () => {
  const { signOut } = useAuth();
  const { getUniqueExerciseTitles, getExerciseVariations, createExercise, isCreating } = useExercises();
  
  const [selectedExercise, setSelectedExercise] = useState("");
  const [selectedVariation, setSelectedVariation] = useState("");
  const [newExerciseTitle, setNewExerciseTitle] = useState("");
  const [newExerciseVariation, setNewExerciseVariation] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  // Get unique exercise titles for the dropdown
  const previousExercises = ["New Exercise", ...getUniqueExerciseTitles()];
  
  // Get variations for selected exercise
  const variations = selectedExercise && selectedExercise !== "New Exercise" 
    ? ["New Variation", ...getExerciseVariations(selectedExercise)]
    : [];

  const handleExerciseChange = (value: string) => {
    setSelectedExercise(value);
    setSelectedVariation(""); // Reset variation when exercise changes
    setNewExerciseTitle("");
    setNewExerciseVariation("");
  };

  const handleVariationChange = (value: string) => {
    setSelectedVariation(value);
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    
    let title, description;
    
    if (selectedExercise === "New Exercise") {
      title = newExerciseTitle;
      description = newExerciseVariation;
    } else {
      title = selectedExercise;
      description = selectedVariation === "New Variation" ? "" : selectedVariation;
    }
    
    if (!title || !weight || !reps) {
      return;
    }

    createExercise({
      title,
      description: description || undefined,
      weight: parseFloat(weight),
      reps: parseInt(reps),
    });
    
    // Reset form
    setWeight("");
    setReps("");
    if (selectedExercise === "New Exercise") {
      setNewExerciseTitle("");
      setNewExerciseVariation("");
    } else {
      setSelectedVariation("");
    }
  };

  const isFormValid = () => {
    if (selectedExercise === "New Exercise") {
      return newExerciseTitle && weight && reps;
    } else {
      return selectedExercise && weight && reps;
    }
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
              <DropdownMenuItem onClick={signOut}>
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-xl mx-auto px-6 py-8">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Add Exercise</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddExercise} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Exercise</Label>
                  <Select value={selectedExercise} onValueChange={handleExerciseChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an exercise" />
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

                {selectedExercise === "New Exercise" ? (
                  <>
                    <div>
                      <Label htmlFor="title">Exercise Name</Label>
                      <Input
                        id="title"
                        value={newExerciseTitle}
                        onChange={(e) => setNewExerciseTitle(e.target.value)}
                        placeholder="e.g., Bench Press"
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="variation">Variation/Description</Label>
                      <Input
                        id="variation"
                        value={newExerciseVariation}
                        onChange={(e) => setNewExerciseVariation(e.target.value)}
                        placeholder="e.g., Incline, With dumbbells"
                        className="rounded-lg"
                      />
                    </div>
                  </>
                ) : selectedExercise && (
                  <div>
                    <Label>Variation</Label>
                    <Select value={selectedVariation} onValueChange={handleVariationChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a variation" />
                      </SelectTrigger>
                      <SelectContent>
                        {variations.map((variation) => (
                          <SelectItem key={variation} value={variation}>
                            {variation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Weight and Reps */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (lbs)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
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
                  disabled={!isFormValid() || isCreating}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isCreating ? "Adding..." : "Add Exercise"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddExercise;
