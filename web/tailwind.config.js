/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Main theme colors
                'primary': '#ff4d6d',
                'primary-dark': '#c9184a',
                'secondary': '#4361ee',
                'accent': '#ff9e00',
                'background-dark': '#0f1323',
                'background-light': '#1a1f38',


                'cyber-gray': {
                    50: '#f5f7ff',
                    100: '#e6e9f5',
                    200: '#cfd5eb',
                    300: '#b1badb',
                    400: '#8d99c9',
                    500: '#6d7ab7',
                    600: '#4c5a9f',
                    700: '#3d4a87',
                    800: '#2f3a6c',
                    900: '#232c52',
                    950: '#0f1323',
                },

                // accent colors
                'cyber-red': '#ff4d6d',
                'cyber-pink': '#ff57b9',
                'cyber-purple': '#c77dff',
                'cyber-blue': '#4cc9f0',
                'cyber-yellow': '#fcbf49',
            },
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui'],
                display: ['Chakra Petch', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'cyber-grid': 'linear-gradient(to right, #232c52 1px, transparent 1px), linear-gradient(to bottom, #232c52 1px, transparent 1px)',
            },
            boxShadow: {
                'neon': '0 0 5px rgba(255, 77, 109, 0.5), 0 0 20px rgba(255, 77, 109, 0.3)',
                'neon-blue': '0 0 5px rgba(76, 201, 240, 0.5), 0 0 20px rgba(76, 201, 240, 0.3)',
            },
            animation: {
                'float': 'float 10s linear infinite',
                'pulse-slow': 'pulse 4s ease-in-out infinite',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
        },
    },
    plugins: [],
}