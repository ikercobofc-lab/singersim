import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { originalSongId, requesterId, targetIds, proposalTitle } = req.body;
    if (!originalSongId || !requesterId || !Array.isArray(targetIds) || targetIds.length === 0) {
      return res.status(400).json({ error: "Missing fields" });
    }

    try {
      const rr = await prisma.remixRequest.create({
        data: { originalSongId, requesterId, targetIds, proposalTitle },
      });

      // Crear mensajes directos / notificaciones para cada target
      for (const tid of targetIds) {
        // Si en tu esquema Message tiene campos diferentes, ajústalo.
        await prisma.message.create({
          data: {
            fromId: requesterId,
            toId: tid,
            content: `Te han pedido un remix de la canción ${originalSongId}.`,
            metadata: { type: "remix-request", remixRequestId: rr.id } as any,
          },
        });
      }

      return res.status(201).json(rr);
    } catch (err) {
      console.error("remix-requests create error", err);
      return res.status(500).json({ error: "Internal error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
