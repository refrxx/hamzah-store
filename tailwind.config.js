/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#1A5FB4',
        'brand-dark': '#144a8e',
        accent: '#ffc107',
        'accent-dark': '#e6a800',
        bg: '#f5f5f5',
        card: '#ffffff',
        'text-primary': '#212121',
        'text-secondary': '#757575',
      },
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      maxWidth: {
        mobile: '480px',
      },
    },
  },
  plugins: [],
}
