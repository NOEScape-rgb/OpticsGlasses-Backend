const express = require("express");
const router = express.Router();
const upload = require("../utils/upload");
const { verifyToken } = require("../middleware/authMiddleware");

/**
 * @route   POST /api/upload
 * @desc    Upload a single image
 * @access  Private
 */
router.post("/", verifyToken, upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ isStatus: false, msg: "No file uploaded" });
        }

        // Cloudinary returns the full URL in req.file.path
        const filePath = req.file.path;

        res.status(200).json({
            isStatus: true,
            msg: "Image uploaded successfully",
            data: filePath,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || "Upload failed",
        });
    }
});

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple images
 * @access  Private
 */
router.post("/multiple", verifyToken, upload.array("images", 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ isStatus: false, msg: "No files uploaded" });
        }

        const filePaths = req.files.map(file => file.path);

        res.status(200).json({
            isStatus: true,
            msg: "Images uploaded successfully",
            data: filePaths,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || "Upload failed",
        });
    }
});

module.exports = router;
