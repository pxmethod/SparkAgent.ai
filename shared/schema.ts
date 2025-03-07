import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  description: text("description"),
  status: text("status").notNull().default("in_progress"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const panelAnalyses = pgTable("panel_analyses", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  imageUrl: text("image_url").notNull(),
  analysis: jsonb("analysis").notNull(),
  compliant: boolean("compliant").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Base schema for both login and registration
const baseUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

// Login schema (just email and password)
export const loginUserSchema = baseUserSchema;

// Registration schema (email, password, and confirmPassword with validation)
export const insertUserSchema = baseUserSchema
  .extend({
    confirmPassword: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const insertProjectSchema = createInsertSchema(projects)
  .pick({
    name: true,
    address: true,
    description: true,
    status: true,
  })
  .extend({
    name: z.string().min(1, "Project title is required"),
    address: z.string().min(1, "Address is required"),
  });

export const insertNoteSchema = createInsertSchema(notes).pick({
  projectId: true,
  content: true,
});

export const insertPanelAnalysisSchema = createInsertSchema(panelAnalyses).pick({
  projectId: true,
  imageUrl: true,
  analysis: true,
  compliant: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type PanelAnalysis = typeof panelAnalyses.$inferSelect;
export type InsertPanelAnalysis = z.infer<typeof insertPanelAnalysisSchema>;