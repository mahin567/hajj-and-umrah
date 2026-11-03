export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {
    // Sampled from the logo: deep blue (left face), mid blue (front face), cyan (top face)
    colors: {
      navy: { DEFAULT: "#1A5FA0", deep: "#0B2F55" },
      mid: "#1A8CC8",
      gold: { DEFAULT: "#C9962B", light: "#F5E3B3", deep: "#8A6212" }, // warm accent for stars and highlights
      accent: { DEFAULT: "#1BB0E8", light: "#7AD3F5", foreground: "#0B2F55" },
      sky: "#EAF6FD", cream: "#F7FBFE",
      // shadcn-style tokens used by the testimonials block, mapped to the brand palette
      background: "#F7FBFE",
      foreground: "#0B2F55",
      muted: { DEFAULT: "#D5E9F6", foreground: "#4A6A87" },
      // shadcn tokens used by the card, badge and button files
      card: { DEFAULT: "#FFFFFF", foreground: "#0B2F55" },
      primary: { DEFAULT: "#1A5FA0", foreground: "#FFFFFF" },
      secondary: { DEFAULT: "#EAF6FD", foreground: "#0B2F55" },
      destructive: { DEFAULT: "#B42318", foreground: "#FFFFFF" },
      border: "#BFDDF0", input: "#BFDDF0", ring: "#1A8CC8",
    },
    fontFamily: {
      display: ["Montserrat", '"Hind Siliguri"', "sans-serif"],
      sans: ["Inter", '"Hind Siliguri"', "sans-serif"],
    },
    animation: { marquee: "marquee var(--duration) linear infinite" },
    keyframes: {
      marquee: {
        from: { transform: "translateX(0)" },
        to: { transform: "translateX(calc(-100% - var(--gap)))" },
      },
    },
  } },
};
