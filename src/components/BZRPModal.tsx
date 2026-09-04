import React from "react";

type BZRPProposal = {
  id: string;
  songTitle: string;
  proposerName: string;
  announcement: string;
  scheduledAt: string;
};

export default function BZRPModal({
  proposal,
  onAccept,
  onDecline,
  onEdit,
}: {
  proposal: BZRPProposal;
  onAccept: (id: string, date: string) => void;
  onDecline: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const [date, setDate] = React.useState(proposal.scheduledAt);
  return (
    <div className="bzrp-modal" role="dialog" aria-labelledby="bzrp-title">
      <h2 id="bzrp-title">Propuesta BZRP: "{proposal.songTitle}"</h2>
      <p>Propuesto por: {proposal.proposerName}</p>
      <label>Anuncio sugerido (preview):</label>
      <div className="announcement-preview" style={{ padding: 12, border: "1px solid #ddd", borderRadius: 6 }}>
        {proposal.announcement}
      </div>
      <label htmlFor="bzrp-date">Fecha y hora de lanzamiento:</label>
      <input
        id="bzrp-date"
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{ display: "block", marginTop: 8 }}
      />
      <div className="actions" style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={() => onAccept(proposal.id, date)}>Aceptar y programar</button>
        <button onClick={() => onEdit(proposal.id)}>Editar anuncio</button>
        <button onClick={() => onDecline(proposal.id)}>Rechazar</button>
      </div>
    </div>
  );
}
