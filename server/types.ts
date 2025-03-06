import session from "express-session";
import { User, Project, Note, PanelAnalysis, InsertUser, InsertProject, InsertNote, InsertPanelAnalysis } from "@shared/schema";

export interface IStorage {
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  createProject(project: InsertProject & { userId: number }): Promise<Project>;
  
  // Note methods
  getNotesByProjectId(projectId: number): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  
  // Panel Analysis methods
  getPanelAnalysesByProjectId(projectId: number): Promise<PanelAnalysis[]>;
  createPanelAnalysis(analysis: InsertPanelAnalysis): Promise<PanelAnalysis>;
}
