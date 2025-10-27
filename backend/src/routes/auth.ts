import express from "express";
import type { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";

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

        // Change this to whatever info we actually want
        const userInfo = {
            //googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            //picture: payload.picture,
            //email_verified: payload.email_verified
        };

        // TODO: Database logic goes here
        //Create user if doesn't exist, else fetch user
        

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