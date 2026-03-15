import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient:  { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  type:       { type: String, enum: ["friend_post", "opportunity"], required: true },
  title:      { type: String, required: true },
  message:    { type: String, required: true },
  link:       { type: String, default: null },       // post link ya opportunity link
  isRead:     { type: Boolean, default: false },
  meta: {
    postId:      { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
    posterName:  { type: String, default: null },
    posterAvatar:{ type: String, default: null },
    opportunity: { type: Object, default: null },    // AI se aaya data
  },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.model("Notification", notificationSchema);