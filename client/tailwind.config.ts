import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        chatra: {
          ink: '#0b1522',
          teal: '#22dfcc',
        },
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'sans-serif'],
        display: ['Manrope Variable', 'Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
