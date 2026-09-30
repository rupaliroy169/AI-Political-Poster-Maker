import mongoose from "mongoose";
import dotenv from "dotenv";
import Template from "../models/Template.js";

dotenv.config();

export const sampleTemplates = [
  {
    name: "Victory Day Celebrations Poster",
    occasion: "Victory Day",
    description: "A patriotic red and green template designed for Victory Day greetings, events, and rallies.",
    previewImage: "https://placehold.co/600x800/006a4e/ffffff?text=Victory+Day+Template",
    layout: {
      theme: "patriotic",
      primaryColor: "#006a4e",
      secondaryColor: "#f42a41",
      textColor: "#ffffff",
      fontFamily: "Arial, sans-serif",
      aspectRatio: "3:4",
      header: {
        text: "Happy Victory Day",
        fontSize: "32px",
        alignment: "center",
      },
      leaderPhoto: {
        position: "top-right",
        shape: "circle",
        size: "medium",
      },
      candidatePhoto: {
        position: "center-bottom",
        shape: "rectangle",
        size: "large",
      },
      slogan: {
        fontSize: "20px",
        alignment: "center",
      },
    },
    isActive: true,
  },
  {
    name: "Solemn Condolence & Tribute Poster",
    occasion: "Condolence / Tribute",
    description: "A respectful monochrome and subdued template suitable for memorial events, tributes, and condolences.",
    previewImage: "https://placehold.co/600x800/1c1c1c/ffffff?text=Condolence+Tribute+Template",
    layout: {
      theme: "solemn",
      primaryColor: "#1c1c1c",
      secondaryColor: "#4a4a4a",
      textColor: "#f0f0f0",
      fontFamily: "Georgia, serif",
      aspectRatio: "3:4",
      header: {
        text: "In Deepest Condolence & Memory",
        fontSize: "28px",
        alignment: "center",
      },
      leaderPhoto: {
        position: "top-center",
        shape: "circle",
        size: "medium",
      },
      candidatePhoto: {
        position: "bottom-center",
        shape: "circle",
        size: "medium",
      },
      slogan: {
        fontSize: "18px",
        alignment: "center",
      },
    },
    isActive: true,
  },
  {
    name: "Election Campaign & Greetings Poster",
    occasion: "Campaign / Greetings",
    description: "A vibrant, high-energy layout crafted for election campaigns, political rally announcements, and candidate promotions.",
    previewImage: "https://placehold.co/600x800/0b3c5d/ffffff?text=Campaign+Greetings+Template",
    layout: {
      theme: "campaign",
      primaryColor: "#0b3c5d",
      secondaryColor: "#d9534f",
      textColor: "#ffffff",
      fontFamily: "Helvetica, sans-serif",
      aspectRatio: "3:4",
      header: {
        text: "Vote for Progress and Leadership",
        fontSize: "34px",
        alignment: "center",
      },
      leaderPhoto: {
        position: "top-left",
        shape: "circle",
        size: "medium",
      },
      candidatePhoto: {
        position: "center-right",
        shape: "rectangle",
        size: "large",
      },
      slogan: {
        fontSize: "22px",
        alignment: "center",
      },
    },
    isActive: true,
  },
];

export const seedTemplates = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for template seeding.");

    for (const template of sampleTemplates) {
      await Template.findOneAndUpdate(
        { name: template.name },
        { $set: template },
        { upsert: true, returnDocument: "after" }
      );
      console.log(`✓ Template upserted: ${template.name}`);
    }

    console.log("All templates seeded successfully!");
  } catch (error) {
    console.error("Error seeding templates:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

seedTemplates();
