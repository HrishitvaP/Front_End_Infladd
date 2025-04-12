import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginUserSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import session from "express-session";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Configure multer for file uploads
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error("Only image files are allowed"));
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session
  app.use(session({
    secret: process.env.SESSION_SECRET || 'secure-login-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Serve uploaded files
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Registration endpoint
  app.post('/api/register', express.json(), async (req, res) => {
    try {
      console.log('Registration body:', req.body);
      
      // Validate user data
      const userData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        profilePicture: null,
        role: req.body.role || 'creator' // Default to creator if no role provided
      };
      
      const validUserData = insertUserSchema.parse(userData);
      
      // Create user
      const user = await storage.createUser(validUserData);
      
      // Return success but remove password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({
        message: 'User registered successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  });

  // Login endpoint
  app.post('/api/login', express.json(), async (req, res) => {
    try {
      // Validate login data
      const loginData = loginUserSchema.parse(req.body);
      
      // Validate credentials
      const user = await storage.validateUser(loginData.email, loginData.password);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Set user in session
      (req.session as any).user = {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role
      };
      
      // Return user info without password
      const { password, ...userWithoutPassword } = user;
      res.json({
        message: 'Login successful',
        user: userWithoutPassword
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
  });

  // Get current user
  app.get('/api/user', (req, res) => {
    const user = (req.session as any).user;
    
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    res.json(user);
  });

  // Logout endpoint
  app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Could not log out' });
      }
      
      res.json({ message: 'Logged out successfully' });
    });
  });

  const httpServer = createServer(app);
  
  return httpServer;
}

import express from "express";
