import mongoose from "mongoose";
const { Schema, model } = mongoose;

const todoSchema = new Schema(
  {
    task: { type: String, required: true },
    completed: { type: Boolean, default: false },
    order: { type: Number },
    isDeleted: { type: Boolean, default: false },
    user: { type: String, required: true },
  },
  { timestamps: true }
);

const TodoDB = model("Todo", todoSchema);
export default TodoDB;
