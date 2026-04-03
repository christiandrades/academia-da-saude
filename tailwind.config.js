/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/react-app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#083643',      // azul petróleo escuro
        accent: '#B1E001',       // verde limão vibrante  
        secondary: '#B8ECD7',    // secundária clara
        complement: '#CEF09D',   // complementar suave
        support: '#476C5E',      // apoio/contraste
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
