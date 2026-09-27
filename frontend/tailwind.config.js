/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        civic: {
          blue: '#1D4ED8',
          'blue-hover': '#1E40AF',
          teal: '#0F766E',
          accent: '#0284C7',
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          'text-primary': '#1E293B',
          'text-secondary': '#64748B',
          muted: '#94A3B8',
          border: '#E2E8F0',
          hover: '#EFF6FF',
          selected: '#DBEAFE',
        },
        status: {
          pending: '#D97706',
          assigned: '#2563EB',
          progress: '#7C3AED',
          resolved: '#16A34A',
          rejected: '#DC2626',
          critical: '#B91C1C',
        },
        role: {
          citizen: '#1D4ED8',
          officer: '#0F766E',
          'dept-head': '#7C3AED',
          admin: '#EA580C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.08)',
        elevated: '0 10px 30px 0 rgb(0 0 0 / 0.10), 0 4px 8px -4px rgb(0 0 0 / 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'slide-down': 'slideDown 200ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
