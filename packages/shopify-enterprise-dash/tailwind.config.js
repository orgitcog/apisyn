/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'shopify-indigo': {
          DEFAULT: '#5c6ac4',
          50: '#f5f6fc',
          100: '#ebedfb',
          200: '#d2d5f5',
          300: '#b9bff0',
          400: '#8791e4',
          500: '#5c6ac4',
          600: '#4456bd',
          700: '#3a49a9',
          800: '#313e8a',
          900: '#2c346f',
        },
      },
    },
  },
  plugins: [],
  // Ensure Tailwind doesn't override Polaris styles
  important: false,
};