/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                sena: {
                    DEFAULT: '#00995D', // Verde institucional SENA
                    dark: '#007945',   // Variante oscura
                    light: '#4CCB8A',  // Variante clara
                },
            },
        },
    },
    plugins: [],
};
