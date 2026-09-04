export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  favoriteGenre: string;
  musicMarketSize: number; // Multiplier
}

export const COUNTRIES: CountryInfo[] = [
  { code: 'ES', name: 'España', flag: '🇪🇸', favoriteGenre: 'Pop / Electropop', musicMarketSize: 1.2 },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', favoriteGenre: 'Trap / Hip-Hop', musicMarketSize: 1.3 },
  { code: 'MX', name: 'México', flag: '🇲🇽', favoriteGenre: 'Urbano / Reggaeton', musicMarketSize: 1.8 },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', favoriteGenre: 'Urbano / Reggaeton', musicMarketSize: 1.4 },
  { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷', favoriteGenre: 'Urbano / Reggaeton', musicMarketSize: 1.5 },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', favoriteGenre: 'Trap / Hip-Hop', musicMarketSize: 1.1 },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', favoriteGenre: 'Pop / Electropop', musicMarketSize: 2.2 },
  { code: 'IT', name: 'Italia', flag: '🇮🇹', favoriteGenre: 'Pop / Electropop', musicMarketSize: 1.1 },
  { code: 'FR', name: 'Francia', flag: '🇫🇷', favoriteGenre: 'R&B / Neo-Soul', musicMarketSize: 1.2 },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', favoriteGenre: 'Rock / Indie', musicMarketSize: 1.6 }
];
