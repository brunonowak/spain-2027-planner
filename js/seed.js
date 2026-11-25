// Starter content: the four route options and a few idea cards per city.
// Anyone can add, edit or delete cards afterwards from the phone site.
// `wiki` is an English Wikipedia article title used to fetch a photo automatically.

export const TRIP_START = '2027-04-21'; // first night in Spain
export const TRIP_END = '2027-05-06';   // fly home

export const ROUTES = [
  {
    id: 'r1', order: 1, name: 'Andalusia classics',
    tagline: 'Seville + Granada, with a Córdoba stop on the way',
    bases: [{ city: 'madrid', nights: 3 }, { city: 'seville', nights: 5 }, { city: 'granada', nights: 4 }, { city: 'madrid', nights: 3 }],
    legs: ['Madrid → Seville: AVE ~2h30', 'Seville → Granada: private transfer via Córdoba (Mezquita + lunch)', 'Granada → Madrid: AVE ~3h20–3h30'],
    notes: 'Alhambra tickets sell out early. Rail line to Andalusia had a closure in late 2026; book flexible fares.',
  },
  {
    id: 'r2', order: 2, name: 'Andalusia + coast',
    tagline: 'Seville + Málaga — every leg 3 hours or less',
    bases: [{ city: 'madrid', nights: 3 }, { city: 'seville', nights: 5 }, { city: 'malaga', nights: 4 }, { city: 'madrid', nights: 3 }],
    legs: ['Madrid → Seville: AVE ~2h30', 'Seville → Málaga: private transfer via Ronda (gorge + lunch)', 'Málaga → Madrid: AVE ~2h40'],
    notes: 'Alhambra as a day trip from Málaga. Beach time in May.',
  },
  {
    id: 'r3', order: 3, name: 'Valencia + Seville',
    tagline: 'Paella country, then Andalusia',
    bases: [{ city: 'madrid', nights: 3 }, { city: 'valencia', nights: 4 }, { city: 'seville', nights: 5 }, { city: 'madrid', nights: 3 }],
    legs: ['Madrid → Valencia: ~1h50', 'Valencia → Seville: one direct AVE ~4h20 (1–2 a day)', 'Seville → Madrid: AVE ~2h30'],
    notes: 'One long travel day (Valencia → Seville).',
  },
  {
    id: 'r4', order: 4, name: 'Green north',
    tagline: 'Asturias + León — no Andalusia',
    bases: [{ city: 'madrid', nights: 4 }, { city: 'oviedo', nights: 4 }, { city: 'leon', nights: 3 }, { city: 'madrid', nights: 4 }],
    legs: ['Madrid → Oviedo: ~3h15', 'Oviedo → León: ~1h', 'León → Madrid: ~2h05'],
    notes: 'Cooler and wetter in late April. Cider houses and mountains.',
  },
];

const c = (id, city, cat, title, pitch, wiki, time, cost, booking) => ({ id, city, cat, title, pitch, wiki, time, cost, booking });

export const CARDS = [
  // Madrid
  c('mad-prado', 'madrid', 'sight', 'Prado Museum', 'Velázquez, Goya and Bosch in one of the world’s great art museums.', 'Museo_del_Prado', '3h', '€', 'Timed ticket recommended'),
  c('mad-palace', 'madrid', 'sight', 'Royal Palace', 'Europe’s largest royal palace by floor area — lavish state rooms and armoury.', 'Royal_Palace_of_Madrid', '2h', '€', 'Timed ticket recommended'),
  c('mad-retiro', 'madrid', 'sight', 'Retiro Park', 'Rowboats, the Crystal Palace and a slow afternoon stroll.', 'Buen_Retiro_Park', '2h', 'Free', 'No'),
  c('mad-tapas', 'madrid', 'food', 'Tapas crawl in La Latina', 'Hop between Cava Baja bars for vermouth, croquetas and huevos rotos.', 'La_Latina', 'Evening', '€€', 'No'),
  c('mad-sanmiguel', 'madrid', 'food', 'Mercado de San Miguel', 'Iron-and-glass market hall for a grazing lunch.', 'Mercado_de_San_Miguel', '1h', '€€', 'No'),
  c('mad-toledo', 'madrid', 'daytrip', 'Toledo day trip', 'Hilltop city of three cultures — cathedral, synagogues and El Greco. 33 min by train.', 'Toledo,_Spain', 'Full day', '€€', 'Train tickets'),
  c('mad-segovia', 'madrid', 'daytrip', 'Segovia day trip', 'Roman aqueduct, fairy-tale Alcázar and roast suckling pig.', 'Aqueduct_of_Segovia', 'Full day', '€€', 'Train tickets'),

  // Seville
  c('sev-alcazar', 'seville', 'sight', 'Real Alcázar', 'Mudéjar palace and gardens — still a royal residence.', 'Alcázar_of_Seville', '2–3h', '€', 'Timed tickets — book ahead'),
  c('sev-cathedral', 'seville', 'sight', 'Cathedral & Giralda', 'The world’s largest Gothic cathedral; climb the ramps of the Giralda tower.', 'Seville_Cathedral', '2h', '€', 'Book ahead'),
  c('sev-plaza', 'seville', 'sight', 'Plaza de España', 'Sweeping tiled plaza and canal in María Luisa Park.', 'Plaza_de_España_(Seville)', '1h', 'Free', 'No'),
  c('sev-flamenco', 'seville', 'experience', 'Flamenco in Triana', 'An intimate tablao show in the neighbourhood where flamenco grew up.', 'Triana,_Seville', 'Evening', '€€', 'Book ahead'),
  c('sev-horses', 'seville', 'daytrip', 'Jerez: dancing horses', 'Royal Andalusian School of Equestrian Art show — Kim’s pick. Pair with a sherry bodega.', 'Royal_Andalusian_School_of_Equestrian_Art', 'Full day', '€€', 'Show tickets — book ahead'),
  c('sev-ronda', 'seville', 'daytrip', 'Ronda', 'Town split by a dramatic gorge and the Puente Nuevo bridge.', 'Ronda', 'Full day', '€€', 'Tour or driver'),
  c('sev-salmorejo', 'seville', 'food', 'Andalusian tapas', 'Salmorejo, jamón ibérico, espinacas con garbanzos — tapas bar hopping.', 'Salmorejo', 'Evening', '€€', 'No'),

  // Granada
  c('gra-alhambra', 'granada', 'sight', 'Alhambra & Generalife', 'Moorish palaces and gardens — the highlight of Granada.', 'Alhambra', '3–4h', '€', 'Book months ahead — named tickets'),
  c('gra-albaicin', 'granada', 'sight', 'Albaicín at sunset', 'Wander the old Moorish quarter to Mirador de San Nicolás for the Alhambra view.', 'Albaicín', '2h', 'Free', 'No'),
  c('gra-sacromonte', 'granada', 'experience', 'Sacromonte cave flamenco', 'Flamenco in whitewashed caves carved into the hillside.', 'Sacromonte', 'Evening', '€€', 'Book ahead'),
  c('gra-tapas', 'granada', 'food', 'Free tapas with every drink', 'Granada still serves a free tapa with each drink — a classic night out.', 'Tapas', 'Evening', '€', 'No'),
  c('gra-cordoba', 'granada', 'daytrip', 'Córdoba Mezquita stop', 'Forest of striped arches in the Mosque–Cathedral; lunch stop on the transfer.', 'Mosque–Cathedral_of_Córdoba', 'Half day', '€', 'Timed ticket'),

  // Málaga
  c('mal-alcazaba', 'malaga', 'sight', 'Alcazaba & Gibralfaro', 'Moorish fortress climbing the hill above the port.', 'Alcazaba_of_Málaga', '2h', '€', 'No'),
  c('mal-picasso', 'malaga', 'sight', 'Picasso Museum', 'Picasso’s birthplace honours him in a Renaissance palace.', 'Museo_Picasso_Málaga', '2h', '€', 'Timed ticket'),
  c('mal-alhambra', 'malaga', 'daytrip', 'Alhambra day trip', 'Granada’s Moorish palaces, about 1h30 away by car or bus.', 'Alhambra', 'Full day', '€€', 'Book months ahead — named tickets'),
  c('mal-frigiliana', 'malaga', 'daytrip', 'Nerja & Frigiliana', 'Clifftop Balcón de Europa and a white village in the hills.', 'Frigiliana', 'Full day', '€€', 'Driver or tour'),
  c('mal-caminito', 'malaga', 'experience', 'Caminito del Rey', 'Walkway pinned to the walls of a gorge — spectacular, not for vertigo.', 'Caminito_del_Rey', 'Half day', '€', 'Timed ticket — book ahead'),
  c('mal-espetos', 'malaga', 'food', 'Espetos on the beach', 'Sardines grilled on skewers over driftwood fires at a chiringuito.', 'Espeto', 'Lunch', '€', 'No'),

  // Valencia
  c('val-arts', 'valencia', 'sight', 'City of Arts & Sciences', 'Futuristic white complex with Europe’s largest aquarium.', 'City_of_Arts_and_Sciences', 'Half day', '€€', 'Tickets'),
  c('val-paella', 'valencia', 'food', 'Paella in the Albufera', 'Real Valencian paella cooked over wood in the rice fields, then a lagoon boat ride.', 'Albufera_(Valencia)', 'Half day', '€€', 'Book restaurant'),
  c('val-market', 'valencia', 'food', 'Central Market & old town', 'Modernista market hall, Silk Exchange and cathedral.', 'Central_Market_of_Valencia', 'Half day', '€', 'No'),
  c('val-horchata', 'valencia', 'food', 'Horchata & fartons', 'Tiger-nut drink with sweet dunking pastries — a Valencia ritual.', 'Horchata', '1h', '€', 'No'),

  // Oviedo
  c('ovi-cider', 'oviedo', 'food', 'Cider house night', 'Poured from overhead in a sidrería on Calle Gascona, with Asturian plates.', 'Oviedo', 'Evening', '€€', 'No'),
  c('ovi-covadonga', 'oviedo', 'daytrip', 'Covadonga & Picos de Europa', 'Cave shrine, basilica and glacial lakes in the mountains.', 'Covadonga', 'Full day', '€€', 'Tour or driver'),
  c('ovi-gijon', 'oviedo', 'daytrip', 'Gijón & fishing villages', 'Seaside city plus Cudillero’s colourful harbour.', 'Cudillero', 'Full day', '€€', 'Driver or tour'),
  c('ovi-fabada', 'oviedo', 'food', 'Fabada asturiana', 'Hearty bean stew with chorizo and morcilla.', 'Fabada_asturiana', 'Lunch', '€', 'No'),

  // León
  c('leo-cathedral', 'leon', 'sight', 'León Cathedral', '1,800 m² of medieval stained glass — the “House of Light”.', 'León_Cathedral', '1–2h', '€', 'No'),
  c('leo-humedo', 'leon', 'food', 'Barrio Húmedo tapas', 'Tapas quarter where drinks still come with a free tapa.', 'León,_Spain', 'Evening', '€', 'No'),
  c('leo-astorga', 'leon', 'daytrip', 'Astorga', 'Gaudí’s Episcopal Palace and a chocolate museum, 45 min away.', 'Episcopal_Palace_of_Astorga', 'Half day', '€', 'No'),
];
