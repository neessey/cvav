import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { v2 as cloudinary } from "cloudinary";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 image uploads
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // Configure Cloudinary
  const isCloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  if (isCloudinaryConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("Cloudinary has been successfully configured.");
  } else {
    console.warn("WARNING: Cloudinary credentials missing in env. Falling back to local/base64.");
  }
console.log({
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: process.env.CLOUDINARY_API_SECRET ? "OK" : "MISSING",
});
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", cloudinaryConfigured: isCloudinaryConfigured });
  });

  // Cloudinary image upload proxy endpoint
  app.post("/api/upload", async (req, res) => {
    try {
      const { file } = req.body;
      if (!file) {
        return res.status(400).json({ error: "Missing file payload" });
      }

      if (!isCloudinaryConfigured) {
        console.warn("Cloudinary not configured. Fallback to sending original data.");
        return res.json({ url: file });
      }

      const uploadResult = await cloudinary.uploader.upload(file, {
        folder: "cvav_jp2",
      });

      return res.json({ url: uploadResult.secure_url });
    } catch (err: any) {
      console.error("Cloudinary upload proxy error:", err);
      return res.status(500).json({ error: err.message || "Failed to upload image" });
    }
  });

  // Vite development middleware or production static server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
