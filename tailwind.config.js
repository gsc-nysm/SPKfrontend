/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,vue}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F48DB', // Warna primer utama
          50: '#F7F4FF',   // Variasi lebih terang
          100: '#E2DFFF',
          200: '#C4C0FF',
          300: '#A7A1FF',
          400: '#908AFF',
          500: '#6B63FF',
          600: '#4F48DB',  // Bisa sama dengan DEFAULT
          700: '#3731B7',
          800: '#231F93',
          900: '#16137A',
        },
        secondary: '#FFCC00',
        success: {
          DEFAULT: '#5FAA12', // Warna primer utama
          50: '#F7FFF4',   // Variasi lebih terang
          100: '#F0FCD0',
          200: '#DEF9A2',
          300: '#C1ED71',
          400: '#A2DC4C',
          500: '#79C619',
          600: '#5FAA12',  // Bisa sama dengan DEFAULT
          700: '#498E0C',
          800: '#347207',
          900: '#265F04',
        },
        info: {
          DEFAULT: '#0A72DB', // Warna primer utama
          50: '#F2F8FF',   // Variasi lebih terang
          100: '#CFF3FF',
          200: '#9FE3FF',
          300: '#6FCDFF',
          400: '#4BB7FF',
          500: '#0F93FF',
          600: '#0A72DB',  // Bisa sama dengan DEFAULT
          700: '#0755B7',
          800: '#043C93',
          900: '#022A7A',
        },
        warning: {
          DEFAULT: '#DB9023', // Warna primer utama
          50: '#FFF5D9',   // Variasi lebih terang
          100: '#FFF6D5',
          200: '#FFE9AC',
          300: '#FFDA82',
          400: '#FFCB63',
          500: '#FFB330',
          600: '#DB9023',  // Bisa sama dengan DEFAULT
          700: '#B77118',
          800: '#93540F',
          900: '#7A3F09',
        },
        danger: {
          DEFAULT: '#DB3030', // Warna primer utama
          50: '#FFF0F0',   // Variasi lebih terang
          100: '#FFE8D9',
          200: '#FFCCB3',
          300: '#FFA98D',
          400: '#FF8871',
          500: '#FF5242',
          600: '#DB3030',  // Bisa sama dengan DEFAULT
          700: '#B7212D',
          800: '#931529',
          900: '#7A0C27',
        },
        
      },
    },
  },
  plugins: [],
}

