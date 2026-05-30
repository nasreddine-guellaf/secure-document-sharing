const express = require("express");
const shareController = require("../controllers/share.controller");
const { authMiddleware } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../middleware/errorMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", asyncHandler(shareController.createShare));
router.get("/received", asyncHandler(shareController.getReceivedShares));
router.get("/sent", asyncHandler(shareController.getSentShares));
router.delete("/:id", asyncHandler(shareController.deleteShare));

module.exports = router;
