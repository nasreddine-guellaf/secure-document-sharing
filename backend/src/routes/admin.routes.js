const express = require("express");
const adminController = require("../controllers/admin.controller");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../middleware/errorMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole("ADMIN"));

router.get("/users", asyncHandler(adminController.getUsers));
router.get("/documents", asyncHandler(adminController.getDocuments));
router.get("/verifications", asyncHandler(adminController.getVerifications));
router.get("/categories", asyncHandler(adminController.getCategories));
router.post("/categories", asyncHandler(adminController.createCategory));

module.exports = router;
