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
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Colores SENA originales
        sena: {
          DEFAULT: "#39A900", // Verde SENA principal
          dark: "#2d7a00",    // Verde SENA oscuro
          light: "#4bc200",   // Verde SENA claro
        },
        // Nuevos colores más suaves
        'sena-soft': {
          50: '#f0f9e8',
          100: '#ddf2c7',
          200: '#c2e895',
          300: '#9fd958',
          400: '#7bc626',
          500: '#39A900', // Color principal SENA
          600: '#2d8700',
          700: '#236600',
          800: '#1d5200',
          900: '#184400',
        },
        'neutral-soft': {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
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
