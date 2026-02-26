import express from "express";
const router = express.Router();
import cloudinary from "cloudinary";

router.post("/upload", async (req, res) => {
  try {
    const { buffer, public_id } = req.body;
    if (public_id) {
      await cloudinary.v2.uploader.destroy(public_id);
    }

    const cloud = await cloudinary.v2.uploader.upload(buffer);

    res.json({
        url: cloud.secure_url, 
        public_id: cloud.public_id
    })

  } catch (error : any) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
