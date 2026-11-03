// Hotel directory data. One object per hotel. Add the remaining hotels here (the plan is 50).
//   id        unique slug
//   name      hotel name
//   city      "Makkah" or "Madinah"
//   distanceM metres to the Haram / Masjid an-Nabawi. Leave null until measured.
//   method    "walking" | "straight" | "unverified"
//   lat, lng  hotel position (decimal degrees). The map shows only when both are set.
//   photos    ["/hotels/elaf-kinda-1.jpg", ...] put files in frontend/public/hotels/
//   stars     optional number
//   website   optional official hotel website (https://...). When empty, the card links to a web search for the hotel instead.
// The 16 below are the hotels named in the 2027 brochure (some packages say "or equivalent").
// Distances and photos are NOT in the brochure, so they are empty. Nothing is guessed.
export const HOTELS = [
  { id: "elaf-kinda", name: "Elaf Kinda", city: "Makkah", website: "https://elafhotels.com/elaf-kinda/" },
  { id: "makkah-tower", name: "Makkah Tower", city: "Makkah" },
  { id: "safa-tower", name: "Safa Tower", city: "Makkah" },
  { id: "sunud-ajyad", name: "Sunud Ajyad", city: "Makkah" },
  { id: "emaar-andalus", name: "Emaar Andalus", city: "Makkah" },
  { id: "masar-al-ais", name: "Masar Al Ais", city: "Makkah" },
  { id: "emaar-dahir", name: "Emaar Dahir", city: "Makkah" },
  { id: "al-aqeeq", name: "Al Aqeeq", city: "Madinah" },
  { id: "movenpick", name: "Mövenpick", match: "Mövenpick", city: "Madinah" },
  { id: "pullman", name: "Pullman", city: "Madinah" },
  { id: "abraj-taba", name: "Abraj Taba", city: "Madinah" },
  { id: "grand-plaza-madinah", name: "Grand Plaza Madinah", city: "Madinah" },
  { id: "madinah-star", name: "Madinah Star", city: "Madinah" },
  { id: "kayan-al-masi", name: "Kayan Al Masi", city: "Madinah" },
  { id: "arjuan-sada", name: "Arjuan Sada", city: "Madinah" },
  { id: "karam-silver", name: "Karam Silver", city: "Madinah" },
];
