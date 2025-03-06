import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { analyzePanelImage } from "./openai";
import { insertProjectSchema, insertNoteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Projects
  app.get("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const projects = await storage.getProjectsByUserId(req.user.id);
    res.json(projects);
  });

  app.post("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const data = insertProjectSchema.parse(req.body);
    const project = await storage.createProject({ ...data, userId: req.user.id });
    res.status(201).json(project);
  });

  app.get("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const project = await storage.getProject(parseInt(req.params.id));
    if (!project || project.userId !== req.user.id) return res.sendStatus(404);
    res.json(project);
  });

  // Notes
  app.get("/api/projects/:id/notes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const projectId = parseInt(req.params.id);
    const project = await storage.getProject(projectId);
    if (!project || project.userId !== req.user.id) return res.sendStatus(404);

    const notes = await storage.getNotesByProjectId(projectId);
    res.json(notes);
  });

  app.post("/api/projects/:id/notes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const projectId = parseInt(req.params.id);
    const project = await storage.getProject(projectId);
    if (!project || project.userId !== req.user.id) return res.sendStatus(404);

    const data = insertNoteSchema.parse({ ...req.body, projectId });
    const note = await storage.createNote(data);
    res.status(201).json(note);
  });

  // Panel Analysis
  app.post("/api/projects/:id/analyze", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const projectId = parseInt(req.params.id);
    const project = await storage.getProject(projectId);
    if (!project || project.userId !== req.user.id) return res.sendStatus(404);

    const schema = z.object({ image: z.string() });
    const { image } = schema.parse(req.body);

    try {
      const analysis = await analyzePanelImage(image);
      const panelAnalysis = await storage.createPanelAnalysis({
        projectId,
        imageUrl: image,
        analysis,
        compliant: analysis.compliant
      });
      res.json(panelAnalysis);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get("/api/projects/:id/analyses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const projectId = parseInt(req.params.id);
    const project = await storage.getProject(projectId);
    if (!project || project.userId !== req.user.id) return res.sendStatus(404);

    const analyses = await storage.getPanelAnalysesByProjectId(projectId);
    res.json(analyses);
  });

  const httpServer = createServer(app);
  return httpServer;
}