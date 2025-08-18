// backend/src/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

// If you already have a DB connector, keep it; otherwise you can remove this import.
// import connectDB from "./database/connection.js";

import weatherRoutes from "./routes/weather.js";

dotenv.config();

const app = express();

// ----- CORS (allow your Render frontend + localhost) -----
const allowedOrigins = [
  process.env.CLIENT_URL,                                  // e.g. https://nomagro-site-frontend.onrender.com
  "https://nomagro-site-frontend.onrender.com",
  "https://nomagro-frontend.onrender.com",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow SSR/fetch-without-origin and allowed list
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked: " + origin), false);
    },
    credentials: true,
  })
);

// ----- Parsers & logs -----
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ----- Health check -----
app.get("/api/health", (req, res) => res.json({ ok: true }));

// ----- API routes -----
app.use("/api", weatherRoutes);

// ----- JSON 404 for /api/* (prevents "Not Found" text) -----
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ----- (Optional) serve a frontend build if you colocate it -----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Example: if you ever build to ../frontend/build
// app.use(express.static(path.join(__dirname, "../frontend/build")));
// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
// });

// ----- Start server after DB connection (if you have one) -----
// If you use a DB, uncomment connectDB() and wait before listen.
// await connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`
  );
});
