const express = require("express");
const verificationController = require("../controllers/verification.controller");
const { upload } = require("../services/storage.service");
const { authMiddleware } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../middleware/errorMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/verify", upload.single("file"), asyncHandler(verificationController.verifyDocument));
router.get("/history", asyncHandler(verificationController.getVerificationHistory));

module.exports = router;
