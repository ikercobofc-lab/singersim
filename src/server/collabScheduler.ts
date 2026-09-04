import { prisma } from "../../lib/prisma";

function collabScore(user: { createdAt: Date; songsCount: number; popularity: number | null }) {
  const weeksActive = Math.max(
    0,
    Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (7 * 24 * 3600 * 1000))
  );
  const songs = user.songsCount || 0;
  const pop = user.popularity || 0;
  return Math.min(1, 0.1 + 0.05 * weeksActive + 0.02 * songs + 0.01 * pop);
}

export async function maybeCreateBZRPProposalsForWeek() {
  const users = await prisma.user.findMany({
    include: { songs: true },
    where: {}, // ajustar filtros según la lógica de actividad que se quiera
  });

  for (const u of users) {
    if (!u.songs || u.songs.length === 0) continue;
    const score = collabScore({ createdAt: u.createdAt, songsCount: u.songs.length, popularity: u.popularity || 0 });
    const prob = 0.05 + 0.4 * score;
    if (Math.random() < prob) {
      const song = u.songs[Math.floor(Math.random() * u.songs.length)];
      if (!song) continue;
      await prisma.bZRPProposal.create({
        data: {
          songId: song.id,
          proposerId: "system",
          announcement: `Nueva propuesta BZRP para \"${song.title}\" — lanzamiento en redes`,
          scheduledAt: new Date(Date.now() + 7 * 24 * 3600 * 1000 + Math.floor(Math.random() * 6) * 3600 * 1000),
        },
      });
      // Opcional: crear una notificación/message que el frontend consulte al avanzar semana
      await prisma.message.create({
        data: {
          fromId: "system",
          toId: u.id,
          content: `Tienes una propuesta BZRP para la canción \"${song.title}\". Revisa la ventana emergente al avanzar la semana.`,
          metadata: { type: "bzrp-proposal" } as any,
        },
      });
    }
  }
}
