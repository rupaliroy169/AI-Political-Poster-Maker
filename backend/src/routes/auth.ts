import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400).json({
        message: "Please provide name, email, and password",
      });
      return;
    }

    // Check whether the email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(400).json({
        message: "User with this email already exists",
      });
      return;
    }

    // Hash password using bcryptjs with salt rounds 10
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user in MongoDB
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    // Never return the password in the response
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error in user registration:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        message: "Please provide email and password",
      });
      return;
    }

    // Find the user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    // Compare the submitted password with the hashed password using bcryptjs
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    // Create a JWT using jsonwebtoken
    const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret";
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      jwtSecret,
      {
        expiresIn: "7d",
      }
    );

    // Return message, token, and user (excluding password)
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in user login:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;
