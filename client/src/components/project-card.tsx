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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{project.name}</CardTitle>
          <Badge variant={project.status === "completed" ? "default" : "secondary"}>
            {project.status === "in_progress" ? "In Progress" : "Completed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-2">{project.description}</p>
        <p className="text-sm text-muted-foreground mt-4">
          Created {format(new Date(project.createdAt), "PP")}
        </p>
      </CardContent>
      <CardFooter>
        <Link href={`/project/${project.id}`}>
          <Button className="w-full">View Project</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
