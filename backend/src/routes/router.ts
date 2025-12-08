import express from "express";
import authRouter from "./auth.js";
import problemsRouter from "./problems.js";
import userRouter from "./user.js"

const router = express.Router();

router.use('/auth', authRouter);
router.use('/problems', problemsRouter);
router.use('/users', userRouter);




export default router;