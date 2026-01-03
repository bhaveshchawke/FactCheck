/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#10b981', // Emerald 500
                secondary: '#3b82f6', // Blue 500
                danger: '#ef4444', // Red 500
                warning: '#f59e0b', // Amber 500
                dark: '#0f172a', // Slate 900
                darker: '#020617', // Slate 950
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
