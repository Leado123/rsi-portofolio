import typography from '@tailwindcss/typography';
import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,js,jsx,ts,tsx,mdx}",
    "./components/**/*.{astro,js,jsx,ts,tsx,mdx}",
    "./pages/**/*.{astro,js,jsx,ts,tsx,mdx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [typography, tailwindcssAnimate],
};
