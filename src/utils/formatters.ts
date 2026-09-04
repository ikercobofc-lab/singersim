export const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString('es-ES');
};

export const formatCurrency = (num: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(num);
};

export const getCertificationBadge = (streams: number): { label: 'Oro' | 'Platino' | 'Multi-Platino' | 'Diamante' | null; color: string } => {
  if (streams >= 50000000) {
    return { label: 'Diamante', color: 'from-cyan-400 to-blue-300 text-white' };
  }
  if (streams >= 20000000) {
    return { label: 'Multi-Platino', color: 'from-slate-200 to-slate-400 text-slate-900' };
  }
  if (streams >= 10000000) {
    return { label: 'Platino', color: 'from-slate-300 to-slate-100 text-slate-800' };
  }
  if (streams >= 5000000) {
    return { label: 'Oro', color: 'from-amber-400 to-yellow-600 text-yellow-950' };
  }
  return { label: null, color: '' };
};
