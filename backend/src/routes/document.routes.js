const express = require("express");
const documentController = require("../controllers/document.controller");
const { upload } = require("../services/storage.service");
const { authMiddleware } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../middleware/errorMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/upload", upload.single("file"), asyncHandler(documentController.uploadDocument));
router.get("/my", asyncHandler(documentController.getMyDocuments));
router.get("/:id", asyncHandler(documentController.getDocumentById));
router.get("/download/:id", asyncHandler(documentController.downloadDocument));
router.delete("/:id", asyncHandler(documentController.deleteDocument));

module.exports = router;
