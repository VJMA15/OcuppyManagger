/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      colors: {
        // Colores principales del CTPGA
        primary: {
          DEFAULT: '#005F87',  // Azul principal
          dark: '#004A6A',     // Azul oscuro
          light: '#0074A3',    // Azul claro
          lighter: '#E6F0F5',  // Azul muy claro para fondos
        },
        secondary: {
          DEFAULT: '#FF6B35',  // Naranja principal
          dark: '#D45A2D',     // Naranja oscuro
          light: '#FF8C5A',    // Naranja claro
        },
        accent: {
          DEFAULT: '#2EC4B6',  // Turquesa
          dark: '#1D9D92',     // Turquesa oscuro
          light: '#4ED1C5',    // Turquesa claro
          foreground: '#022C22', // Texto oscuro para mejor contraste
        },
        success: {
          DEFAULT: '#39A900',   // Verde SENA
          dark: '#2d7a00',     // Verde oscuro
          light: '#4bc200',    // Verde claro
        },
        warning: {
          DEFAULT: '#FF9F1C',  // Amarillo
          dark: '#D4850C',     // Amarillo oscuro
          light: '#FFB347',    // Amarillo claro
        },
        danger: {
          DEFAULT: '#E71D36',  // Rojo
          dark: '#C1121F',     // Rojo oscuro
          light: '#FF3E4D',    // Rojo claro
        },
        // Escala de grises mejorada
        gray: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        // Mantener compatibilidad con el código existente
        sena: {
          DEFAULT: '#39A900',
          dark: '#2d7a00',
          light: '#4bc200',
        },
        'sena-soft': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        'neutral-soft': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Variables CSS para temas claros/oscuros
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        // Remove these keyframes if not using tailwindcss-animate
        // "accordion-down": {
        //   from: { height: "0" },
        //   to: { height: "var(--radix-accordion-content-height)" },
        // },
        // "accordion-up": {
        //   from: { height: "var(--radix-accordion-content-height)" },
        //   to: { height: "0" },
        // },
      },
      animation: {
        // Remove these animations if not using tailwindcss-animate
        // "accordion-down": "accordion-down 0.2s ease-out",
        // "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
