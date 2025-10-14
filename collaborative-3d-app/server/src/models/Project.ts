import mongoose from "mongoose";

const Schema = mongoose.Schema;

const AnnotationSchema = new Schema({
  position: { type: [Number], required: true }, // [x,y,z]
  text: String,
  user: String,
  createdAt: { type: Date, default: Date.now }
});

const ChatSchema = new Schema({
  user: String,
  text: String,
  at: { type: Date, default: Date.now }
});

// New: a reusable, structured transform schema for position/rotation/scale
const TransformSchema = new Schema({
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 },
  },
  rotation: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 },
  },
  scale: {
    x: { type: Number, default: 1 },
    y: { type: Number, default: 1 },
    z: { type: Number, default: 1 },
  }
}, { _id: false }); // _id false to prevent extra keys for subdoc

const ModelSchema = new Schema({
  name: String,
  url: String,
  transform: { type: TransformSchema, default: () => ({}) }
});

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  models: [ModelSchema],
  annotations: [AnnotationSchema],
  chat: [ChatSchema],
  cameraState: { type: Object },
  modelUrl: { type: String },
  transform: { type: TransformSchema, default: () => ({}) }
}, { timestamps: true });

export default mongoose.model("Project", ProjectSchema);
