import express from "express";
import { register, login, getUserById } from "../controllers/userController.js";
import { check } from "express-validator";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/getOneUser/:id", getUserById);

export default router;
