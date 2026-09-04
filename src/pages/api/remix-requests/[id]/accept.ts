import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method !== "POST") return res.status(405).end();
  const { accepterId } = req.body;
  if (!accepterId) return res.status(400).json({ error: "Missing accepterId" });

  try {
    const rr = await prisma.remixRequest.update({ where: { id: String(id) }, data: { state: "accepted", acceptedAt: new Date() } });
    const original = await prisma.song.findUnique({ where: { id: rr.originalSongId } });
    if (!original) return res.status(404).json({ error: "Original song not found" });

    // Recuperar nombres de los remixers para el título (simplificado; ajusta según tu modelo User)
    const remixer = await prisma.user.findUnique({ where: { id: accepterId } });
    const remixerName = remixer?.username || accepterId;

    const title = rr.proposalTitle || `${original.title} (Remix) — ${remixerName}`;

    const remixSong = await prisma.song.create({
      data: {
        title,
        authorId: accepterId,
        uploadedAt: new Date(),
        popularity: 0,
        // Puedes linkear metadata.originalSongId o crear relación a `original`
      },
    });

    // Notificar al requester y al autor original
    await prisma.message.create({
      data: {
        fromId: accepterId,
        toId: rr.requesterId,
        content: `Tu remix ha sido creado: ${remixSong.id} (${remixSong.title}).`,
        metadata: { type: "remix-accepted", remixSongId: remixSong.id } as any,
      },
    });

    return res.status(200).json({ remixSong });
  } catch (err) {
    console.error("remix-accept error", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
