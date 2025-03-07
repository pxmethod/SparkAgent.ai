import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Project } from "@shared/schema";
import { format } from "date-fns";
import { Link } from "wouter";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-none">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-xl line-clamp-2">{project.name}</CardTitle>
          <Badge variant={project.status === "completed" ? "default" : "secondary"} className="flex-shrink-0">
            {project.status === "in_progress" ? "In Progress" : "Completed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3">{project.description}</p>
        <p className="text-sm text-muted-foreground mt-4">
          Created {format(new Date(project.createdAt!), "PP")}
        </p>
      </CardContent>
      <CardFooter className="pt-6">
        <Link href={`/project/${project.id}`} className="w-full">
          <Button className="w-full py-6 text-lg">View Project</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}