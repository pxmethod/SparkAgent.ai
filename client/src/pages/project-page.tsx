import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Project, Note, PanelAnalysis } from "@shared/schema";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PanelAnalysisComponent from "@/components/panel-analysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function ProjectPage() {
  const [, params] = useRoute("/project/:id");
  const { toast } = useToast();
  const noteForm = useForm({
    defaultValues: { content: "" },
  });

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${params?.id}`],
  });

  const { data: notes } = useQuery<Note[]>({
    queryKey: [`/api/projects/${params?.id}/notes`],
  });

  const { data: analyses } = useQuery<PanelAnalysis[]>({
    queryKey: [`/api/projects/${params?.id}/analyses`],
  });

  const addNote = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/projects/${params?.id}/notes`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${params?.id}/notes`] });
      noteForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!project) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>

        <Tabs defaultValue="analysis">
          <TabsList>
            <TabsTrigger value="analysis">Panel Analysis</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="mt-6">
            <PanelAnalysisComponent projectId={project.id} analyses={analyses || []} />
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={noteForm.handleSubmit((data) => addNote.mutate(data.content))}
                  className="mb-6"
                >
                  <Textarea
                    {...noteForm.register("content")}
                    placeholder="Add a note..."
                    className="mb-4"
                  />
                  <Button type="submit" disabled={addNote.isPending}>
                    Add Note
                  </Button>
                </form>

                <div className="space-y-4">
                  {notes?.map((note) => (
                    <Card key={note.id}>
                      <CardContent className="pt-6">
                        <p className="mb-2">{note.content}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(note.createdAt), "PPp")}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
