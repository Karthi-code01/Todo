import express from "express";
import {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
  reorderTodos,
  getTodoByUserID,
} from "../controllers/todoController.js";

const router = express.Router();

router.post("/create", createTodo);
router.get("/getall", getTodos);
router.put("/update/:id", updateTodo);
router.delete("/delete/:id", deleteTodo);
router.put("/reorder", reorderTodos);
router.get("/getbyuser/:user", getTodoByUserID);

export default router;
