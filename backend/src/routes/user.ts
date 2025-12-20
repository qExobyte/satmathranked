import express from "express";
import type { Request, Response } from "express";
import prisma from "../db_config.js";
import type { Streak } from "../types/types.js";

const router = express.Router();

router.get('/longest_streak', async (req: Request, res: Response) =>{
    const userId = Number(req.query.userId);

    try {
        const longestStreak = await prisma.user.findUnique({
            where: {id: userId},
            select: {longestStreak: true}
        });
        res.status(200).json({success: true, longestStreak: longestStreak?.longestStreak});
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: "error getting longest streak",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
})

router.delete('', async (req: Request, res: Response) =>{
    const userId = Number(req.query.userId);

    try{
        await prisma.user.delete({where: {id: userId}});
        res.status(200).json({
            success: true
        })
    }
    catch(error){
        console.error("error deleting user: ", error)
        res.status(500).json({
            success: false,
            message: "error deleting user",
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})



export default router;