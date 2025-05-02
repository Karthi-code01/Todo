import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./Server/routes/userRouter.js";
import todoRoutes from "./Server/routes/todoRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/todo", todoRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
     console.log("DB Connection Successful");
  })
  .catch((err) => console.log("MongoDB connection error:", err));
