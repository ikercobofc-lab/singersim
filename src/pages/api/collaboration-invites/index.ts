import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { fromId, toId, songId, message: messageText, requirements } = req.body;
    if (!fromId || !toId || !songId) return res.status(400).json({ error: "Missing fields" });

    try {
      const invite = await prisma.collaborationInvite.create({
        data: {
          fromId,
          toId,
          songId,
          message: messageText,
          requirements: requirements ? JSON.parse(requirements) : undefined,
        },
      });

      // Crear MD
      await prisma.message.create({
        data: {
          fromId,
          toId,
          content: `Te han invitado a colaborar en la canción ${songId}: ${messageText || ""}`,
          metadata: { type: "collaboration-invite", inviteId: invite.id } as any,
        },
      });

      return res.status(201).json(invite);
    } catch (err) {
      console.error("collab invite error", err);
      return res.status(500).json({ error: "Internal error" });
    }
  }
  return res.status(405).json({ error: "Method not allowed" });
}
