
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Welcome = () => {
  const exerciseImages = [
    {
      name: "Bench Press",
      image: "photo-1518770660439-4636190af475"
    },
    {
      name: "Lateral Pulldowns", 
      image: "photo-1486312338219-ce68d2c6f44d"
    },
    {
      name: "Barbell Squats",
      image: "photo-1581091226825-a6a2a5aee158"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center max-w-md mx-auto mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            FitTracker
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Track your workouts, analyze your progress, and reach your fitness goals.
          </p>
          
          <div className="space-y-4">
            <Link to="/login" className="block">
              <Button className="w-full rounded-full h-12 text-lg">
                Log In
              </Button>
            </Link>
            <Link to="/signup" className="block">
              <Button variant="outline" className="w-full rounded-full h-12 text-lg">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Exercise Images Section */}
      <div className="px-6 pb-12">
        <h2 className="text-2xl font-semibold text-center mb-8">Popular Exercises</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {exerciseImages.map((exercise) => (
            <Card key={exercise.name} className="overflow-hidden rounded-xl hover-scale">
              <div className="aspect-square relative">
                <img
                  src={`https://images.unsplash.com/${exercise.image}?auto=format&fit=crop&w=400&q=80`}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-end">
                  <div className="p-4 text-white">
                    <h3 className="font-semibold text-lg">{exercise.name}</h3>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Welcome;
