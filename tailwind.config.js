module.exports = {
    theme: {
      extend: {
        animation: {
          'fade-in': 'fadeIn 0.6s ease-out',
          'fade-in-up': 'fadeInUp 0.8s ease-out',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          fadeInUp: {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
        },
        colors: {
          background: 'var(--background)',
          foreground: 'var(--foreground)',
          accent: 'var(--accent)',
          gray: {
            950: 'var(--gray-950)',
            900: 'var(--gray-900)',
            800: 'var(--gray-800)',
            700: 'var(--gray-700)',
            600: 'var(--gray-600)',
            500: 'var(--gray-500)',
            400: 'var(--gray-400)',
          },
          indigo: {
            700: 'var(--indigo-700)',
            600: 'var(--indigo-600)',
            500: 'var(--indigo-500)',
            400: 'var(--indigo-400)',
            300: 'var(--indigo-300)',
          },
          rose: {
            600: 'var(--rose-600)',
            500: 'var(--rose-500)',
            400: 'var(--rose-400)',
          },
        },
        fontFamily: {
          sans: 'var(--font-sans)',
          mono: 'var(--font-mono)',
        },
      },
    },
  };