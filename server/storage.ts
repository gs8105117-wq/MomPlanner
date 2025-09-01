import { 
  type User, 
  type InsertUser,
  type Feeding,
  type InsertFeeding,
  type SleepSession,
  type InsertSleepSession,
  type Meal,
  type InsertMeal,
  type Task,
  type InsertTask,
  type Note,
  type InsertNote
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Feedings
  getFeedings(userId: string, date?: string): Promise<Feeding[]>;
  createFeeding(feeding: InsertFeeding): Promise<Feeding>;
  updateFeeding(id: string, feeding: Partial<Feeding>): Promise<Feeding | undefined>;
  deleteFeeding(id: string): Promise<boolean>;

  // Sleep Sessions
  getSleepSessions(userId: string, date?: string): Promise<SleepSession[]>;
  createSleepSession(session: InsertSleepSession): Promise<SleepSession>;
  updateSleepSession(id: string, session: Partial<SleepSession>): Promise<SleepSession | undefined>;
  deleteSleepSession(id: string): Promise<boolean>;

  // Meals
  getMeals(userId: string, date?: string): Promise<Meal[]>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  updateMeal(id: string, meal: Partial<Meal>): Promise<Meal | undefined>;
  deleteMeal(id: string): Promise<boolean>;

  // Tasks
  getTasks(userId: string, date?: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Notes
  getNotes(userId: string, limit?: number): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: string, note: Partial<Note>): Promise<Note | undefined>;
  deleteNote(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private feedings: Map<string, Feeding> = new Map();
  private sleepSessions: Map<string, SleepSession> = new Map();
  private meals: Map<string, Meal> = new Map();
  private tasks: Map<string, Task> = new Map();
  private notes: Map<string, Note> = new Map();

  constructor() {
    // Create default user for demo
    const defaultUser: User = {
      id: "default-user",
      username: "marina",
      password: "password"
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Feedings
  async getFeedings(userId: string, date?: string): Promise<Feeding[]> {
    const userFeedings = Array.from(this.feedings.values())
      .filter(feeding => feeding.userId === userId);
    
    if (date) {
      return userFeedings.filter(feeding => 
        feeding.datetime.toISOString().split('T')[0] === date
      );
    }
    
    return userFeedings.sort((a, b) => b.datetime.getTime() - a.datetime.getTime());
  }

  async createFeeding(insertFeeding: InsertFeeding): Promise<Feeding> {
    const id = randomUUID();
    const feeding: Feeding = {
      ...insertFeeding,
      id,
      createdAt: new Date()
    };
    this.feedings.set(id, feeding);
    return feeding;
  }

  async updateFeeding(id: string, updates: Partial<Feeding>): Promise<Feeding | undefined> {
    const feeding = this.feedings.get(id);
    if (!feeding) return undefined;
    
    const updated = { ...feeding, ...updates };
    this.feedings.set(id, updated);
    return updated;
  }

  async deleteFeeding(id: string): Promise<boolean> {
    return this.feedings.delete(id);
  }

  // Sleep Sessions
  async getSleepSessions(userId: string, date?: string): Promise<SleepSession[]> {
    const userSessions = Array.from(this.sleepSessions.values())
      .filter(session => session.userId === userId);
    
    if (date) {
      return userSessions.filter(session => 
        session.startTime.toISOString().split('T')[0] === date
      );
    }
    
    return userSessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  async createSleepSession(insertSession: InsertSleepSession): Promise<SleepSession> {
    const id = randomUUID();
    const session: SleepSession = {
      ...insertSession,
      id,
      duration: null,
      createdAt: new Date()
    };
    this.sleepSessions.set(id, session);
    return session;
  }

  async updateSleepSession(id: string, updates: Partial<SleepSession>): Promise<SleepSession | undefined> {
    const session = this.sleepSessions.get(id);
    if (!session) return undefined;
    
    const updated = { ...session, ...updates };
    
    // Calculate duration if both start and end times are present
    if (updated.startTime && updated.endTime && !updated.duration) {
      updated.duration = Math.round((updated.endTime.getTime() - updated.startTime.getTime()) / 60000);
    }
    
    this.sleepSessions.set(id, updated);
    return updated;
  }

  async deleteSleepSession(id: string): Promise<boolean> {
    return this.sleepSessions.delete(id);
  }

  // Meals
  async getMeals(userId: string, date?: string): Promise<Meal[]> {
    const userMeals = Array.from(this.meals.values())
      .filter(meal => meal.userId === userId);
    
    if (date) {
      return userMeals.filter(meal => meal.date === date);
    }
    
    return userMeals.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createMeal(insertMeal: InsertMeal): Promise<Meal> {
    const id = randomUUID();
    const meal: Meal = {
      ...insertMeal,
      id,
      createdAt: new Date()
    };
    this.meals.set(id, meal);
    return meal;
  }

  async updateMeal(id: string, updates: Partial<Meal>): Promise<Meal | undefined> {
    const meal = this.meals.get(id);
    if (!meal) return undefined;
    
    const updated = { ...meal, ...updates };
    this.meals.set(id, updated);
    return updated;
  }

  async deleteMeal(id: string): Promise<boolean> {
    return this.meals.delete(id);
  }

  // Tasks
  async getTasks(userId: string, date?: string): Promise<Task[]> {
    const userTasks = Array.from(this.tasks.values())
      .filter(task => task.userId === userId);
    
    if (date) {
      return userTasks.filter(task => task.date === date);
    }
    
    return userTasks.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      id,
      createdAt: new Date()
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updated = { ...task, ...updates };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Notes
  async getNotes(userId: string, limit?: number): Promise<Note[]> {
    const userNotes = Array.from(this.notes.values())
      .filter(note => note.userId === userId)
      .sort((a, b) => b.datetime.getTime() - a.datetime.getTime());
    
    return limit ? userNotes.slice(0, limit) : userNotes;
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = randomUUID();
    const note: Note = {
      ...insertNote,
      id,
      createdAt: new Date()
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    
    const updated = { ...note, ...updates };
    this.notes.set(id, updated);
    return updated;
  }

  async deleteNote(id: string): Promise<boolean> {
    return this.notes.delete(id);
  }
}

export const storage = new MemStorage();
