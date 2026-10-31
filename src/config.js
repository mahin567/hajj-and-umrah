// One place for the details staff must keep correct. Nothing else in the code needs editing for these.
export const API = import.meta.env.VITE_API_URL || "/api";

// From the 2027 brochure
export const WHATSAPP_NUMBER = "8801970080318";
export const WHATSAPP = `https://wa.me/${WHATSAPP_NUMBER}`;
export const PHONE = "tel:+8801970080318";
export const PHONE_DISPLAY = "+880 1970-080318";
export const ADDRESS = "Jabbar Tower (4th Floor), 42 Gulshan Avenue, Gulshan-1, Dhaka, Bangladesh";
export const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Jabbar Tower, 42 Gulshan Avenue, Gulshan-1, Dhaka")}`;

// FILL THESE IN. While a value is empty the site says "being added" and shows no link. It never shows a made-up number.
export const LICENCE = {
  number: "",      // e.g. "HAB-1234"
  authority: "",   // e.g. the ministry or body that issued it
  validUntil: "",  // e.g. "31 Dec 2027"
  verifyUrl: "",   // official directory page for your licence, must start with https://
};

// Appointment slots (Bangladesh time). Edit to match your real office hours.
export const BOOKING_SLOTS = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];
export const BOOKING_DAYS_AHEAD = 90;
export const CONSULTATION_TYPES = [
  ["call", "Phone call"],
  ["whatsapp", "WhatsApp video call"],
  ["office", "Visit our office (Gulshan, Dhaka)"],
];
