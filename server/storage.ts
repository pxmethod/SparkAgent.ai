import { IStorage } from "./types";
import createMemoryStore from "memorystore";
import session from "express-session";
import { User, Project, Note, PanelAnalysis, InsertUser, InsertProject, InsertNote, InsertPanelAnalysis } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private notes: Map<number, Note>;
  private panelAnalyses: Map<number, PanelAnalysis>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.notes = new Map();
    this.panelAnalyses = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      id,
      email: insertUser.email.toLowerCase(),
      password: insertUser.password,
    };
    this.users.set(id, user);
    return user;
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId,
    );
  }

  async createProject(project: InsertProject & { userId: number }): Promise<Project> {
    const id = this.currentId++;
    const newProject: Project = {
      id,
      userId: project.userId,
      name: project.name,
      description: project.description || null,
      status: project.status || "in_progress",
      createdAt: new Date(),
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async getNotesByProjectId(projectId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.projectId === projectId,
    );
  }

  async createNote(note: InsertNote): Promise<Note> {
    const id = this.currentId++;
    const newNote: Note = {
      ...note,
      id,
      createdAt: new Date(),
    };
    this.notes.set(id, newNote);
    return newNote;
  }

  async getPanelAnalysesByProjectId(projectId: number): Promise<PanelAnalysis[]> {
    return Array.from(this.panelAnalyses.values()).filter(
      (analysis) => analysis.projectId === projectId,
    );
  }

  async createPanelAnalysis(analysis: InsertPanelAnalysis): Promise<PanelAnalysis> {
    const id = this.currentId++;
    const newAnalysis: PanelAnalysis = {
      ...analysis,
      id,
      createdAt: new Date(),
    };
    this.panelAnalyses.set(id, newAnalysis);
    return newAnalysis;
  }
}

export const storage = new MemStorage();