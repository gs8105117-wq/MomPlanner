import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertFeedingSchema,
  insertSleepSessionSchema,
  insertMealSchema,
  insertTaskSchema,
  insertNoteSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const defaultUserId = "default-user";

  // Feedings routes
  app.get("/api/feedings", async (req, res) => {
    try {
      const { date } = req.query;
      const feedings = await storage.getFeedings(defaultUserId, date as string);
      res.json(feedings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedings" });
    }
  });

  app.post("/api/feedings", async (req, res) => {
    try {
      const data = insertFeedingSchema.parse({
        ...req.body,
        userId: defaultUserId,
        datetime: new Date(req.body.datetime)
      });
      const feeding = await storage.createFeeding(data);
      res.json(feeding);
    } catch (error) {
      res.status(400).json({ error: "Invalid feeding data" });
    }
  });

  app.put("/api/feedings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      if (updates.datetime) {
        updates.datetime = new Date(updates.datetime);
      }
      const feeding = await storage.updateFeeding(id, updates);
      if (!feeding) {
        res.status(404).json({ error: "Feeding not found" });
        return;
      }
      res.json(feeding);
    } catch (error) {
      res.status(400).json({ error: "Failed to update feeding" });
    }
  });

  app.delete("/api/feedings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteFeeding(id);
      if (!deleted) {
        res.status(404).json({ error: "Feeding not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete feeding" });
    }
  });

  // Sleep sessions routes
  app.get("/api/sleep", async (req, res) => {
    try {
      const { date } = req.query;
      const sessions = await storage.getSleepSessions(defaultUserId, date as string);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sleep sessions" });
    }
  });

  app.post("/api/sleep", async (req, res) => {
    try {
      const data = insertSleepSessionSchema.parse({
        ...req.body,
        userId: defaultUserId,
        startTime: new Date(req.body.startTime),
        endTime: req.body.endTime ? new Date(req.body.endTime) : null
      });
      const session = await storage.createSleepSession(data);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid sleep session data" });
    }
  });

  app.put("/api/sleep/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      if (updates.startTime) {
        updates.startTime = new Date(updates.startTime);
      }
      if (updates.endTime) {
        updates.endTime = new Date(updates.endTime);
      }
      const session = await storage.updateSleepSession(id, updates);
      if (!session) {
        res.status(404).json({ error: "Sleep session not found" });
        return;
      }
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Failed to update sleep session" });
    }
  });

  app.delete("/api/sleep/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSleepSession(id);
      if (!deleted) {
        res.status(404).json({ error: "Sleep session not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete sleep session" });
    }
  });

  // Meals routes
  app.get("/api/meals", async (req, res) => {
    try {
      const { date } = req.query;
      const meals = await storage.getMeals(defaultUserId, date as string);
      res.json(meals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meals" });
    }
  });

  app.post("/api/meals", async (req, res) => {
    try {
      const data = insertMealSchema.parse({
        ...req.body,
        userId: defaultUserId
      });
      const meal = await storage.createMeal(data);
      res.json(meal);
    } catch (error) {
      res.status(400).json({ error: "Invalid meal data" });
    }
  });

  app.put("/api/meals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const meal = await storage.updateMeal(id, req.body);
      if (!meal) {
        res.status(404).json({ error: "Meal not found" });
        return;
      }
      res.json(meal);
    } catch (error) {
      res.status(400).json({ error: "Failed to update meal" });
    }
  });

  app.delete("/api/meals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMeal(id);
      if (!deleted) {
        res.status(404).json({ error: "Meal not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete meal" });
    }
  });

  // Tasks routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const { date } = req.query;
      const tasks = await storage.getTasks(defaultUserId, date as string);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const data = insertTaskSchema.parse({
        ...req.body,
        userId: defaultUserId
      });
      const task = await storage.createTask(data);
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const task = await storage.updateTask(id, req.body);
      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTask(id);
      if (!deleted) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete task" });
    }
  });

  // Notes routes
  app.get("/api/notes", async (req, res) => {
    try {
      const { limit } = req.query;
      const notes = await storage.getNotes(defaultUserId, limit ? parseInt(limit as string) : undefined);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const data = insertNoteSchema.parse({
        ...req.body,
        userId: defaultUserId,
        datetime: new Date(req.body.datetime)
      });
      const note = await storage.createNote(data);
      res.json(note);
    } catch (error) {
      res.status(400).json({ error: "Invalid note data" });
    }
  });

  app.put("/api/notes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      if (updates.datetime) {
        updates.datetime = new Date(updates.datetime);
      }
      const note = await storage.updateNote(id, updates);
      if (!note) {
        res.status(404).json({ error: "Note not found" });
        return;
      }
      res.json(note);
    } catch (error) {
      res.status(400).json({ error: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteNote(id);
      if (!deleted) {
        res.status(404).json({ error: "Note not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete note" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
