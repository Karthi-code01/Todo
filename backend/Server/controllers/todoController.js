import TodoDB from "../models/TodoModel.js";
import jwt from "jsonwebtoken";

const verifyToken = (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new Error("Unauthorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    console.log("Decoded Token:", decoded);
  } catch (error) {
    throw new Error("Unauthorized, invalid token");
  }
};

export const createTodo = async (req, res, next) => {
  try {
    verifyToken(req);

    const count = await TodoDB.countDocuments({
      user: req.user.id,
      isDeleted: false,
    });
    const todo = await TodoDB.create({
      ...req.body,
      user: req.user.id.toString(),
      order: count,
    });
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
};

export const getTodos = async (req, res, next) => {
  try {
    verifyToken(req);

    const todos = await TodoDB.find({
      user: req.user.id,
      isDeleted: false,
    }).sort({ order: 1 });
    res.json(todos);
  } catch (err) {
    next(err);
  }
};

export const updateTodo = async (req, res, next) => {
  try {
    verifyToken(req);

    const updated = await TodoDB.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteTodo = async (req, res, next) => {
  try {
    verifyToken(req);

    await TodoDB.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isDeleted: true }
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
export const getTodoByUserID = async (req, res, next) => {
  try {
    verifyToken(req);

    const { user } = req.params;

    const todos = await TodoDB.find({
      user: user,
      isDeleted: false,
    }).sort({ order: 1 });

    res.json(todos);
  } catch (err) {
    next(err);
  }
};

export const reorderTodos = async (req, res, next) => {
  try {
    verifyToken(req);

    const { reorderedIds } = req.body;
    for (let index = 0; index < reorderedIds.length; index++) {
      const id = reorderedIds[index];
      await TodoDB.findOneAndUpdate(
        { _id: id, user: req.user.id },
        { order: index }
      );
    }
    res.status(200).json({ message: "Order updated successfully" });
  } catch (err) {
    next(err);
  }
};
