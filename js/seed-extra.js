// Hotels, restaurants, tastes and shops for every city, plus the moves between bases.
// Researched Nov 2026. "~" prices are estimates; hotel rates are typical late-April room rates.
const maps = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

// hotel(id, city, name, pitch, area, perNight, note, highlights, tip, wiki?)
const hotel = (id, city, title, pitch, time, cost, booking, highlights, tip, wiki = '') =>
  ({ id, city, cat: 'hotel', title, pitch, time, cost, booking, highlights, tip, wiki, link: maps(`${title} ${CITY[city]}`) });
// eat(id, city, name, pitch, meal, cost, booking, highlights, tip)
const eat = (id, city, title, pitch, time, cost, booking, highlights, tip) =>
  ({ id, city, cat: 'restaurant', title, pitch, time, cost, booking, highlights, tip, link: maps(`${title} ${CITY[city]}`) });
const taste = (id, city, title, pitch, wiki, highlights, tip, cost = '') =>
  ({ id, city, cat: 'dish', title, pitch, wiki, highlights, tip, cost, time: 'Any meal', booking: 'No' });
const shop = (id, city, title, pitch, time, cost, booking, highlights, tip, q) =>
  ({ id, city, cat: 'shop', title, pitch, time, cost, booking, highlights, tip, link: maps(q || `${title} ${CITY[city]}`) });

const CITY = { madrid: 'Madrid', seville: 'Sevilla', granada: 'Granada', malaga: 'Málaga', valencia: 'Valencia', oviedo: 'Oviedo', leon: 'León' };
const SHIP = 'Olive oil, saffron, wine, sherry, turrón and tinned fish are fine in checked bags or shipped. Jamón and other cured meats can’t go into the US.';

export const EXTRA_CARDS = [
  // ---------------- MADRID ----------------
  hotel('mad-h-westin', 'madrid', 'The Westin Palace', '1912 grand hotel facing the Prado, under its famous glass dome.', 'Barrio de las Letras', '~€300–400 / night', 'Marriott Bonvoy — points & Silver perks', ['Walk to the Prado, Retiro and Sol', 'Glass-domed La Rotonda lounge', 'Big rooms by Madrid standards'], 'Book direct on Marriott to use Bonvoy status.', 'Westin_Palace_Madrid'),
  hotel('mad-h-ingles', 'madrid', 'Gran Hotel Inglés', 'Art Deco boutique hotel, Madrid’s oldest, in the literary quarter.', 'Barrio de las Letras', '~€300–400 / night', 'Small 5★ — book early', ['Five minutes to Sol and Plaza Santa Ana', 'Lovely lobby bar', 'Quiet street'], 'Ask for an upper floor for light.'),
  hotel('mad-h-onlyyou', 'madrid', 'Only YOU Boutique Hotel', 'Design hotel in a 19th-century palace in lively Chueca.', 'Chueca', '~€200–300 / night', 'Good value 4★', ['Stylish rooms and all-day bar', 'Chueca and Salamanca shopping nearby', 'Metro on the doorstep'], 'Chueca is lively at night — ask for an inside room if you sleep lightly.'),
  hotel('mad-h-urso', 'madrid', 'Hotel Urso', 'Calm 5★ with a spa in an early-1900s building.', 'Chamberí / Chueca border', '~€300–400 / night', 'Small luxury hotel', ['Spa and pool', 'Quieter residential area', 'Easy taxis to sights'], 'A good reset for the last Madrid nights before flying home.'),
  eat('mad-r-bola', 'madrid', 'Taberna La Bola', 'Family-run since 1870 — cocido madrileño cooked in clay pots over wood.', 'Lunch', '~€35–45', 'Book ahead', ['Cocido in two courses: broth, then meats & chickpeas', 'Old-Madrid red façade', 'Near the Royal Palace'], 'Cocido is a big lunch — skip breakfast.'),
  eat('mad-r-viuda', 'madrid', 'Viuda de Vacas', 'Old-school La Latina tavern for home cooking and croquetas.', 'Dinner', '~€30–40', 'Book ahead', ['Gallina en pepitoria (chicken in almond sauce)', 'Croquetas', 'Simple service, local crowd'], 'Pair with a Cava Baja tapas walk before or after.'),
  eat('mad-r-ciriaco', 'madrid', 'Casa Ciriaco', 'Classic Austrias restaurant for roast suckling pig and stews.', 'Lunch or dinner', '~€35–50', 'Book ahead', ['Roast suckling pig (cochinillo)', 'Seasonal partridge and judiones', 'Steps from the Royal Palace'], 'A good alternative to the touristy Botín.'),
  eat('mad-r-dani', 'madrid', 'Casa Dani', 'Market bar famous for one of Madrid’s best tortillas.', 'Lunch', '~€15–25', 'No — arrive by 1pm', ['Tortilla de patatas', 'Daily set lunch', 'Inside Mercado de la Paz, Salamanca'], 'Combine with Serrano Street shopping.'),
  taste('mad-t-cocido', 'madrid', 'Cocido madrileño', 'Madrid’s chickpea-and-meat stew, served in courses.', 'Cocido_madrileño', ['Noodle broth first', 'Chickpeas, vegetables, beef, chicken, chorizo'], 'A winter dish, but traditional taverns serve it year-round at lunch.'),
  taste('mad-t-calamares', 'madrid', 'Bocadillo de calamares', 'Fried squid rings in a crusty roll — Madrid’s street-food classic.', 'Bocadillo_de_calamares', ['Bars around Plaza Mayor', 'Quick, cheap lunch'], 'Add a squeeze of lemon and a caña.', '~€4–6'),
  taste('mad-t-churros', 'madrid', 'Churros con chocolate', 'Fried dough dipped in thick hot chocolate — Chocolatería San Ginés since 1894.', 'Churro', ['Churros (thin) vs porras (thick)', 'San Ginés is open late'], 'Great after a late dinner.', '~€5–8'),
  taste('mad-t-tortilla', 'madrid', 'Tortilla de patatas', 'Spanish potato omelette — Madrid likes it runny inside.', 'Spanish_omelette', ['Ask for it “poco hecha” for the runny version'], 'Casa Dani and many bars serve it by the slice.', '~€3–5'),
  shop('mad-s-diego', 'madrid', 'Casa de Diego', 'Family fan-and-umbrella maker on Puerta del Sol since 1858.', 'Puerta del Sol', 'Fans ~€20–200', 'No', ['Hand-painted fans', 'Umbrellas and walking sticks', 'Shop unchanged in decades'], 'Light and easy to pack.', 'Casa de Diego Puerta del Sol Madrid'),
  shop('mad-s-ramirez', 'madrid', 'Guitarras Ramírez', 'Legendary Madrid guitar workshop, open since 1882.', 'Centro', 'Guitars from a few hundred €', 'No', ['Hand-built classical & flamenco guitars', 'Worth a look even if not buying'], 'They can advise on flying or shipping a guitar.'),
  shop('mad-s-favorita', 'madrid', 'La Favorita (hats)', 'Historic hat shop on Plaza Mayor.', 'Plaza Mayor', 'Hats ~€40–150', 'No', ['Panamas, berets, flat caps'], 'A good sun hat for Andalusia.', 'Sombrerería La Favorita Plaza Mayor Madrid'),
  shop('mad-s-serrano', 'madrid', 'Calle Serrano (fashion)', 'Madrid’s main fashion street — Spanish brands and flagships.', 'Salamanca', '€€–€€€€', 'No', ['Loewe flagship (Spanish leather house)', 'Spanish brands like Massimo Dutti and Bimba y Lola', 'El Corte Inglés Gourmet Club for food gifts'], 'Non-EU residents can claim the VAT back — ask for a tax-free form.', 'Calle de Serrano Madrid'),

  // ---------------- SEVILLE ----------------
  hotel('sev-h-corral', 'seville', 'Hotel Corral del Rey', 'Restored 17th-century noble house with Roman columns and a rooftop.', 'Barrio Alfalfa', '~€300–450 / night', 'Small — book early', ['Rooftop plunge pool', 'Quiet, central lanes', 'Walk to the cathedral'], 'Rooms vary a lot — check the room type.'),
  hotel('sev-h-poeta', 'seville', 'Hotel Casa del Poeta', 'Moorish-style 17th-century house with 17 rooms around a patio.', 'Santa Cruz (Jewish Quarter)', '~€200–300 / night', 'Small — book early', ['Patio and roof terrace', 'Steps from the Alcázar', 'Quiet lanes at night'], 'Cars can’t reach the door; taxis drop nearby.'),
  hotel('sev-h-mercer', 'seville', 'Hotel Mercer Sevilla', 'Reconstructed palace with a rooftop pool, near the river.', 'El Arenal', '~€350–450 / night', '5★ boutique', ['Rooftop pool with cathedral views', 'Near the bullring and Triana bridge'], 'Late April is warm — a pool matters.'),
  hotel('sev-h-alfonso', 'seville', 'Hotel Alfonso XIII', 'Seville’s grand 1929 palace hotel, next to the Alcázar gardens.', 'Next to the Alcázar', '~€450+ / night (over budget)', 'Marriott Bonvoy — Luxury Collection', ['Neo-Mudéjar courtyards', 'Outdoor pool in gardens'], 'Worth pricing with Bonvoy points.', 'Hotel_Alfonso_XIII'),
  eat('sev-r-rinconcillo', 'seville', 'El Rinconcillo', 'Seville’s oldest bar (1670) — tiles, hams and tapas.', 'Lunch or dinner', '~€25–35', 'No for the bar', ['Espinacas con garbanzos', 'Bacalao fried in batter', 'Tab chalked on the bar'], 'Stand at the bar for the real experience.'),
  eat('sev-r-estrella', 'seville', 'Bar Estrella', 'Old-town tavern known for solomillo al whisky.', 'Dinner', '~€25–35', 'No', ['Solomillo al whisky', 'Classic Seville tapas', 'Near the cathedral'], 'Good after the Alcázar or cathedral.'),
  eat('sev-r-eslava', 'seville', 'Eslava', 'Much-loved San Lorenzo bar-restaurant with inventive tapas.', 'Dinner', '~€30–40', 'Restaurant side: book', ['Honey-glazed ribs', 'Egg on mushroom cake', 'Local crowd'], 'The bar doesn’t take bookings — arrive at opening.'),
  eat('sev-r-teresas', 'seville', 'Las Teresas', 'Tiny classic in Santa Cruz with hams hanging from the ceiling.', 'Lunch', '~€20–30', 'No', ['Jamón ibérico de bellota', 'Cold tapas and sherry'], 'An easy lunch stop in the Jewish Quarter.'),
  taste('sev-t-salmorejo', 'seville', 'Salmorejo', 'Cold, thick tomato-bread cream topped with egg and ham.', 'Salmorejo', ['Cooler than gazpacho, richer', 'Perfect on a warm April day'], 'Almost every bar has its own version.', '~€4–8'),
  taste('sev-t-espinacas', 'seville', 'Espinacas con garbanzos', 'Spinach and chickpeas with cumin — Moorish-rooted comfort food.', 'Espinacas_con_garbanzos', ['El Rinconcillo’s is famous'], 'Vegetarian-friendly classic.', '~€4–6'),
  taste('sev-t-solomillo', 'seville', 'Solomillo al whisky', 'Pork tenderloin in a garlicky whisky-and-oil sauce.', '', ['Mop up the sauce with bread'], 'Bar Estrella is a classic place for it.', '~€5–10'),
  taste('sev-t-yemas', 'seville', 'Convent sweets (yemas)', 'Egg-yolk sweets sold by cloistered nuns through a turning window.', 'Yemas_de_Santa_Teresa', ['San Leandro convent is the best known'], 'Ring the bell, order, leave money on the turntable.', '~€10 a box'),
  shop('sev-s-triana', 'seville', 'Triana ceramics', 'The potters’ quarter: hand-painted tiles and plates.', 'Triana — Calle Alfarería & San Jorge', 'Tiles ~€10+, plates ~€25+', 'No', ['Cerámica Santa Ana (since 1870)', 'Triana ceramics museum nearby', 'Custom tiles possible'], 'Most shops will pack or ship — ask for a quote.', 'Cerámica Santa Ana Triana Sevilla'),
  shop('sev-s-sierpes', 'seville', 'Calle Sierpes & Tetuán', 'Seville’s shopping streets — fans, shawls, flamenco fashion.', 'Old town', '€–€€€', 'No', ['Hand-painted fans and Manila shawls', 'Flamenco dresses and accessories', 'Spanish high-street brands'], 'Quality fans start around €30; cheaper ones are printed.', 'Calle Sierpes Sevilla'),
  shop('sev-s-mercado', 'seville', 'Mercado de Triana', 'Covered food market for olive oil, saffron and sherry to take home.', 'Triana, by the bridge', '€–€€', 'No', ['Olive oil, saffron, spices', 'Tapas bars inside'], SHIP, 'Mercado de Triana Sevilla'),

  // ---------------- GRANADA ----------------
  hotel('gra-h-paula', 'granada', 'Palacio de Santa Paula', '16th-century convent turned design hotel, with cloister and courtyards.', 'Gran Vía, near the cathedral', '~€200–300 / night', 'Marriott Bonvoy — Autograph Collection', ['Original Moorish house and cloister', 'Flat walk to the centre', 'Taxi to the Alhambra in minutes'], 'Bonvoy status applies.'),
  hotel('gra-h-1800', 'granada', 'Hotel Casa 1800 Granada', '16th-century house in the Albaicín with 25 rooms.', 'Albaicín, by the river Darro', '~€150–250 / night', 'Small — book early', ['Afternoon tea and sweets included', 'Walk to Paseo de los Tristes', 'Some rooms with Alhambra views'], 'Albaicín lanes are steep and cobbled.'),
  hotel('gra-h-ines', 'granada', 'Palacio de Santa Inés', 'Two 16th-century Mudéjar houses on a tiny square.', 'Albaicín', '~€150–250 / night', 'Small boutique', ['Painted ceilings and patio', 'Top-floor lounge with views'], 'Great for sunset walks to San Nicolás.'),
  hotel('gra-h-parador', 'granada', 'Parador de Granada', 'A 15th-century convent inside the Alhambra grounds.', 'Inside the Alhambra', '~€400+ / night', 'Books out far ahead', ['Stay inside the Alhambra walls', 'Gardens and terrace'], 'Doesn’t include Nasrid Palaces tickets — still book those.', 'Parador_de_Granada'),
  eat('gra-r-castaneda', 'granada', 'Bodegas Castañeda', 'Granada institution since 1927 — wine barrels, hams, free tapas.', 'Lunch or dinner', '~€20–30', 'No', ['Iberian cold cuts and cheeses', 'Cod with prawns, croquetas', 'Vermouth from the barrel'], 'Busy and loud — go early.'),
  eat('gra-r-julio', 'granada', 'Bar Casa Julio', 'Tiny fried-fish bar near Plaza Nueva, open since 1947.', 'Lunch', '~€15–25', 'No', ['Fried eggplant with honey', 'Marinated anchovies, squid'], 'Standing room only — perfect for a quick lunch.'),
  eat('gra-r-tana', 'granada', 'Taberna La Tana', 'Wine-lover’s tavern in Realejo with ~600 labels.', 'Dinner', '~€25–40', 'No — arrive early', ['Cured Iberian meats', 'Tomato salads, anchovies', 'Wine pairings from the owner'], 'Small and popular; go at opening.'),
  eat('gra-r-kiki', 'granada', 'Bar Kiki', 'Upper-Albaicín bar with Alhambra views.', 'Lunch', '~€25–35', 'No', ['Almadraba tuna', 'Fried fish', 'Sweet wines'], 'Combine with the San Nicolás viewpoint.'),
  taste('gra-t-piononos', 'granada', 'Piononos', 'Tiny syrup-soaked sponge rolls with toasted cream, from Santa Fe.', 'Pionono', ['Best with coffee'], 'Bakeries around Plaza Bib-Rambla sell them.', '~€2 each'),
  taste('gra-t-habas', 'granada', 'Habas con jamón', 'Young broad beans sautéed with ham — a Granada spring dish.', '', ['In season in April'], 'Ask for it as a ración to share.', '~€8–12'),
  taste('gra-t-remojon', 'granada', 'Remojón granadino', 'Orange, cod, olive and onion salad.', '', ['Refreshing, Moorish-influenced'], 'A light lunch in the heat.', '~€6–10'),
  taste('gra-t-tapas', 'granada', 'Free tapas culture', 'Order a drink, get a tapa — each round brings a new one.', 'Tapas', ['Bigger tapas with each round', 'Bar-hop rather than sit'], 'Three drinks can make dinner.'),
  shop('gra-s-alcaiceria', 'granada', 'Alcaicería', 'The old Moorish silk market — lanes of lamps, ceramics and textiles.', 'Next to the cathedral', '€–€€', 'No', ['Moroccan-style lamps', 'Fajalauza ceramics', 'Leather goods'], 'Haggle at stalls (not in proper shops).', 'Alcaicería Granada'),
  shop('gra-s-fajalauza', 'granada', 'Fajalauza ceramics', 'Granada’s own pottery: green-or-blue designs on white glaze.', 'Albaicín & Alcaicería', 'Plates ~€15–60', 'No', ['Pomegranate motifs', 'Made in Granada for 500 years'], 'Wrap well — or ask the shop to ship.', 'Cerámica Fajalauza Granada'),
  shop('gra-s-taracea', 'granada', 'Taracea (inlaid wood)', 'Moorish-style marquetry boxes and chess sets.', 'Albaicín & Alcaicería', 'Boxes ~€20–150', 'No', ['Bone, mother-of-pearl and wood inlay', 'Small boxes pack easily'], 'For furniture, get shipping and import costs in writing first.', 'taracea Granada artesanía'),

  // ---------------- MÁLAGA ----------------
  hotel('mal-h-solecio', 'malaga', 'Palacio Solecio', '18th-century palace with Moorish touches and a pool.', 'Historic centre', '~€250–350 / night', 'Small Luxury Hotels', ['Restaurant by chef José Carlos García', 'Rooftop pool', 'Steps from Picasso Museum'], 'Ask about cathedral-view rooms.'),
  hotel('mal-h-molina', 'malaga', 'Hotel Molina Lario', 'Contemporary 4★ opposite the cathedral, with rooftop views.', 'Opposite the cathedral', '~€180–250 / night', 'Good value', ['Rooftop pool and bar', 'Walk to the port and Calle Larios'], 'Best value of the central hotels.'),
  hotel('mal-h-bedfor', 'malaga', 'Cristine Bedfor Málaga', 'Boutique 4★ in a restored 19th-century mansion.', 'Old town', '~€230–320 / night', 'Boutique', ['Rooftop with pool', 'Beautiful interiors'], 'Rooms are cosy — check sizes.'),
  hotel('mal-h-miramar', 'malaga', 'Gran Hotel Miramar', '1920s seafront palace with a spa, on La Malagueta beach.', 'Seafront, La Malagueta', '~€270–400 / night', '5★ Grand Luxe', ['Beach across the road', 'Spa and pools', '15-minute walk to the centre'], 'Best pick if beach time matters.', 'Gran_Hotel_Miramar_(Málaga)'),
  eat('mal-r-lola', 'malaga', 'Casa Lola', 'Vermouth on tap and classic tapas among vintage adverts.', 'Lunch or dinner', '~€20–30', 'No — expect a short wait', ['Vermouth from the tap', 'Montaditos and croquetas'], 'Several branches; the original is near Calle Granada.'),
  eat('mal-r-merchanas', 'malaga', 'Las Merchanas', 'Tapas bar covered in Holy Week memorabilia.', 'Dinner', '~€20–30', 'No', ['Flamenquín (breaded rolled pork)', 'Croquetas'], 'A very Málaga atmosphere.'),
  eat('mal-r-tintero', 'malaga', 'El Tintero', 'Beachside fish restaurant where waiters shout dishes and you grab what you want.', 'Lunch', '~€25–35', 'No', ['Espetos and fried fish', 'Pay by counting plates', 'Right on El Palo beach'], 'Lively and chaotic — a real Málaga experience.'),
  eat('mal-r-guardia', 'malaga', 'Antigua Casa de Guardia', 'Wine bar since 1840 pouring Málaga wines from the barrel.', 'Aperitif', '~€10–15', 'No', ['Sweet Málaga moscatel', 'Prawns and mussels', 'Tab chalked on the counter'], 'Go before dinner — it’s a quick-stop bar.'),
  taste('mal-t-espetos', 'malaga', 'Espetos de sardinas', 'Sardines on skewers roasted over driftwood fires on the beach.', 'Espeto', ['Best in months without an “r” — but fine in spring'], 'Eat with your hands.', '~€5–8'),
  taste('mal-t-porra', 'malaga', 'Porra antequerana', 'Thick cold tomato soup from nearby Antequera.', 'Porra_antequerana', ['Topped with ham and egg'], 'Like salmorejo, but thicker.', '~€5–8'),
  taste('mal-t-ajoblanco', 'malaga', 'Ajoblanco', 'Chilled almond-and-garlic soup with grapes.', 'Ajoblanco', ['Moorish-era recipe'], 'Refreshing on a warm day.', '~€5–8'),
  taste('mal-t-wine', 'malaga', 'Málaga sweet wine', 'Raisin-sweet moscatel and Pedro Ximénez wines.', 'Málaga_(wine)', ['Try at Antigua Casa de Guardia'], 'Great with dessert or cheese.', '~€2–4 a glass'),
  shop('mal-s-larios', 'malaga', 'Calle Larios (fashion)', 'Málaga’s elegant marble shopping street.', 'Historic centre', '€–€€€', 'No', ['Spanish brands and boutiques', 'Side streets with independent shops'], 'Shops close 2–5pm in some places; big brands stay open.', 'Calle Larios Málaga'),
  shop('mal-s-atarazanas', 'malaga', 'Mercado de Atarazanas', 'Food market in a 19th-century iron hall with a Moorish gate.', 'Centre', '€', 'No', ['Olive oil, almonds, sweet wine', 'Fruit and fish stalls', 'Tapas bars inside'], SHIP, 'Mercado Central de Atarazanas Málaga'),
  shop('mal-s-recova', 'malaga', 'La Recova', 'Café-shop selling handmade crafts and local delicacies.', 'Centre', '€–€€', 'No', ['Ceramics and crafts', 'Breakfast café'], 'Pair with breakfast there.', 'La Recova Málaga'),

  // ---------------- VALENCIA ----------------
  hotel('val-h-caro', 'valencia', 'Caro Hotel', '19th-century palace beside the cathedral with Roman and Moorish walls inside.', 'Seu-Xerea, by the cathedral', '~€200–300 / night', 'Boutique', ['26 individually designed rooms', 'Michelin-starred restaurant', 'Walk to La Lonja and the market'], 'One of Spain’s most interesting boutique hotels.'),
  hotel('val-h-clara', 'valencia', 'Palacio Santa Clara', '1916 modernist building with a rooftop pool.', 'Near Calle Colón', '~€200–300 / night', 'Marriott Bonvoy — Autograph Collection', ['Rooftop bar and pool', 'Art Deco rooms'], 'Bonvoy status applies.'),
  hotel('val-h-vallier', 'valencia', 'Palacio Vallier', '5★ 19th-century mansion with 31 rooms and a rooftop terrace.', 'Old town, near the Lonja', '~€250–350 / night', 'Small 5★', ['Baroque and Art Deco touches', 'Rooftop terrace'], 'Quiet and central.'),
  hotel('val-h-oneshot', 'valencia', 'One Shot Palacio Reina Victoria', 'Valencia’s first hotel (1913), stylishly renovated.', 'Central, near City Hall', '~€150–220 / night', 'Good value', ['Next to the station and bullring', 'Photography exhibits'], 'Handy for the long train to Seville.'),
  eat('val-r-carmela', 'valencia', 'Casa Carmela', 'Paella cooked over orange-wood fires since the 1920s.', 'Lunch', '~€40–55', 'Book well ahead', ['Paella valenciana and seafood paellas', 'By Malvarrosa beach'], 'Paella is lunch-only; pre-order your rice when booking.'),
  eat('val-r-montana', 'valencia', 'Bodega Casa Montaña', 'Historic tavern (1836) in the fishermen’s quarter, El Cabanyal.', 'Dinner', '~€35–50', 'Book ahead', ['Anchovies and patatas bravas', 'Huge wine list from the barrels'], 'Pricier than most taverns — worth it.'),
  eat('val-r-establiment', 'valencia', 'L’Establiment', 'Rice house since 1982 facing the Albufera lagoon.', 'Lunch', '~€35–50', 'Book ahead', ['Paella with lagoon views', 'Pair with a boat ride'], 'Combine with the Albufera trip.'),
  eat('val-r-llar', 'valencia', 'Llar Román', 'Central rice restaurant making paella since 1973.', 'Lunch', '~€30–45', 'Book ahead', ['Paellas and arroz a banda', 'Easy without leaving the centre'], 'Good if you don’t want to go to the beach or lagoon.'),
  taste('val-t-paella', 'valencia', 'Paella valenciana', 'The original: chicken, rabbit, green beans and garrofó beans.', 'Paella', ['Crispy bottom layer = socarrat', 'Lunch only'], 'No chorizo — locals will tell you!', '~€18–25'),
  taste('val-t-horchata', 'valencia', 'Horchata & fartons', 'Cold tiger-nut milk with sweet finger buns to dip.', 'Horchata', ['Horchatería Santa Catalina in the old town'], 'Try it granizada (slushy).', '~€4–6'),
  taste('val-t-esgarraet', 'valencia', 'Esgarraet', 'Roasted red pepper and salt-cod salad.', '', ['Classic Valencian tapa'], 'Great with bread and wine.', '~€6–10'),
  taste('val-t-agua', 'valencia', 'Agua de Valencia', 'Cava, orange juice, gin and vodka cocktail.', 'Agua_de_Valencia', ['Strong — share a jug'], 'Café de las Horas is the classic spot.', '~€20 a jug'),
  shop('val-s-vibenca', 'valencia', 'Abanicos Vibenca', 'Family fan-makers since 1910 — hand-painted fans.', 'Plaza Lope de Vega', 'Fans ~€20–200', 'No', ['Hand-painted fans', 'Valencia is Spain’s fan-making capital'], 'Light and easy to pack.', 'Abanicos Vibenca Valencia'),
  shop('val-s-lladro', 'valencia', 'Lladró', 'Valencia’s famous porcelain house — flagship store.', 'Calle Poeta Querol (Golden Mile)', '€€–€€€€', 'Can ship internationally', ['Porcelain figures and lighting', 'Made just outside Valencia'], 'Ask the store to ship — far easier than carrying.', 'Lladró Poeta Querol Valencia'),
  shop('val-s-original', 'valencia', 'Original CV', 'Valencian food and design products in a restored old pharmacy.', 'Opposite the Central Market', '€–€€', 'No', ['Saffron, rice, olive oil, wines', 'Local design gifts'], SHIP, 'Original CV Plaza del Mercado Valencia'),
  shop('val-s-utopick', 'valencia', 'Utopick chocolate', 'Bean-to-bar chocolate with Valencian ingredients.', 'Ruzafa', '€', 'No', ['Marcona almond, saffron, orange bars'], 'Combine with a wander round Ruzafa’s boutiques.', 'Utopick Ruzafa Valencia'),

  // ---------------- OVIEDO ----------------
  hotel('ovi-h-reconquista', 'oviedo', 'Eurostars Hotel de la Reconquista', '5★ in an 18th-century hospice, the city’s grand hotel.', 'Centre, near Campo San Francisco', '~€150–250 / night', '5★ — historic', ['Baroque courtyards', 'Princess of Asturias Awards hotel', 'Walk to the old town'], 'Best-known hotel in Oviedo.', 'Hotel_de_la_Reconquista'),
  hotel('ovi-h-munia', 'oviedo', 'Princesa Munia Hotel & Spa', 'Contemporary boutique hotel with a spa in the old town.', 'Old town, 5 min to the cathedral', '~€130–200 / night', 'Boutique', ['Spa', 'Right in the old town'], 'Quiet despite being central.'),
  hotel('ovi-h-forum', 'oviedo', 'AC Hotel Forum Oviedo', 'Modern Marriott hotel by the conference centre.', 'Buenavista (taxi to old town)', '~€120–180 / night', 'Marriott Bonvoy', ['Modern rooms', 'Bonvoy points'], 'Less charming; pick for points.'),
  eat('ovi-r-tierra', 'oviedo', 'Tierra Astur Gascona', 'Big, lively cider house on the “cider boulevard”.', 'Dinner', '~€25–35', 'Book for groups', ['Cider poured from overhead', 'Cachopo and Asturian cheeses', 'Wooden-barrel atmosphere'], 'Busy and fun; good first night in Asturias.'),
  eat('ovi-r-fermin', 'oviedo', 'Casa Fermín', 'Classic Oviedo restaurant since 1924, à la carte.', 'Dinner', '~€50–70', 'Book ahead', ['Asturian produce, done elegantly', 'Huge wine cellar'], 'The “nice dinner” pick in Oviedo.'),
  eat('ovi-r-pelayo', 'oviedo', 'La Corte de Pelayo', 'Traditional Asturian cooking near the cathedral.', 'Lunch or dinner', '~€30–45', 'Book ahead', ['Merluza a la sidra (hake in cider)', 'Fried monkfish (pixín)'], 'Good seafood without leaving the centre.'),
  eat('ovi-r-ovetense', 'oviedo', 'El Ovetense', 'Family restaurant near the cathedral since 1959.', 'Lunch', '~€20–30', 'No', ['Pollo al ajillo (garlic chicken)', 'Fabada', 'Good-value set lunch'], 'A reliable, simple lunch.'),
  taste('ovi-t-fabada', 'oviedo', 'Fabada asturiana', 'White-bean stew with chorizo, morcilla and pork.', 'Fabada_asturiana', ['Hearty — make it lunch'], 'Many places do half portions.', '~€12–18'),
  taste('ovi-t-cachopo', 'oviedo', 'Cachopo', 'Two breaded veal fillets stuffed with ham and cheese.', 'Cachopo', ['Huge — share one between two'], 'Order one per two people.', '~€20–30'),
  taste('ovi-t-cabrales', 'oviedo', 'Cabrales cheese', 'Bold cave-aged blue cheese from the Picos de Europa.', 'Cabrales_cheese', ['Try it in a sauce on steak if strong for you'], 'Pairs with cider.', '~€6–10'),
  taste('ovi-t-sweets', 'oviedo', 'Carbayones & moscovitas', 'Oviedo’s pastries: almond carbayones and chocolate-almond moscovitas.', 'Carbayón', ['Camilo de Blas for carbayones', 'Rialto for moscovitas'], 'Moscovitas travel well as gifts.', '~€2–15'),
  shop('ovi-s-rialto', 'oviedo', 'Confitería Rialto', 'Famous for moscovitas — thin chocolate-almond biscuits.', 'Calle San Francisco', '€', 'No', ['Moscovitas in gift tins', 'Turrón'], 'A perfect take-home gift.', 'Confitería Rialto Oviedo'),
  shop('ovi-s-fontan', 'oviedo', 'Mercado El Fontán', 'Old-town market for Asturian cheeses, cider and conservas.', 'Old town', '€', 'No', ['Cabrales and other cheeses', 'Cider and tinned fish', 'Sunday flea market outside'], 'Closed Sundays (the flea market is on).', 'Mercado El Fontán Oviedo'),
  shop('ovi-s-azabache', 'oviedo', 'Azabache (jet) jewellery', 'Asturias’ traditional black jet jewellery and amulets.', 'Old town jewellers', '~€30–200', 'No', ['Hand-carved jet', 'Traditional good-luck charms'], 'Light, local, and genuinely Asturian.', 'azabache joyería Oviedo'),

  // ---------------- LEÓN ----------------
  hotel('leo-h-colegiata', 'leon', 'Hotel Real Colegiata San Isidoro', 'Hotel inside the Romanesque basilica complex of San Isidoro.', 'Old town', '~€120–180 / night', 'Historic', ['Sleep inside a 12th-century complex', 'Walk to the cathedral'], 'Ask for a room facing the cloister.'),
  hotel('leo-h-nh', 'leon', 'NH Collection León Plaza Mayor', 'Modern hotel right on the Plaza Mayor.', 'Plaza Mayor', '~€130–200 / night', 'Comfortable 4★', ['In the middle of the tapas quarter', 'Spacious rooms'], 'The Saturday market sets up right outside.'),
  hotel('leo-h-condeluna', 'leon', 'Hotel Conde Luna', 'Central hotel with a rooftop terrace near the cathedral.', 'Centre', '~€120–180 / night', 'Barceló', ['Rooftop terrace', 'Casa Mando restaurant inside'], 'Easy walk to everything.'),
  eat('leo-r-mando', 'leon', 'Casa Mando', 'Hearty traditional Leonese cooking.', 'Lunch or dinner', '~€30–45', 'Book ahead', ['Cecina (cured beef)', 'Beef, lamb and legumes'], 'Inside the Conde Luna hotel.'),
  eat('leo-r-valderas', 'leon', 'Alfonso Valderas', 'Classic León restaurant known for salt cod.', 'Lunch or dinner', '~€35–50', 'Book ahead', ['Bacalao al ajo arriero', 'Traditional Leonese dishes'], 'Good for a proper sit-down meal.'),
  eat('leo-r-gaucho', 'leon', 'El Gaucho', 'Barrio Húmedo tapas bar open since 1934.', 'Evening tapas', '~€15–25', 'No', ['Morcilla and garlic soup', 'Free tapa with each drink'], 'Start a Barrio Húmedo crawl here.'),
  eat('leo-r-ezequiel', 'leon', 'Ezequiel', 'Old-school spot with classic dishes and big tapas.', 'Lunch or tapas', '~€15–30', 'No', ['Cecina and cured meats', 'Large tapas portions'], 'On Calle Ancha, near the cathedral.'),
  taste('leo-t-cecina', 'leon', 'Cecina de León', 'Smoked, air-dried beef — León’s answer to jamón.', 'Cecina', ['Sliced thin with olive oil'], 'Try it as a free tapa.', '~€8–14'),
  taste('leo-t-morcilla', 'leon', 'Morcilla de León', 'Onion-rich blood sausage, often crumbled and fried.', 'Morcilla', ['Smoky and soft'], 'Skip it if blood sausage isn’t for you.', '~€6–10'),
  taste('leo-t-mantecadas', 'leon', 'Mantecadas de Astorga', 'Buttery cupcakes sold in paper boxes.', 'Mantecada', ['Pick some up in Astorga'], 'Travel well.', '~€5 a box'),
  shop('leo-s-ancha', 'leon', 'Calle Ancha', 'León’s main pedestrian street from the cathedral to Gaudí’s Casa Botines.', 'Old town', '€–€€€', 'No', ['Fashion and Spanish brands', 'Casa Botines by Gaudí at the end'], 'Combine with the cathedral visit.', 'Calle Ancha León'),
  shop('leo-s-astorga', 'leon', 'Astorga chocolate shops', 'Astorga was Spain’s chocolate capital — old shops and a museum.', 'Astorga (day trip)', '€', 'No', ['Artisan chocolate bars', 'Mantecadas'], 'Pair with the Gaudí palace.', 'chocolate Astorga tienda'),
];

// Moves between bases, per route: [mode, time, cost per person, note]
export const MOVES = {
  r1: [
    ['🚆 AVE train', '~2h30', '~€30–90', 'Madrid Atocha → Sevilla Santa Justa. Book flexible fares (line closure in late 2026).'],
    ['🚐 Private transfer via Córdoba', '~2h + 2h driving', '~€120–150 (≈€450–600 per vehicle, estimate)', 'Stop 3–4h in Córdoba for the Mezquita and lunch.'],
    ['🚆 AVE train', '~3h20–3h30', '~€30–80', 'Granada → Madrid.'],
  ],
  r2: [
    ['🚆 AVE train', '~2h30', '~€30–90', 'Madrid Atocha → Sevilla Santa Justa. Book flexible fares.'],
    ['🚐 Private transfer via Ronda', '~3h + stop', '~€120–150 (≈€450–600 per vehicle, estimate)', 'Lunch and the gorge in Ronda on the way.'],
    ['🚆 AVE train', '~2h40', '~€30–90', 'Málaga María Zambrano → Madrid.'],
  ],
  r3: [
    ['🚆 AVE / Iryo / Ouigo', '~1h50', '~€20–60', 'Madrid → Valencia Joaquín Sorolla.'],
    ['🚆 Direct AVE', '~4h20', '~€40–90', 'Only 1–2 direct trains a day — book early.'],
    ['🚆 AVE train', '~2h30', '~€30–90', 'Seville → Madrid.'],
  ],
  r4: [
    ['🚆 Alvia / AVE', '~3h15', '~€30–70', 'Madrid Chamartín → Oviedo.'],
    ['🚆 Train', '~1h', '~€10–30', 'Oviedo → León.'],
    ['🚆 AVE train', '~2h05', '~€20–60', 'León → Madrid Chamartín.'],
  ],
};
export const ARRIVAL = { title: '✈️ Land MAD T2 3:35pm', note: 'Taxi to the hotel (flat fare ~€33 to the centre). Keep the evening light.' };
export const DEPARTURE = { title: '✈️ Fly home 10:25am', note: 'Leave the hotel by ~8:00am for MAD T2.' };
