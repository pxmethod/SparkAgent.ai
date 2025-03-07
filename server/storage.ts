import { IStorage } from "./types";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { users, projects, notes, panelAnalyses } from "@shared/schema";
import { User, Project, Note, PanelAnalysis, InsertUser, InsertProject, InsertNote, InsertPanelAnalysis } from "@shared/schema";
import { eq } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      email: insertUser.email.toLowerCase(),
      password: insertUser.password,
    }).returning();
    return result[0];
  }

  async getProject(id: number): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return result[0];
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  }

  async createProject(project: InsertProject & { userId: number }): Promise<Project> {
    const result = await db.insert(projects).values({
      userId: project.userId,
      name: project.name,
      description: project.description || null,
      status: project.status || "in_progress",
    }).returning();
    return result[0];
  }

  async getNotesByProjectId(projectId: number): Promise<Note[]> {
    return await db.select().from(notes).where(eq(notes.projectId, projectId));
  }

  async createNote(note: InsertNote): Promise<Note> {
    const result = await db.insert(notes).values(note).returning();
    return result[0];
  }

  async getPanelAnalysesByProjectId(projectId: number): Promise<PanelAnalysis[]> {
    return await db.select().from(panelAnalyses).where(eq(panelAnalyses.projectId, projectId));
  }

  async createPanelAnalysis(analysis: InsertPanelAnalysis): Promise<PanelAnalysis> {
    const result = await db.insert(panelAnalyses).values(analysis).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();