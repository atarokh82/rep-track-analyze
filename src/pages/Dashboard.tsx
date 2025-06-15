import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Plus, User, LogOut, Dumbbell, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useExercises } from "@/hooks/useExercises";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { getGroupedExercises, isLoading, deleteExercise, isDeleting, createExercise, isCreating } = useExercises();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<{ id: string; title: string; description: string | null } | null>(null);
  const [showQuickAddDialog, setShowQuickAddDialog] = useState(false);
  const [quickAddExercise, setQuickAddExercise] = useState<{ title: string; description: string | null } | null>(null);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  // Get grouped exercises
  const groupedExercises = getGroupedExercises();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (id: string, title: string, description: string | null) => (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    setExerciseToDelete({ id, title, description });
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!exerciseToDelete) return;

    try {
      await deleteExercise(exerciseToDelete.id);
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }

    setShowDeleteDialog(false);
    setExerciseToDelete(null);
  };

  const handleQuickAddClick = (title: string, description: string | null) => (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    setQuickAddExercise({ title, description });
    setShowQuickAddDialog(true);
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quickAddExercise || !weight || !reps) return;

    try {
      await createExercise({
        title: quickAddExercise.title,
        description: quickAddExercise.description || undefined,
        weight: parseFloat(weight),
        reps: parseInt(reps),
      });

      setShowQuickAddDialog(false);
      setQuickAddExercise(null);
      setWeight("");
      setReps("");
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Navigation Bar */}
      <nav className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">FitTracker</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
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
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Your Exercises</h2>
            <Link to="/add-exercise">
              <Button className="rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="rounded-xl">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : groupedExercises.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-xl flex items-center justify-center">
                <Plus className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No exercises yet</h3>
              <p className="text-muted-foreground mb-6">
                Start tracking your fitness journey by adding your first exercise
              </p>
              <Link to="/add-exercise">
                <Button className="rounded-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Exercise
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedExercises.map((group, index) => {
                const latestWorkout = group.workouts[0]; // Already sorted by date
                return (
                  <div key={index} className="group relative">
                    <Link to={`/exercise/${latestWorkout.id}`}>
                      <Card className="rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Dumbbell className="h-5 w-5 text-primary" />
                            {group.title}
                            {group.description && (
                              <span className="font-normal text-muted-foreground">
                                ({group.description})
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription>
                            Latest: {latestWorkout.weight} lbs × {latestWorkout.reps} reps
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {group.workouts.length} workout{group.workouts.length !== 1 ? 's' : ''}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-3 right-12 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full hover:bg-green-500 hover:text-white"
                      onClick={handleQuickAddClick(group.title, group.description)}
                      disabled={isCreating}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full hover:bg-destructive hover:text-destructive-foreground"
                      onClick={handleDeleteClick(latestWorkout.id, group.title, group.description)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {exerciseToDelete?.title}
              {exerciseToDelete?.description ? ` (${exerciseToDelete.description})` : ''} and all of its workout history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showQuickAddDialog} onOpenChange={setShowQuickAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Add Exercise</DialogTitle>
            <DialogDescription>
              Add a new workout for {quickAddExercise?.title}
              {quickAddExercise?.description ? ` (${quickAddExercise.description})` : ''}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleQuickAddSubmit} className="space-y-4">
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
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setShowQuickAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Adding..." : "Add Exercise"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
