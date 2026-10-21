import { SpotifyChartEntry } from '../types';

export const INITIAL_GLOBAL_CHARTS: SpotifyChartEntry[] = [
  { rank: 1, previousRank: 2, songTitle: 'Birds of a Feather', artistName: 'Billie Eilish', streams: 8940000, isPlayerSong: false, peakRank: 1, weeksOnChart: 16, country: 'Global' },
  { rank: 2, previousRank: 1, songTitle: 'Espresso', artistName: 'Sabrina Carpenter', streams: 8520000, isPlayerSong: false, peakRank: 1, weeksOnChart: 20, country: 'Global' },
  { rank: 3, previousRank: 3, songTitle: 'Not Like Us', artistName: 'Kendrick Lamar', streams: 7810000, isPlayerSong: false, peakRank: 1, weeksOnChart: 18, country: 'Global' },
  { rank: 4, previousRank: 5, songTitle: 'Good Luck, Babe!', artistName: 'Chappell Roan', streams: 7120000, isPlayerSong: false, peakRank: 4, weeksOnChart: 14, country: 'Global' },
  { rank: 5, previousRank: 4, songTitle: 'A Bar Song (Tipsy)', artistName: 'Shaboozey', streams: 6840000, isPlayerSong: false, peakRank: 2, weeksOnChart: 22, country: 'Global' },
  { rank: 6, previousRank: 8, songTitle: 'Si Antes Te Hubiera Conocido', artistName: 'Karol G', streams: 6410000, isPlayerSong: false, peakRank: 5, weeksOnChart: 10, country: 'Global' },
  { rank: 7, previousRank: 6, songTitle: 'Gata Only', artistName: 'FloyyMenor, Cris Mj', streams: 5930000, isPlayerSong: false, peakRank: 3, weeksOnChart: 26, country: 'Global' },
  { rank: 8, previousRank: 7, songTitle: 'LUNA', artistName: 'Feid, ATL Jacob', streams: 5420000, isPlayerSong: false, peakRank: 4, weeksOnChart: 30, country: 'Global' },
  { rank: 9, previousRank: 10, songTitle: 'Taste', artistName: 'Sabrina Carpenter', streams: 5110000, isPlayerSong: false, peakRank: 2, weeksOnChart: 5, country: 'Global' },
  { rank: 10, previousRank: 9, songTitle: 'I Had Some Help', artistName: 'Post Malone, Morgan Wallen', streams: 4790000, isPlayerSong: false, peakRank: 1, weeksOnChart: 24, country: 'Global' },
  { rank: 11, previousRank: 12, songTitle: 'Lose Control', artistName: 'Teddy Swims', streams: 4320000, isPlayerSong: false, peakRank: 6, weeksOnChart: 42, country: 'Global' },
  { rank: 12, previousRank: 11, songTitle: 'MILLION DOLLAR BABY', artistName: 'Tommy Richman', streams: 4180000, isPlayerSong: false, peakRank: 2, weeksOnChart: 19, country: 'Global' },
  { rank: 13, previousRank: 14, songTitle: 'MONACO', artistName: 'Bad Bunny', streams: 3890000, isPlayerSong: false, peakRank: 1, weeksOnChart: 48, country: 'Global' },
  { rank: 14, previousRank: 13, songTitle: 'Santa', artistName: 'Rvssian, Rauw Alejandro, Ayra Starr', streams: 3670000, isPlayerSong: false, peakRank: 9, weeksOnChart: 15, country: 'Global' },
  { rank: 15, previousRank: 16, songTitle: 'Bzrp Music Sessions, Vol. 53', artistName: 'Bizarrap, Shakira', streams: 3450000, isPlayerSong: false, peakRank: 1, weeksOnChart: 78, country: 'Global' },
  { rank: 16, previousRank: 15, songTitle: 'Beautiful Things', artistName: 'Benson Boone', streams: 3280000, isPlayerSong: false, peakRank: 1, weeksOnChart: 35, country: 'Global' },
  { rank: 17, previousRank: 18, songTitle: 'PERRO NEGRO', artistName: 'Bad Bunny, Feid', streams: 3120000, isPlayerSong: false, peakRank: 4, weeksOnChart: 40, country: 'Global' },
  { rank: 18, previousRank: 17, songTitle: 'Too Sweet', artistName: 'Hozier', streams: 2980000, isPlayerSong: false, peakRank: 1, weeksOnChart: 25, country: 'Global' },
  { rank: 19, previousRank: 20, songTitle: 'Cruel Summer', artistName: 'Taylor Swift', streams: 2840000, isPlayerSong: false, peakRank: 1, weeksOnChart: 92, country: 'Global' },
  { rank: 20, previousRank: 19, songTitle: 'DESPECHÁ', artistName: 'Rosalía', streams: 2690000, isPlayerSong: false, peakRank: 1, weeksOnChart: 64, country: 'Global' }
];

export const COUNTRY_SPECIFIC_CHARTS: Record<string, SpotifyChartEntry[]> = {
  'España': [
    { rank: 1, previousRank: 2, songTitle: 'BADGYAL', artistName: 'Saiko, JC Reyes, Dei V', streams: 3820000, isPlayerSong: false, peakRank: 1, weeksOnChart: 12, country: 'España' },
    { rank: 2, previousRank: 1, songTitle: 'Columbia', artistName: 'Quevedo', streams: 3410000, isPlayerSong: false, peakRank: 1, weeksOnChart: 45, country: 'España' },
    { rank: 3, previousRank: 4, songTitle: 'YO LO SOÑÉ', artistName: 'Saiko, Omar Montes', streams: 3120000, isPlayerSong: false, peakRank: 2, weeksOnChart: 8, country: 'España' },
    { rank: 4, previousRank: 3, songTitle: 'DESPECHÁ', artistName: 'Rosalía', streams: 2950000, isPlayerSong: false, peakRank: 1, weeksOnChart: 54, country: 'España' },
    { rank: 5, previousRank: 6, songTitle: 'GOTERAS', artistName: 'Omar Montes, JC Reyes', streams: 2680000, isPlayerSong: false, peakRank: 3, weeksOnChart: 14, country: 'España' },
    { rank: 6, previousRank: 5, songTitle: 'LAS BABYS', artistName: 'Aitana', streams: 2450000, isPlayerSong: false, peakRank: 2, weeksOnChart: 30, country: 'España' },
    { rank: 7, previousRank: 9, songTitle: 'Madrid City', artistName: 'Ana Mena', streams: 2280000, isPlayerSong: false, peakRank: 5, weeksOnChart: 24, country: 'España' },
    { rank: 8, previousRank: 7, songTitle: 'Manos Rotas', artistName: 'Dellafuente, Morad', streams: 2120000, isPlayerSong: false, peakRank: 2, weeksOnChart: 36, country: 'España' },
    { rank: 9, previousRank: 11, songTitle: 'El Pantalón', artistName: 'Lola Indigo, Omar Montes', streams: 1980000, isPlayerSong: false, peakRank: 8, weeksOnChart: 10, country: 'España' },
    { rank: 10, previousRank: 8, songTitle: 'REINA', artistName: 'Mora, Saiko', streams: 1870000, isPlayerSong: false, peakRank: 1, weeksOnChart: 40, country: 'España' },
    { rank: 11, previousRank: 10, songTitle: 'POLARIS REMIX', artistName: 'Saiko, Quevedo, Mora, Feid', streams: 1790000, isPlayerSong: false, peakRank: 1, weeksOnChart: 52, country: 'España' },
    { rank: 12, previousRank: 13, songTitle: 'Gata Only', artistName: 'FloyyMenor, Cris Mj', streams: 1680000, isPlayerSong: false, peakRank: 4, weeksOnChart: 20, country: 'España' },
    { rank: 13, previousRank: 12, songTitle: 'La Falda', artistName: 'Myke Towers', streams: 1590000, isPlayerSong: false, peakRank: 3, weeksOnChart: 28, country: 'España' },
    { rank: 14, previousRank: 15, songTitle: 'Si Antes Te Hubiera Conocido', artistName: 'Karol G', streams: 1510000, isPlayerSong: false, peakRank: 6, weeksOnChart: 11, country: 'España' },
    { rank: 15, previousRank: 14, songTitle: 'Buenas', artistName: 'Quevedo, Saiko', streams: 1440000, isPlayerSong: false, peakRank: 1, weeksOnChart: 60, country: 'España' },
    { rank: 16, previousRank: 17, songTitle: 'Lo Que Tiene', artistName: 'Beny Jr, Morad', streams: 1370000, isPlayerSong: false, peakRank: 8, weeksOnChart: 18, country: 'España' },
    { rank: 17, previousRank: 16, songTitle: 'APA', artistName: 'Mora, Quevedo', streams: 1310000, isPlayerSong: false, peakRank: 1, weeksOnChart: 65, country: 'España' },
    { rank: 18, previousRank: 19, songTitle: 'Corazón Vacío', artistName: 'Maria Becerra', streams: 1240000, isPlayerSong: false, peakRank: 7, weeksOnChart: 26, country: 'España' },
    { rank: 19, previousRank: 18, songTitle: 'Xclusivo Remix', artistName: 'Gonzy, Saiko, Arcángel', streams: 1180000, isPlayerSong: false, peakRank: 5, weeksOnChart: 22, country: 'España' },
    { rank: 20, previousRank: 20, songTitle: 'CLAVETE', artistName: 'JC Reyes', streams: 1120000, isPlayerSong: false, peakRank: 12, weeksOnChart: 15, country: 'España' }
  ],
  'Argentina': [
    { rank: 1, previousRank: 1, songTitle: 'Una Foto Remix', artistName: 'Mesita, Nicki Nicole, Tiago PZK, Emilia', streams: 4210000, isPlayerSong: false, peakRank: 1, weeksOnChart: 15, country: 'Argentina' },
    { rank: 2, previousRank: 3, songTitle: 'GARDEL', artistName: 'Duki', streams: 3940000, isPlayerSong: false, peakRank: 1, weeksOnChart: 10, country: 'Argentina' },
    { rank: 3, previousRank: 2, songTitle: 'Bzrp Music Sessions, Vol. 57', artistName: 'Bizarrap, Milo J', streams: 3650000, isPlayerSong: false, peakRank: 1, weeksOnChart: 35, country: 'Argentina' },
    { rank: 4, previousRank: 5, songTitle: 'Tranky Funky', artistName: 'Trueno', streams: 3310000, isPlayerSong: false, peakRank: 3, weeksOnChart: 18, country: 'Argentina' },
    { rank: 5, previousRank: 4, songTitle: 'La_Original.mp3', artistName: 'Emilia, Tini', streams: 3120000, isPlayerSong: false, peakRank: 1, weeksOnChart: 28, country: 'Argentina' },
    { rank: 6, previousRank: 7, songTitle: 'Hola Perdida', artistName: 'Luck Ra, KHEA', streams: 2890000, isPlayerSong: false, peakRank: 4, weeksOnChart: 22, country: 'Argentina' },
    { rank: 7, previousRank: 6, songTitle: 'Gata Only', artistName: 'FloyyMenor, Cris Mj', streams: 2710000, isPlayerSong: false, peakRank: 2, weeksOnChart: 24, country: 'Argentina' },
    { rank: 8, previousRank: 9, songTitle: 'QUE LE PASA CONMIGO?', artistName: 'Nicki Nicole, Rels B', streams: 2540000, isPlayerSong: false, peakRank: 5, weeksOnChart: 30, country: 'Argentina' },
    { rank: 9, previousRank: 8, songTitle: 'Rincón', artistName: 'Milo J', streams: 2380000, isPlayerSong: false, peakRank: 3, weeksOnChart: 16, country: 'Argentina' },
    { rank: 10, previousRank: 12, songTitle: 'M.A (Mejores Amigos)', artistName: 'BM, Callejero Fino, La Joaqui', streams: 2210000, isPlayerSong: false, peakRank: 1, weeksOnChart: 44, country: 'Argentina' },
    { rank: 11, previousRank: 10, songTitle: 'Givenchy', artistName: 'Duki', streams: 2090000, isPlayerSong: false, peakRank: 1, weeksOnChart: 65, country: 'Argentina' },
    { rank: 12, previousRank: 11, songTitle: 'En La Intimidad', artistName: 'Emilia, Callejero Fino, Big One', streams: 1980000, isPlayerSong: false, peakRank: 1, weeksOnChart: 50, country: 'Argentina' },
    { rank: 13, previousRank: 15, songTitle: 'BZRP Music Sessions #59', artistName: 'Bizarrap, Natanael Cano', streams: 1870000, isPlayerSong: false, peakRank: 2, weeksOnChart: 14, country: 'Argentina' },
    { rank: 14, previousRank: 13, songTitle: 'Que Te Vaya Bien', artistName: 'YSY A', streams: 1760000, isPlayerSong: false, peakRank: 7, weeksOnChart: 20, country: 'Argentina' },
    { rank: 15, previousRank: 14, songTitle: 'DANCE CRIP', artistName: 'Trueno', streams: 1650000, isPlayerSong: false, peakRank: 1, weeksOnChart: 80, country: 'Argentina' },
    { rank: 16, previousRank: 17, songTitle: 'Frío', artistName: 'Nicki Nicole', streams: 1540000, isPlayerSong: false, peakRank: 8, weeksOnChart: 26, country: 'Argentina' },
    { rank: 17, previousRank: 16, songTitle: 'Ya No Vuelvas', artistName: 'Luck Ra, Ke Personajes', streams: 1470000, isPlayerSong: false, peakRank: 1, weeksOnChart: 58, country: 'Argentina' },
    { rank: 18, previousRank: 19, songTitle: 'Un Finde', artistName: 'Ke Personajes, FMK, Big One', streams: 1390000, isPlayerSong: false, peakRank: 1, weeksOnChart: 62, country: 'Argentina' },
    { rank: 19, previousRank: 18, songTitle: 'DISCOTEKA', artistName: 'Lola Indigo, Maria Becerra', streams: 1320000, isPlayerSong: false, peakRank: 9, weeksOnChart: 32, country: 'Argentina' },
    { rank: 20, previousRank: 20, songTitle: 'Si Antes Te Hubiera Conocido', artistName: 'Karol G', streams: 1250000, isPlayerSong: false, peakRank: 11, weeksOnChart: 8, country: 'Argentina' }
  ],
  'México': [
    { rank: 1, previousRank: 1, songTitle: 'Madonna', artistName: 'Natanael Cano, Oscar Maydon', streams: 5410000, isPlayerSong: false, peakRank: 1, weeksOnChart: 16, country: 'México' },
    { rank: 2, previousRank: 3, songTitle: 'Ella Baila Sola', artistName: 'Eslabon Armado, Peso Pluma', streams: 5120000, isPlayerSong: false, peakRank: 1, weeksOnChart: 60, country: 'México' },
    { rank: 3, previousRank: 2, songTitle: 'LADY GAGA', artistName: 'Peso Pluma, Gabito Ballesteros, Junior H', streams: 4890000, isPlayerSong: false, peakRank: 1, weeksOnChart: 42, country: 'México' },
    { rank: 4, previousRank: 5, songTitle: 'La Diabla', artistName: 'Xavi', streams: 4520000, isPlayerSong: false, peakRank: 1, weeksOnChart: 30, country: 'México' },
    { rank: 5, previousRank: 4, songTitle: 'TQM', artistName: 'Fuerza Regida', streams: 4230000, isPlayerSong: false, peakRank: 2, weeksOnChart: 36, country: 'México' },
    { rank: 6, previousRank: 6, songTitle: 'Harley Quinn', artistName: 'Fuerza Regida, Marshmello', streams: 3950000, isPlayerSong: false, peakRank: 3, weeksOnChart: 28, country: 'México' },
    { rank: 7, previousRank: 8, songTitle: 'Primera Cita', artistName: 'Carin León', streams: 3710000, isPlayerSong: false, peakRank: 4, weeksOnChart: 50, country: 'México' },
    { rank: 8, previousRank: 7, songTitle: 'Gata Only', artistName: 'FloyyMenor, Cris Mj', streams: 3520000, isPlayerSong: false, peakRank: 2, weeksOnChart: 25, country: 'México' },
    { rank: 9, previousRank: 10, songTitle: 'Poco a Poco', artistName: 'Xavi, Los Dareyes De La Sierra', streams: 3340000, isPlayerSong: false, peakRank: 5, weeksOnChart: 20, country: 'México' },
    { rank: 10, previousRank: 9, songTitle: 'Qlona', artistName: 'Karol G, Peso Pluma', streams: 3180000, isPlayerSong: false, peakRank: 1, weeksOnChart: 38, country: 'México' },
    { rank: 11, previousRank: 12, songTitle: 'CH Y LA PIZZA', artistName: 'Fuerza Regida, Natanael Cano', streams: 2990000, isPlayerSong: false, peakRank: 3, weeksOnChart: 48, country: 'México' },
    { rank: 12, previousRank: 11, songTitle: 'BELLAKEO', artistName: 'Peso Pluma, Anitta', streams: 2840000, isPlayerSong: false, peakRank: 4, weeksOnChart: 24, country: 'México' },
    { rank: 13, previousRank: 14, songTitle: 'PRC', artistName: 'Peso Pluma, Natanael Cano', streams: 2710000, isPlayerSong: false, peakRank: 1, weeksOnChart: 68, country: 'México' },
    { rank: 14, previousRank: 13, songTitle: 'Fin de Semana', artistName: 'Junior H, Oscar Maydon', streams: 2580000, isPlayerSong: false, peakRank: 2, weeksOnChart: 52, country: 'México' },
    { rank: 15, previousRank: 16, songTitle: 'Según Quién', artistName: 'Maluma, Carin León', streams: 2460000, isPlayerSong: false, peakRank: 6, weeksOnChart: 34, country: 'México' },
    { rank: 16, previousRank: 15, songTitle: 'Lou Lou', artistName: 'Gabito Ballesteros, Natanael Cano', streams: 2350000, isPlayerSong: false, peakRank: 7, weeksOnChart: 26, country: 'México' },
    { rank: 17, previousRank: 18, songTitle: 'Si Antes Te Hubiera Conocido', artistName: 'Karol G', streams: 2240000, isPlayerSong: false, peakRank: 8, weeksOnChart: 10, country: 'México' },
    { rank: 18, previousRank: 17, songTitle: 'Alucin', artistName: 'Eugenio Esquivel, Marca Registrada', streams: 2130000, isPlayerSong: false, peakRank: 9, weeksOnChart: 22, country: 'México' },
    { rank: 19, previousRank: 20, songTitle: 'Bebe Dame', artistName: 'Fuerza Regida, Grupo Frontera', streams: 2040000, isPlayerSong: false, peakRank: 1, weeksOnChart: 72, country: 'México' },
    { rank: 20, previousRank: 19, songTitle: 'Que Onda', artistName: 'Calle 24, Chino Pacas, Fuerza Regida', streams: 1950000, isPlayerSong: false, peakRank: 5, weeksOnChart: 32, country: 'México' }
  ],
  'Estados Unidos': [
    { rank: 1, previousRank: 1, songTitle: 'Not Like Us', artistName: 'Kendrick Lamar', streams: 6820000, isPlayerSong: false, peakRank: 1, weeksOnChart: 18, country: 'Estados Unidos' },
    { rank: 2, previousRank: 2, songTitle: 'A Bar Song (Tipsy)', artistName: 'Shaboozey', streams: 6510000, isPlayerSong: false, peakRank: 1, weeksOnChart: 22, country: 'Estados Unidos' },
    { rank: 3, previousRank: 4, songTitle: 'Espresso', artistName: 'Sabrina Carpenter', streams: 6180000, isPlayerSong: false, peakRank: 2, weeksOnChart: 20, country: 'Estados Unidos' },
    { rank: 4, previousRank: 3, songTitle: 'I Had Some Help', artistName: 'Post Malone, Morgan Wallen', streams: 5890000, isPlayerSong: false, peakRank: 1, weeksOnChart: 24, country: 'Estados Unidos' },
    { rank: 5, previousRank: 6, songTitle: 'Good Luck, Babe!', artistName: 'Chappell Roan', streams: 5540000, isPlayerSong: false, peakRank: 4, weeksOnChart: 14, country: 'Estados Unidos' },
    { rank: 6, previousRank: 5, songTitle: 'Birds of a Feather', artistName: 'Billie Eilish', streams: 5290000, isPlayerSong: false, peakRank: 2, weeksOnChart: 16, country: 'Estados Unidos' },
    { rank: 7, previousRank: 8, songTitle: 'Taste', artistName: 'Sabrina Carpenter', streams: 4980000, isPlayerSong: false, peakRank: 2, weeksOnChart: 5, country: 'Estados Unidos' },
    { rank: 8, previousRank: 7, songTitle: 'MILLION DOLLAR BABY', artistName: 'Tommy Richman', streams: 4720000, isPlayerSong: false, peakRank: 2, weeksOnChart: 19, country: 'Estados Unidos' },
    { rank: 9, previousRank: 9, songTitle: 'Lose Control', artistName: 'Teddy Swims', streams: 4460000, isPlayerSong: false, peakRank: 1, weeksOnChart: 42, country: 'Estados Unidos' },
    { rank: 10, previousRank: 11, songTitle: 'Like That', artistName: 'Future, Metro Boomin, Kendrick Lamar', streams: 4230000, isPlayerSong: false, peakRank: 1, weeksOnChart: 26, country: 'Estados Unidos' },
    { rank: 11, previousRank: 10, songTitle: 'Too Sweet', artistName: 'Hozier', streams: 4010000, isPlayerSong: false, peakRank: 1, weeksOnChart: 25, country: 'Estados Unidos' },
    { rank: 12, previousRank: 13, songTitle: 'Fortnight', artistName: 'Taylor Swift, Post Malone', streams: 3820000, isPlayerSong: false, peakRank: 1, weeksOnChart: 20, country: 'Estados Unidos' },
    { rank: 13, previousRank: 12, songTitle: 'Cruel Summer', artistName: 'Taylor Swift', streams: 3640000, isPlayerSong: false, peakRank: 1, weeksOnChart: 92, country: 'Estados Unidos' },
    { rank: 14, previousRank: 15, songTitle: 'Lovin On Me', artistName: 'Jack Harlow', streams: 3480000, isPlayerSong: false, peakRank: 1, weeksOnChart: 38, country: 'Estados Unidos' },
    { rank: 15, previousRank: 14, songTitle: 'Carnival', artistName: 'Kanye West, Ty Dolla $ign', streams: 3310000, isPlayerSong: false, peakRank: 1, weeksOnChart: 28, country: 'Estados Unidos' },
    { rank: 16, previousRank: 17, songTitle: 'Saturn', artistName: 'SZA', streams: 3160000, isPlayerSong: false, peakRank: 6, weeksOnChart: 24, country: 'Estados Unidos' },
    { rank: 17, previousRank: 16, songTitle: 'Greedy', artistName: 'Tate McRae', streams: 3020000, isPlayerSong: false, peakRank: 3, weeksOnChart: 45, country: 'Estados Unidos' },
    { rank: 18, previousRank: 19, songTitle: 'Feather', artistName: 'Sabrina Carpenter', streams: 2890000, isPlayerSong: false, peakRank: 8, weeksOnChart: 36, country: 'Estados Unidos' },
    { rank: 19, previousRank: 18, songTitle: 'Paint The Town Red', artistName: 'Doja Cat', streams: 2760000, isPlayerSong: false, peakRank: 1, weeksOnChart: 48, country: 'Estados Unidos' },
    { rank: 20, previousRank: 20, songTitle: 'Snooze', artistName: 'SZA', streams: 2640000, isPlayerSong: false, peakRank: 2, weeksOnChart: 80, country: 'Estados Unidos' }
  ],
  'Colombia': [
    { rank: 1, previousRank: 1, songTitle: 'LUNA', artistName: 'Feid, ATL Jacob', streams: 3720000, isPlayerSong: false, peakRank: 1, weeksOnChart: 32, country: 'Colombia' },
    { rank: 2, previousRank: 3, songTitle: 'Si Antes Te Hubiera Conocido', artistName: 'Karol G', streams: 3490000, isPlayerSong: false, peakRank: 1, weeksOnChart: 11, country: 'Colombia' },
    { rank: 3, previousRank: 2, songTitle: 'Classy 101', artistName: 'Feid, Young Miko', streams: 3210000, isPlayerSong: false, peakRank: 1, weeksOnChart: 56, country: 'Colombia' },
    { rank: 4, previousRank: 4, songTitle: 'PERRO NEGRO', artistName: 'Bad Bunny, Feid', streams: 2980000, isPlayerSong: false, peakRank: 1, weeksOnChart: 42, country: 'Colombia' },
    { rank: 5, previousRank: 6, songTitle: 'QLONA', artistName: 'Karol G, Peso Pluma', streams: 2790000, isPlayerSong: false, peakRank: 2, weeksOnChart: 38, country: 'Colombia' },
    { rank: 6, previousRank: 5, songTitle: 'Quema', artistName: 'Ryan Castro, Peso Pluma', streams: 2610000, isPlayerSong: false, peakRank: 3, weeksOnChart: 30, country: 'Colombia' },
    { rank: 7, previousRank: 8, songTitle: 'Las Morras', artistName: 'Blessd, Peso Pluma', streams: 2450000, isPlayerSong: false, peakRank: 4, weeksOnChart: 34, country: 'Colombia' },
    { rank: 8, previousRank: 7, songTitle: 'Gata Only', artistName: 'FloyyMenor, Cris Mj', streams: 2320000, isPlayerSong: false, peakRank: 3, weeksOnChart: 22, country: 'Colombia' },
    { rank: 9, previousRank: 10, songTitle: 'Amargura', artistName: 'Karol G', streams: 2190000, isPlayerSong: false, peakRank: 1, weeksOnChart: 64, country: 'Colombia' },
    { rank: 10, previousRank: 9, songTitle: 'MAMICHULA', artistName: 'Blessd, Ryan Castro', streams: 2070000, isPlayerSong: false, peakRank: 5, weeksOnChart: 18, country: 'Colombia' },
    { rank: 11, previousRank: 12, songTitle: 'Griselda', artistName: 'Feid', streams: 1960000, isPlayerSong: false, peakRank: 6, weeksOnChart: 14, country: 'Colombia' },
    { rank: 12, previousRank: 11, songTitle: 'El Cielo', artistName: 'Sky Rompiendo, Feid, Myke Towers', streams: 1860000, isPlayerSong: false, peakRank: 2, weeksOnChart: 44, country: 'Colombia' },
    { rank: 13, previousRank: 14, songTitle: 'Monastery', artistName: 'Ryan Castro, Feid', streams: 1770000, isPlayerSong: false, peakRank: 1, weeksOnChart: 75, country: 'Colombia' },
    { rank: 14, previousRank: 13, songTitle: 'La Falda', artistName: 'Myke Towers', streams: 1680000, isPlayerSong: false, peakRank: 5, weeksOnChart: 26, country: 'Colombia' },
    { rank: 15, previousRank: 16, songTitle: 'PROVENZA', artistName: 'Karol G', streams: 1590000, isPlayerSong: false, peakRank: 1, weeksOnChart: 90, country: 'Colombia' },
    { rank: 16, previousRank: 15, songTitle: 'Según Quién', artistName: 'Maluma, Carin León', streams: 1510000, isPlayerSong: false, peakRank: 7, weeksOnChart: 32, country: 'Colombia' },
    { rank: 17, previousRank: 18, songTitle: 'Chorrito Pa Las Animas', artistName: 'Feid', streams: 1430000, isPlayerSong: false, peakRank: 1, weeksOnChart: 70, country: 'Colombia' },
    { rank: 18, previousRank: 17, songTitle: 'Medallo', artistName: 'Blessd, Justin Quiles, Lenny Tavárez', streams: 1360000, isPlayerSong: false, peakRank: 1, weeksOnChart: 85, country: 'Colombia' },
    { rank: 19, previousRank: 20, songTitle: 'Castigo', artistName: 'Feid', streams: 1290000, isPlayerSong: false, peakRank: 4, weeksOnChart: 50, country: 'Colombia' },
    { rank: 20, previousRank: 19, songTitle: 'La Nena Fina', artistName: 'Farina', streams: 1220000, isPlayerSong: false, peakRank: 12, weeksOnChart: 16, country: 'Colombia' }
  ]
};

// Generates dynamic, varied charts according to time interval (diario, semanal, mensual, anual)
export const generateDynamicCharts = (
  countryName: string,
  timeframe: 'diario' | 'semanal' | 'mensual' | 'anual',
  seedWeek: number = 1
): SpotifyChartEntry[] => {
  const baseList = countryName === 'Global' 
    ? INITIAL_GLOBAL_CHARTS 
    : (COUNTRY_SPECIFIC_CHARTS[countryName] || COUNTRY_SPECIFIC_CHARTS['España']);

  // Make a shallow clone to shuffle and recalculate streams
  const items = [...baseList];

  // Timeframe multiplier and randomization factors
  let streamMultiplier = 1;
  let shuffleChance = 0.2;

  switch (timeframe) {
    case 'diario':
      streamMultiplier = 0.16; // ~300k to 1.2M streams daily
      shuffleChance = 0.45; // High daily volatility
      break;
    case 'semanal':
      streamMultiplier = 1.0;  // Standard weekly
      shuffleChance = 0.20;
      break;
    case 'mensual':
      streamMultiplier = 4.2;  // ~10M to 40M streams monthly
      shuffleChance = 0.12;
      break;
    case 'anual':
      streamMultiplier = 48.0; // ~100M to 450M streams yearly
      shuffleChance = 0.35; // Different order representing the biggest accumulated hits
      break;
  }

  // Deterministic shuffle with seedWeek and timeframe
  const offset = (seedWeek * 3 + (timeframe === 'diario' ? 7 : timeframe === 'anual' ? 19 : timeframe === 'mensual' ? 11 : 0)) % items.length;

  const shifted = items.map((item, idx) => {
    const rawPos = (idx + offset) % items.length;
    const shouldShift = ((idx + seedWeek) % 4 === 0);
    const pos = shouldShift ? rawPos : idx;
    
    // Variance on streams
    const streamNoise = 1 + (((idx * 17 + seedWeek * 13) % 25) - 12) / 100;
    const calcStreams = Math.floor(item.streams * streamMultiplier * streamNoise);

    const prevRankDelta = ((idx * 3 + seedWeek) % 7) - 3;
    const prevRank = Math.max(1, Math.min(20, (idx + 1) + prevRankDelta));

    return {
      ...items[pos],
      country: countryName,
      rank: idx + 1,
      previousRank: prevRank,
      streams: calcStreams,
      weeksOnChart: timeframe === 'anual' ? Math.floor(item.weeksOnChart * 2) : item.weeksOnChart
    };
  });

  // Sort strictly by streams descending to guarantee rank accuracy
  shifted.sort((a, b) => b.streams - a.streams);

  return shifted.map((entry, i) => ({
    ...entry,
    rank: i + 1
  }));
};

export const generateCountryCharts = (countryName: string): SpotifyChartEntry[] => {
  return generateDynamicCharts(countryName, 'semanal', 1);
};
