/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    light: '#f0fdf4', // light green background
                    DEFAULT: '#15803d', // green-700
                    dark: '#14532d', // green-900
                    accent: '#111827', // gray-900 (deep dark)
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
