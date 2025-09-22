/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wine: {
          50: '#FCF7F8',
          100: '#F5E6E9',
          200: '#E9CCD2',
          300: '#D9ADBA',
          400: '#C689A0',
          500: '#AA6683',
          600: '#8E4D69',
          700: '#722F37', // primary wine color
          800: '#591E2A',
          900: '#3E121D',
        },
        purple: {
          700: '#4A1942', // rich purple
        },
        gold: {
          50: '#FFFBF0',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#E0C19E',
          500: '#BE9063', // gold accent
          600: '#9E7142',
          700: '#7C5A2F',
        },
        cream: {
          50: '#FFFBF5',
          100: '#F9F1E7',
          200: '#F3E7D9',
          300: '#EDD5C1',
        }
      },
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        'glow': '0 0 20px rgba(114, 47, 55, 0.3)',
        'glow-gold': '0 0 20px rgba(190, 144, 99, 0.3)',
      },
      backgroundImage: {
        'wine-pattern': "url('https://images.pexels.com/photos/370984/pexels-photo-370984.jpeg?auto=compress&cs=tinysrgb&w=1920')",
        'wine-gradient': 'linear-gradient(135deg, #722F37 0%, #4A1942 100%)',
        'gold-gradient': 'linear-gradient(135deg, #BE9063 0%, #9E7142 100%)',
        'cream-gradient': 'linear-gradient(135deg, #FFFBF5 0%, #F9F1E7 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-slow': 'pulseGentle 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'glow': 'glow 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-5px)' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glow: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};