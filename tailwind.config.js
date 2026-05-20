/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soft-bg': '#F9FAFB',
        'neu-bg': '#e0e5ec',
      },
      boxShadow: {
        // Variant A: Ultra-Soft
        'soft': '0 4px 20px rgba(0,0,0,0.03)',
        'soft-hover': '0 6px 25px rgba(0,0,0,0.06)',
        'soft-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
        
        // Variant B: Neumorphism (Clay)
        'neu': '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
        'neu-pressed': 'inset 6px 6px 10px 0 rgba(163,177,198, 0.7), inset -6px -6px 10px 0 rgba(255,255,255, 0.8)',
        'neu-flat': '6px 6px 10px 0 rgba(163,177,198, 0.7), -6px -6px 10px 0 rgba(255,255,255, 0.8)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
