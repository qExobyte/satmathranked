import express from "express";
import type { Request, Response } from "express";
import pool from "../db_config.js";
import type { Streak } from "../types/types.js";

const router = express.Router();

router.get('/longest_streak', async (req: Request, res: Response) =>{
    const userId = Number(req.query.userId);

    try {
        const [streakRows] = await pool.query(`SELECT * FROM STREAKS WHERE user_id=?`, [userId]);
        const longestStreak = ((streakRows as Streak[])[0] || {current_streak: 0}).longest_streak;
        res.status(200).json({success: true, longestStreak: longestStreak});
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
        const [deletedUser] = await pool.query(`DELETE FROM USERS WHERE id=?`, [userId]);
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