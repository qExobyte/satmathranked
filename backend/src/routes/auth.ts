import express from "express";
import type { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import prisma from "../db_config.js";
import type { Topic, User } from "../types/types.js";
import { generateToken, verifyToken } from "../utils/jwt.js";
import { verify } from "crypto";

const router = express.Router();

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

router.get("/google", (req: Request, res: Response) => {
  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "consent",
  });

  res.redirect(authUrl);
});

router.get("/google/callback", async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "No authorization code provided" });
  }

  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to get user info" });
    }

    let user = await prisma.user.findUnique({
      where: {
        email: payload.email!,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          username: payload.name!,
          email: payload.email!,
        },
      });
      const topics = await prisma.topic.findMany({
        orderBy: {id: "asc"},
      });

    await prisma.topicElo.createMany({
        data: topics.map(topic => ({
            userId: user!.id,
            topicId: topic.id,
            elo: 500,
        })),
      });
    }

    const token = generateToken(user.id, user.email);
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    res.redirect(`${process.env.FRONTEND_URL}`);
  }
  catch (error) {
    console.error("Error during Google OAuth callback:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error during Google OAuth" });
  }
});


router.get("/me", verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const topicElos = await prisma.topicElo.findMany({
      where: { userId: user.id },
      include: { topic: true },
      orderBy: { topicId: "asc" },
    });

    const topicEloData = topicElos.map((topicElo) => ({
      topicId: topicElo.topicId,
      topicName: topicElo.topic.name,
      elo: Math.round(topicElo.elo || 0),
    }));

    const userInfo = {
      id: user.id,
      email: user.email,
      username: user.username,
      elo: user.overallElo,
      topicEloData: topicEloData,
      streak: user.currentStreak,
    };

    res.json({ success: true, user: userInfo });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch user info" 
    });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  
  res.json({ success: true, message: "Logged out successfully" });
});



export default router;
