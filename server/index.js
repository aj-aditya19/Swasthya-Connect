require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many requests, please try again later.",
});

app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/reminders", require("./routes/reminders"));
app.use("/api/schemes", require("./routes/schemes"));
app.use("/api/scanner", require("./routes/scanner"));

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date() }),
);

const { startReminderCron } = require("./routes/reminders");
startReminderCron();

const path = require("path");

// Serve client static files (built with Vite) in production
if (process.env.NODE_ENV === "production") {
  // Deployment expects built files at client/dist/public
  const clientDist = path.join(__dirname, "..", "client", "dist", "public");
  app.use(express.static(clientDist));

  // SPA fallback: serve index.html for any unknown route (except API routes)
  app.get("*(?!/api/*)", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MediSetu server running on port ${PORT}`));
