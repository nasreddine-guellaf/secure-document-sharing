const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const documentRoutes = require("./routes/document.routes");
const verificationRoutes = require("./routes/verification.routes");
const shareRoutes = require("./routes/share.routes");
const adminRoutes = require("./routes/admin.routes");
const { notFoundHandler, errorMiddleware } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Secure Document Sharing API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/verifications", verificationRoutes);
app.use("/api/shares", shareRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorMiddleware);

module.exports = app;
