
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Welcome = () => {
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
    </div>
  );
};

export default Welcome;
