import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PanelAnalysis } from "@shared/schema";
import { Loader2, Upload, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface PanelAnalysisProps {
  projectId: number;
  analyses: PanelAnalysis[];
}

interface AnalysisData {
  compliant: boolean;
  issues: string[];
  recommendations: string[];
  summary: string;
}

export default function PanelAnalysisComponent({ projectId, analyses }: PanelAnalysisProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const base64Image = await fileToBase64(file);
      const res = await apiRequest("POST", `/api/projects/${projectId}/analyze`, {
        image: base64Image,
      });

      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/analyses`] });
      toast({
        title: "Analysis Complete",
        description: "The panel analysis has been completed successfully.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: "Analysis Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Panel Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="max-w-md"
            />
            <Button disabled={isUploading}>
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isUploading ? "Analyzing..." : "Upload & Analyze"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {analyses.map((analysis) => {
              const analysisData = analysis.analysis as AnalysisData;
              return (
                <Card key={analysis.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        {analysis.compliant ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span className="font-medium">
                          {analysis.compliant ? "NEC Compliant" : "Non-Compliant"}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(analysis.createdAt!), "PPp")}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <img
                        src={analysis.imageUrl}
                        alt="Electrical Panel"
                        className="w-full rounded-lg object-cover"
                      />

                      <div>
                        <h4 className="font-medium mb-2">Summary</h4>
                        <p className="text-sm text-muted-foreground">
                          {analysisData.summary}
                        </p>
                      </div>

                      {analysisData.issues.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Issues</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {analysisData.issues.map((issue, index) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {analysisData.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Recommendations</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {analysisData.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      const base64WithoutPrefix = base64String.split(',')[1];
      resolve(base64WithoutPrefix);
    };
    reader.onerror = (error) => reject(error);
  });
}