import express from "express";
import type { Request, Response } from "express";
import pool from "../db_config.js";

const router = express.Router();

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