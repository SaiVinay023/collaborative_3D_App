import mongoose, { Schema } from "mongoose";

const AnnotationSchema = new Schema({
  position: { type: [Number], required: true }, // [x,y,z]
  text: String,
  user: String,
  createdAt: { type: Date, default: Date.now }
});

const ModelSchema = new Schema({
  name: String,
  url: String,
  transform: { type: Object, default: {} }
});

const ChatSchema = new Schema({
  user: String,
  text: String,
  at: { type: Date, default: Date.now }
});

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  models: [ModelSchema],
  annotations: [AnnotationSchema],
  chat: [ChatSchema],
  cameraState: { type: Object }
}, { timestamps: true });

export default mongoose.model("Project", ProjectSchema);
