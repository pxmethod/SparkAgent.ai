import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus, Zap, LayoutGrid, Table as TableIcon } from "lucide-react";
import Navigation from "@/components/navigation";
import ProjectCard from "@/components/project-card";
import ProjectTable from "@/components/project-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";

export default function HomePage() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"table" | "grid">("table");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const form = useForm({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      status: "in_progress",
    },
  });

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createProject = async (data: any) => {
    try {
      await apiRequest("POST", "/api/projects", {
        name: data.name,
        address: data.address,
        description: data.description,
        status: data.status,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  // Calculate the effective view based on mobile status
  const effectiveView = isMobile ? "grid" : view;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto p-4 sm:p-8">
        <div className="mb-8 sm:mb-12 max-w-[800px]">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Your Electrical Projects</h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Manage your electrical projects, ensure NEC compliance, and get AI-powered recommendations for safety and efficiency.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start mb-6">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full sm:w-auto py-6 text-lg">
                <Plus className="mr-2 h-5 w-5" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(createProject)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter project title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter project address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="min-h-[100px]" placeholder="Enter project description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full py-6"
                    disabled={!form.formState.isValid || form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Create Project
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {!isMobile && (
            <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as "table" | "grid")}>
              <ToggleGroupItem value="table" aria-label="Table view">
                <TableIcon className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div>
            {projects?.length === 0 ? (
              <div className="text-center py-12 sm:py-16 px-4 rounded-lg border-2 border-dashed">
                <div className="max-w-md mx-auto">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
                  <p className="text-muted-foreground mb-6">
                    Create your first project to start managing electrical work, checking NEC compliance, and getting AI-powered safety recommendations.
                  </p>
                  <Button onClick={() => setOpen(true)} size="lg" className="py-6">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Your First Project
                  </Button>
                </div>
              </div>
            ) : effectiveView === "table" ? (
              <ProjectTable projects={projects || []} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {projects?.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}