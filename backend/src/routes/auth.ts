import express from "express";
import type { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import pool from "../db_config.js";
import type {User} from "../types/types.js";
import {computeUserElo} from "../utils/elo.js";

const router = express.Router();

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)


router.get('/google', (req: Request, res: Response) => {
    const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
        prompt: 'consent'
    });
    
    res.redirect(authUrl);
});

router.get('/google/callback', async (req: Request, res: Response) => {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
        return res.status(400).json({ success: false, message: 'No authorization code provided' });
    }

    try {
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token!,
            audience: process.env.GOOGLE_CLIENT_ID!
        });

        const payload = ticket.getPayload();
        
        if (!payload) {
            return res.status(400).json({ success: false, message: 'Failed to get user info' });
        }

        const [existingUsers] = await pool.query(
            'SELECT ID, Username, Email_Address FROM USERS WHERE Email_Address = ?',
            [payload.email]
        );

        let user: User;
        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            user = existingUsers[0] as User;
        } else {
            // User doesn't exist, create new user
            const [result] = await pool.query(
                'INSERT INTO USERS (Username, Email_Address) VALUES (?, ?)',
                [payload.name, payload.email]
            );

            const insertId = (result as any).insertId;
            const [newUsers] = await pool.query(
                'SELECT ID as id, Username as username, Profile_Info_Id as profile_info_id, Email_Address as email_address FROM USERS WHERE ID = ?',
                [insertId]
            );
            user = (newUsers as User[])[0];
        }
        console.log(user);

        // we need to compute our elo initially on login (not just after every problem!)
        const elo = await computeUserElo(user.id)

        // Change this to whatever info we actually want
        const userInfo = {
            //googleId: payload.sub,
            id: user.ID,
            email: user.Email_Address,
            name: user.Username,
            elo: elo
            //picture: payload.picture,
            //email_verified: payload.email_verified
        };
        console.log(userInfo)

        // Redirect to frontend with user info (name and email)
        //If we want we can instead make a jwt and send that if we want to do session based
        //This is just something for now
        res.redirect(`${process.env.FRONTEND_URL}?user=${encodeURIComponent(JSON.stringify(userInfo))}`);
        

    } catch (error) {
        console.error('Error during Google authentication:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Authentication failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;