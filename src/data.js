// Hajj 1448 / 2027 packages, transcribed from the agency brochure (same figures as the Django seed in test_hajj).
// Not on the brochure, so flagged: travel period (inferred from the flight window) and seat counts (none shown).
const L = 100000; // one lakh
const P = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round(v * L)]));

export const ZONES = [
  { code: "A", from: 0, to: 300, color: "#0B2F55", meaning: "Front row; easy to return to the hotel between prayers." },
  { code: "B", from: 300, to: 700, color: "#1A5FA0", meaning: "Close walking distance; comfortable for most pilgrims." },
  { code: "C", from: 700, to: 1500, color: "#1A8CC8", meaning: "Walkable but tiring for elderly pilgrims; shuttle recommended." },
  { code: "D", from: 1500, to: null, color: "#4A6A87", meaning: "Shuttle bus or transport needed." },
];
export const WALK_SPEEDS = { normal: { label: "Normal adult pace", mpm: 75 }, slow: { label: "Slow pace (elderly)", mpm: 45 } };
export const zoneFor = (m) => (m == null ? null : ZONES.find((z) => m >= z.from && (z.to == null || m <= z.to)) || null);
export const zoneRange = (z) => (z.to == null ? `over ${z.from.toLocaleString()} m` : `${z.from.toLocaleString()}–${z.to.toLocaleString()} m`);
export const walkLabel = (z, mpm) => {
  const lo = z.from ? Math.ceil(z.from / mpm) : 0;
  if (z.to == null) return `${lo} min +`;
  const hi = Math.ceil(z.to / mpm);
  return lo ? `${lo}–${hi} min` : `up to ${hi} min`;
};

export const BUDGET_BANDS = [
  { id: "b1", label: "Up to ৳7,50,000", max: 7.5 * L },
  { id: "b2", label: "৳7,50,000 – ৳9,00,000", max: 9 * L },
  { id: "b3", label: "৳9,00,000 – ৳11,00,000", max: 11 * L },
  { id: "b4", label: "৳11,00,000 and above", max: null },
];

export const UPGRADES = {
  vipTent: { name: "VIP Mina tent", price: 3.5 * L },
  bus: { name: "Dedicated bus for the five days of Hajj", price: 32000 },
};

export const ROOM_LABEL = { 5: "5 per room", 4: "4 per room", 3: "3 per room", 2: "2 per room" };

// [slug, title, type, period, days, flight, makkah[min,max], madinah[min,max], aziziyah, makkahHotels, madinahHotels, prices, summary]
const RAW = [
  ["exclusive-hajj-2027", "Exclusive Hajj Package 2027", "shifting", "awal", 40, "1/7 Dhul Qadah – 15/19 Dhul Hijjah", [0, 100], [0, 150], 11, "Elaf Kinda / Makkah Tower / Safa Tower or equivalent", "Al Aqeeq / Mövenpick / Pullman or equivalent", P({ 4: 10.9, 3: 14.9, 2: 16.9 }), "The closest we go to the Haram, with 18–20 nights in Makkah before Hajj."],
  ["luxury-hajj-2027", "Luxury Hajj Package 2027", "shifting", "awal", 40, "1/7 Dhul Qadah – 15/19 Dhul Hijjah", [0, 300], [0, 300], 11, "Elaf Kinda / Makkah Tower / Safa Tower or equivalent", "Abraj Taba / Grand Plaza Madinah or equivalent", P({ 4: 8.95, 3: 12.15, 2: 13.95 }), "Five-star hotels within 300 m of both Harams."],
  ["standard-hajj-2027", "Standard Hajj Package 2027", "shifting", "awal", 40, "1/7 Dhul Qadah – 15/19 Dhul Hijjah", [300, 600], [0, 300], 11, "Sunud Ajyad / Emaar Andalus or equivalent", "Madinah Star / Kayan Al Masi or equivalent", P({ 4: 7.45, 3: 9.95, 2: 11.15 }), "A comfortable walk to the Haram at a moderate price."],
  ["economy-hajj-2027", "Economy Hajj Package 2027", "shifting", "awal", 40, "1/7 Dhul Qadah – 15/19 Dhul Hijjah", [650, 850], [0, 300], 11, "Masar Al Ais / Emaar Dahir or equivalent", "Arjuan Sada / Karam Silver or equivalent", P({ 4: 6.4, 3: 8.1, 2: 8.9 }), "Our most affordable Hajj. The Makkah hotel is a longer walk, so a shuttle is used."],
  ["short-17-day-2027", "17-Day Short Hajj Package 2027", "shifting", "akhir", 18, "1/2 – 16/17 Dhul Hijjah", [0, 100], [0, 250], 10, "Elaf Kinda / Makkah Tower / Safa Tower or equivalent", "Al Aqeeq / Mövenpick / Pullman or equivalent", P({ 4: 9.7, 3: 13.1, 2: 14.7 }), "For pilgrims who cannot be away for six weeks. 5–7 nights in Makkah before Hajj."],
  ["short-14-day-2027", "14-Day Short Hajj Package 2027", "shifting", "akhir", 15, "3/4 – 16/17 Dhul Hijjah", [null, null], [0, 250], 10, "", "Al Aqeeq / Mövenpick / Pullman or equivalent", P({ 4: 8.4, 3: 10.6, 2: 11.7 }), "Our shortest Hajj. You go straight to Aziziyah on arrival, with no separate Makkah hotel before the Hajj days, and stay in Madinah afterwards."],
  ["short-nonshifting-a-2027", "Short Non-Shifting Hajj 2027 — Package A", "non_shifting", "akhir", 21, "20/22 days", [0, 300], [0, 150], 0, "Within 300 m of the Haram", "Within 150 m of Masjid an-Nabawi", P({ 5: 8.2, 4: 8.2, 3: 9.5, 2: 10.1 }), "One hotel in Makkah for the whole stay: you unpack once."],
  ["short-nonshifting-b-2027", "Short Non-Shifting Hajj 2027 — Package B", "non_shifting", "akhir", 21, "20/22 days", [0, 700], [0, 200], 0, "Within 700 m of the Haram", "Within 200 m of Masjid an-Nabawi", P({ 5: 7.0, 4: 7.0, 3: 7.5, 2: 7.7 }), "No change of hotel, at a lower price than Package A."],
  ["long-nonshifting-a-2027", "Long Non-Shifting Hajj 2027 — Package A", "non_shifting", "awal", 35, "30/40 days", [0, 300], [0, 150], 0, "Within 300 m of the Haram", "Within 150 m of Masjid an-Nabawi", P({ 5: 8.7, 4: 8.7, 3: 10.0, 2: 10.6 }), "The full season without changing hotel."],
  ["long-nonshifting-b-2027", "Long Non-Shifting Hajj 2027 — Package B", "non_shifting", "awal", 35, "30/40 days", [0, 700], [0, 200], 0, "Within 700 m of the Haram", "Within 200 m of Masjid an-Nabawi", P({ 5: 7.5, 4: 7.5, 3: 8.0, 2: 8.2 }), "The full season without changing hotel, at a lower price."],
];

export const PACKAGES = RAW.map(([slug, title, type, period, days, flight, mk, md, aziziyah, mkHotels, mdHotels, prices, summary]) => ({
  slug, title, type, period, days, flight, aziziyah, mkHotels, mdHotels, prices, summary,
  makkah: { min: mk[0], max: mk[1], zone: zoneFor(mk[1]) },
  madinah: { min: md[0], max: md[1], zone: zoneFor(md[1]) },
  tent: "standard", // Mina–Arafah tent (D category) is included; VIP is a priced upgrade
  from: Math.min(...Object.values(prices)),
}));

export const INCLUDED = [
  "Air ticket (direct flight)", "Hajj visa and health insurance", "Three Bangladeshi meals a day", "Full transport",
  "Makkah and Madinah city tour (Ziyarah)", "Experienced Muallim and guide", "Mina–Arafah tent (D category), meals and transport", "Qurbani (Hady)",
];
export const EXCLUDED = [
  "Return ticket, to be booked at your own cost", "Dedicated bus for the five days of Hajj (৳32,000 extra)",
  "VIP Mina tent (৳3,50,000 extra)", "Personal expenses, extra baggage and shopping",
];

/* ---------- Umrah estimator price list (indicative; replace with the agency's real figures) ---------- */
export const EST = {
  serviceChargePct: 6, contingencyPct: 7, childDiscountPct: 25, infantPct: 10, rounding: 500,
  choices: [
    { id: "air", group: "Getting there", label: "Return airfare", unit: "person", options: [
      ["eco_stop", "Economy, one stop", "Via Dubai, Doha or Muscat", 78000], ["eco_direct", "Economy, direct", "Dhaka–Jeddah non-stop", 95000],
      ["premium", "Premium economy", "Extra legroom", 145000], ["business", "Business class", "Lie-flat seat, lounge access", 260000]], def: "eco_stop" },
    { id: "ground", group: "Getting there", label: "Transport inside Saudi Arabia", unit: "person", options: [
      ["bus", "Shared air-conditioned bus", "Airport, Haramain routes and Ziyarat", 12000], ["coach", "VIP coach", "Reclining seats, fewer stops", 22000],
      ["car", "Private car for your family", "Driver on call", 45000]], def: "bus" },
    { id: "mk", group: "Where you stay", label: "Hotel in Makkah", unit: "room-night", nights: "mk", options: [
      ["economy", "Economy, 2.5 km with shuttle", "Free shuttle every 30 minutes", 7500], ["three", "3-star, 1.2 km walk", "About 15 minutes on foot", 12000],
      ["four", "4-star, 700 m walk", "Ajyad area, 9 minutes on foot", 19000], ["five", "5-star, 300 m, Haram view", "Clock Tower district", 34000]], def: "three" },
    { id: "md", group: "Where you stay", label: "Hotel in Madinah", unit: "room-night", nights: "md", options: [
      ["economy", "Economy, 900 m", "Quiet street, 12 minutes on foot", 6000], ["three", "3-star, 500 m", "Seven minutes to Bab as-Salam", 9000],
      ["four", "4-star, 250 m Markaziyah", "Inside the central zone", 14000], ["five", "5-star, facing the Masjid", "Rooms overlooking the courtyard", 24000]], def: "three" },
    { id: "meals", group: "Food", label: "Meal plan", unit: "person-night", nights: "all", options: [
      ["none", "No meals included", "Eat out at your own cost", 0], ["breakfast", "Breakfast only", "Buffet at the hotel", 550],
      ["half", "Breakfast and dinner", "Bangladeshi menu", 950], ["full", "All three meals", "Bangladeshi menu, packed lunch on rite days", 1400]], def: "half" },
    { id: "guide", group: "Documents & guidance", label: "Muallim & group guidance", unit: "person", options: [
      ["group", "Shared group muallim", "One guide for the kafela", 8000], ["dedicated", "Dedicated Bangla-speaking guide", "Stays with your family throughout", 22000],
      ["scholar", "Family scholar", "Alim accompanies your family only", 45000]], def: "group" },
    { id: "ziyarat", group: "Add-ons", label: "Ziyarat tours", unit: "person", optional: true, options: [
      ["makkah", "Makkah historical sites", "Jabal Nur, Jabal Thawr, Mina viewpoints", 4500], ["both", "Makkah and Madinah", "Adds Uhud, Quba and the Seven Mosques", 8000],
      ["taif", "Makkah, Madinah and Taif", "Full-day Taif excursion included", 13000]] },
  ],
  fixed: [
    { id: "govt", group: "Documents & guidance", label: "Umrah visa & Saudi levies", unit: "person", price: 9500 },
    { id: "visa", group: "Documents & guidance", label: "Visa processing & travel insurance", unit: "person", price: 12000 },
  ],
  toggles: [
    { id: "laundry", label: "Laundry service", unit: "person", price: 4500 }, { id: "sim", label: "Saudi SIM with data", unit: "person", price: 1800 },
    { id: "zamzam", label: "Zamzam delivered to your home", unit: "person", price: 1200 },
  ],
  quantities: [
    { id: "wheelchair", label: "Wheelchair assistance", unit: "unit", price: 9000 }, { id: "bag", label: "Extra 23 kg luggage", unit: "unit", price: 6500 },
  ],
};
