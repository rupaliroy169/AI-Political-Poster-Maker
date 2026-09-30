import { Router, Response } from "express";
import Poster from "../models/Poster.js";
import Template from "../models/Template.js";
import { authenticateToken, AuthRequest } from "../middleware/auth.js";
import { renderAndUploadPoster } from "../services/posterRenderer.js";

const router = Router();

// Apply auth middleware to all poster routes
router.use(authenticateToken);

// POST /api/posters - Create and render a new poster
router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      template,
      name,
      designation,
      party,
      unionOrThana,
      district,
      occasion,
      headline,
      photos = [],
      generatedImageUrl = "",
      status = "draft",
    } = req.body;

    // Validate required fields
    if (
      !template ||
      !name ||
      !designation ||
      !party ||
      !unionOrThana ||
      !district ||
      !occasion ||
      !headline
    ) {
      res.status(400).json({
        message:
          "Please provide all required fields: template, name, designation, party, unionOrThana, district, occasion, headline",
      });
      return;
    }

    // Validate photos array and max 3 photos constraint
    if (!Array.isArray(photos)) {
      res.status(400).json({
        message: "Photos must be an array of image URLs",
      });
      return;
    }

    if (photos.length > 3) {
      res.status(400).json({
        message: "A poster cannot have more than 3 photos",
      });
      return;
    }

    // Validate template exists
    const existingTemplate = await Template.findById(template);
    if (!existingTemplate) {
      res.status(404).json({
        message: "Template not found",
      });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    // Attempt poster rendering and Cloudinary upload
    let finalGeneratedImageUrl = generatedImageUrl;
    let finalStatus: "draft" | "generated" = "draft";
    let renderError: string | null = null;

    try {
      finalGeneratedImageUrl = await renderAndUploadPoster({
        name: name.trim(),
        designation: designation.trim(),
        party: party.trim(),
        unionOrThana: unionOrThana.trim(),
        district: district.trim(),
        occasion: occasion.trim(),
        headline: headline.trim(),
        photos,
        template: existingTemplate,
      });
      finalStatus = "generated";
    } catch (err: any) {
      console.error("Poster rendering error:", err);
      renderError = err.message || "Failed to render poster image";
    }

    if (renderError) {
      // Save as draft when rendering fails
      const draftPoster = await Poster.create({
        user: userId,
        template,
        name: name.trim(),
        designation: designation.trim(),
        party: party.trim(),
        unionOrThana: unionOrThana.trim(),
        district: district.trim(),
        occasion: occasion.trim(),
        headline: headline.trim(),
        photos,
        generatedImageUrl: "",
        status: "draft",
      });
      await draftPoster.populate("template");

      res.status(500).json({
        message: `Poster saved as draft, but image rendering failed: ${renderError}`,
        poster: draftPoster,
      });
      return;
    }

    // Create the poster document with generated status
    const newPoster = await Poster.create({
      user: userId,
      template,
      name: name.trim(),
      designation: designation.trim(),
      party: party.trim(),
      unionOrThana: unionOrThana.trim(),
      district: district.trim(),
      occasion: occasion.trim(),
      headline: headline.trim(),
      photos,
      generatedImageUrl: finalGeneratedImageUrl,
      status: finalStatus,
    });

    // Populate template details before returning
    await newPoster.populate("template");

    res.status(201).json({
      message: "Poster created and generated successfully",
      poster: newPoster,
    });
  } catch (error: any) {
    console.error("Error creating poster:", error);
    res.status(500).json({
      message: error.message || "Failed to create poster",
    });
  }
});

// POST /api/posters/:id/render - Re-render an existing poster
router.post("/:id/render", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const poster = await Poster.findOne({ _id: req.params.id, user: userId }).populate("template");
    if (!poster) {
      res.status(404).json({ message: "Poster not found" });
      return;
    }

    const generatedImageUrl = await renderAndUploadPoster({
      name: poster.name,
      designation: poster.designation,
      party: poster.party,
      unionOrThana: poster.unionOrThana,
      district: poster.district,
      occasion: poster.occasion,
      headline: poster.headline,
      photos: poster.photos,
      template: poster.template,
    });

    poster.generatedImageUrl = generatedImageUrl;
    poster.status = "generated";
    await poster.save();

    res.status(200).json({
      message: "Poster rendered and updated successfully",
      poster,
    });
  } catch (error: any) {
    console.error("Error re-rendering poster:", error);
    res.status(500).json({
      message: error.message || "Failed to render poster",
    });
  }
});

// GET /api/posters - Fetch posters for the authenticated user
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    const posters = await Poster.find({ user: userId })
      .populate("template")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Posters fetched successfully",
      count: posters.length,
      posters,
    });
  } catch (error: any) {
    console.error("Error fetching posters:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch posters",
    });
  }
});

export default router;
