/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nova Identidade Visual Oficial Ajuda KIDS
        ak: {
          purple: '#7047E8',
          purpleDeep: '#5631C9',
          purpleSoft: '#EFEAFC',
          blue: '#4389F5',
          blueDeep: '#2A6BD4',
          blueSoft: '#EBF3FE',
          orange: '#FF9B42',
          orangeDeep: '#E07D22',
          orangeSoft: '#FFF2E6',
          yellow: '#FFD34E',
          yellowDeep: '#DFA918',
          yellowSoft: '#FFF9E2',
          green: '#36C995',
          greenDeep: '#20A576',
          greenSoft: '#E7F9F2',
          pink: '#F16E9A',
          pinkDeep: '#D14B79',
          pinkSoft: '#FDECF2',
          lavender: '#F5F3FC',
          ink: '#25233A',
          muted: '#77758A',
          border: '#E5DDF7',
          // Modo Escuro Profundo (Grafite & Roxo Profundo)
          darkCanvas: '#121024',
          darkSurface: '#1A1735',
          darkCard: '#231F46',
          darkElevated: '#2D275C',
          darkBorder: '#38316B',
          darkText: '#F8F7FF',
          darkSubtext: '#B8B3D6'
        },
        // Tokens legados preservados para compatibilidade retroativa
        kids: {
          greenSoft: '#E7F9F2',
          greenLime: '#36C995',
          blueLight: '#EBF3FE',
          bluePrimary: '#4389F5',
          blueNavy: '#25233A',
          lilac: '#EFEAFC',
          yellowPastel: '#FFD34E',
          pinkSoft: '#FDECF2',
          white: '#FFFFFF',
          grayLight: '#F5F3FC',
          nightBg: '#121024',
          nightSurface: '#1A1735',
          nightCard: '#231F46',
          nightBorder: '#38316B',
          nightText: '#F8F7FF',
          nightSubtext: '#B8B3D6'
        },
        brand: {
          light: '#EBF3FE',
          primary: '#7047E8',
          dark: '#25233A',
          gray: '#F5F3FC',
          green: '#E7F9F2',
          greenDark: '#20A576',
          yellow: '#FFF9E2',
          yellowDark: '#DFA918',
          purple: '#EFEAFC',
          purpleDark: '#5631C9',
          coral: '#FDECF2',
          coralDark: '#D14B79'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'Nunito', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Fredoka', '"Plus Jakarta Sans"', 'Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        executive: ['"Plus Jakarta Sans"', 'Nunito', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        kid: ['Fredoka', 'Nunito', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'xl': '1rem',     // 16px
        '2xl': '1.25rem', // 20px
        '3xl': '1.375rem',// 22px
        '4xl': '1.75rem',
        'card': '1.375rem',
      },
      boxShadow: {
        'soft': '0 8px 24px rgba(112, 71, 232, 0.08)',
        'soft-hover': '0 14px 32px rgba(112, 71, 232, 0.14)',
        'card': '0 4px 18px rgba(37, 35, 58, 0.06)',
        'edtech': '0 2px 6px rgba(37, 35, 58, 0.04), 0 10px 26px rgba(112, 71, 232, 0.08)',
        'edtech-dark': '0 8px 28px rgba(8, 6, 20, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'apple': '0 2px 6px rgba(37, 35, 58, 0.04), 0 10px 26px rgba(112, 71, 232, 0.08)',
        'linear': '0 0 0 1px rgba(112, 71, 232, 0.08), 0 4px 14px rgba(37, 35, 58, 0.05)',
        'tactile': '0 4px 0 #5631C9',
        'tactile-lg': '0 6px 0 #5631C9, 0 14px 28px rgba(112, 71, 232, 0.18)',
        'tactile-blue': '0 4px 0 #2A6BD4',
        'tactile-soft': '0 4px 0 rgba(37, 35, 58, 0.14)',
        'focus-ring': '0 0 0 3px rgba(112, 71, 232, 0.28)',
        'float': '0 12px 28px -6px rgba(112, 71, 232, 0.14), 0 6px 12px -6px rgba(37, 35, 58, 0.06)',
        'sticker': '0 4px 0 rgba(112, 71, 232, 0.14), 0 12px 26px rgba(37, 35, 58, 0.10), inset 0 2px 0 rgba(255, 255, 255, 0.9)',
        'card-3d': '0 6px 0 #DDD6F3, 0 16px 32px rgba(112, 71, 232, 0.10)',
        'card-3d-dark': '0 6px 0 #100E24, 0 18px 34px rgba(4, 3, 14, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      }
    },
  },
  plugins: [],
};
