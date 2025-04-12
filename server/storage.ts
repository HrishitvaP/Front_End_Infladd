import { users, type User, type InsertUser } from "@shared/schema";
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { createHash } from 'crypto';

// Define CSV paths
const USER_CSV_PATH = path.join(process.cwd(), 'users.csv');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Create the CSV file with headers if it doesn't exist
if (!fs.existsSync(USER_CSV_PATH)) {
  fs.writeFileSync(USER_CSV_PATH, 'id,name,email,password,profile_picture,role\n');
} else {
  // Check if the file has headers, add them if not
  const data = fs.readFileSync(USER_CSV_PATH, 'utf8');
  if (!data.startsWith('id,name,email,password,profile_picture,role')) {
    // Backup existing data
    const existingData = data.trim();
    // Rewrite file with headers and existing data
    fs.writeFileSync(USER_CSV_PATH, 'id,name,email,password,profile_picture,role\n' + existingData);
    console.log('Added headers to existing users.csv file');
  }
}

// Helper to hash passwords
const hashPassword = (password: string): string => {
  return createHash('sha256').update(password).digest('hex');
};

// Helper to read from CSV
const readCsv = async (): Promise<User[]> => {
  try {
    const data = await fs.promises.readFile(USER_CSV_PATH, 'utf8');
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const user: any = {};
      
      headers.forEach((header, index) => {
        if (header === 'id') {
          user[header] = parseInt(values[index]);
        } else {
          user[header] = values[index];
        }
      });
      
      return user as User;
    });
  } catch (error) {
    console.error('Error reading CSV:', error);
    return [];
  }
};

// Helper to write to CSV
const appendToCsv = async (user: User): Promise<void> => {
  const line = `${user.id},${user.name},${user.email},${user.password},${user.profilePicture || ''},${user.role}\n`;
  await fs.promises.appendFile(USER_CSV_PATH, line);
};

// Interface for storage
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(email: string, password: string): Promise<User | undefined>;
}

export class CsvStorage implements IStorage {
  private currentId: number;

  constructor() {
    this.currentId = 1;
    this.initCurrentId();
  }

  private async initCurrentId(): Promise<void> {
    const users = await readCsv();
    if (users.length > 0) {
      // Find the highest ID currently in use
      this.currentId = Math.max(...users.map(user => user.id)) + 1;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const users = await readCsv();
    return users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await readCsv();
    return users.find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Check if user already exists
    const existingUser = await this.getUserByEmail(insertUser.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    const hashedPassword = hashPassword(insertUser.password);
    const user: User = { 
      id: this.currentId++,
      name: insertUser.name,
      email: insertUser.email,
      password: hashedPassword,
      profilePicture: insertUser.profilePicture || null,
      role: insertUser.role
    };
    
    await appendToCsv(user);
    return user;
  }

  async validateUser(email: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return undefined;
    }

    const hashedPassword = hashPassword(password);
    if (user.password === hashedPassword) {
      return user;
    }

    return undefined;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Check if user already exists
    const existingUser = await this.getUserByEmail(insertUser.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = hashPassword(insertUser.password);
    const id = this.currentId++;
    const user: User = { 
      id,
      name: insertUser.name,
      email: insertUser.email,
      password: hashedPassword,
      profilePicture: insertUser.profilePicture || null,
      role: insertUser.role
    };
    
    this.users.set(id, user);
    return user;
  }

  async validateUser(email: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return undefined;
    }

    const hashedPassword = hashPassword(password);
    if (user.password === hashedPassword) {
      return user;
    }

    return undefined;
  }
}

// Export CSV storage for production use
export const storage = new CsvStorage();
