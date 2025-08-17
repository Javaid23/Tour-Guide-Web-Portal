import express from "express";
import Blog from "../models/Blog.js";

const router = express.Router();

// Get a blog post by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    res.json({ success: true, data: blog });
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
