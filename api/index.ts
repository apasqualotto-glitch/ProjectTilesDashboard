import { registerRoutes } from "../server/routes";
import express from "express";

const app = express();

export default async function handler(req: any, res: any) {
  try {
    const server = await registerRoutes(app);

    // Handle the request
    server(req, res);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}