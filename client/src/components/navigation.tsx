import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Home, Zap } from "lucide-react";

export default function Navigation() {
  const { user, logoutMutation } = useAuth();

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">SparkPal.ai</span>
            </a>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost">
              <Home className="h-4 w-4 mr-2" />
              Projects
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          
          <div className="ml-4 flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.username}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
