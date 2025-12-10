import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    publicUrl: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    originalName: String,
    size: Number,
    mimeType: String,
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Image", imageSchema);
