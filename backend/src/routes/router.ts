import express from "express";
import authRouter from "./auth.js";
import problemsRouter from "./problems.js";

const router = express.Router();

router.use('/auth', authRouter);
router.use('/problems', problemsRouter);




export default router;