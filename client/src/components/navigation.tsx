import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Home, Zap, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Navigation() {
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();

  const NavItems = () => (
    <>
      <Link href="/">
        <Button variant="ghost" className="h-auto py-2">
          <Home className="h-4 w-4 mr-2" />
          Projects
        </Button>
      </Link>

      <Button
        variant="ghost"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
        className="h-auto py-2"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>

      <div className="ml-4 flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">
          {user?.email}
        </span>
      </div>
    </>
  );

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">SparkPal.ai</span>
          </a>
        </Link>

        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                <NavItems />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center space-x-4">
            <NavItems />
          </div>
        )}
      </div>
    </nav>
  );
}