/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6", // blue-500
        secondary: "#1e3a8a", // blue-900
        accent: "#f97316", // orange-500
        background: "#f9fafb", // gray-50
        text: "#111827", // gray-900
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'slide-out-right': 'slideOutRight 0.3s ease-in forwards',
        'slide-in-left': 'slideInLeft 0.3s ease-out forwards',
        'slide-out-left': 'slideOutLeft 0.3s ease-in forwards',
      },
      keyframes: {
        slideInRight: {
          '0%': { 
            opacity: '0',
            transform: 'translateX(15px)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)' 
          },
        },
        slideOutRight: {
          '0%': { 
            opacity: '1',
            transform: 'translateX(0)' 
          },
          '100%': { 
            opacity: '0',
            transform: 'translateX(-15px)' 
          },
        },
        slideInLeft: {
          '0%': { 
            opacity: '0',
            transform: 'translateX(-15px)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)' 
          },
        },
        slideOutLeft: {
          '0%': { 
            opacity: '1',
            transform: 'translateX(0)' 
          },
          '100%': { 
            opacity: '0',
            transform: 'translateX(15px)' 
          },
        },
      },
    },
  },
  plugins: [],
}; 