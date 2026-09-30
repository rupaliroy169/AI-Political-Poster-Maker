import { Router, Request, Response } from "express";
import Template from "../models/Template.js";

const router = Router();

// GET /api/templates - Return all active templates
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const templates = await Template.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({
      message: "Templates fetched successfully",
      templates,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({
      message: "Failed to fetch templates",
    });
  }
});

export default router;
