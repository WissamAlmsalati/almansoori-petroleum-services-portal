/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': {
          '50': '#eff6ff',
          '100': '#dbeafe',
          '200': '#bfdbfe',
          '300': '#93c5fd',
          '400': '#60a5fa',
          '500': '#3b82f6',
          '600': '#2563eb',
          '700': '#1d4ed8',
          '800': '#1e40af',
          '900': '#1e3a8a',
          '950': '#172554',
        },
        'brand-navy': {
          '50': '#f0f2f5',
          '100': '#e1e6eb',
          '200': '#c4ced8',
          '300': '#a7b5c4',
          '400': '#899db1',
          '500': '#6b849d',
          '600': '#566a7e',
          '700': '#404f5e',
          '800': '#2b353f',
          '900': '#151a1f',
        },
      }
    }
  },
  plugins: [],
}
