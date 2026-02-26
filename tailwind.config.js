/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0a0a0c",
                surface: "#16161a",
                primary: "#6366f1",
                secondary: "#ec4899",
                accent: "#06b6d4",
                danger: "#ef4444",
                warning: "#f59e0b",
                success: "#10b981",
                gold: "#fbbf24",
            },
            fontFamily: {
                sans: ['Inter', 'Roboto', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
                'premium': '0 10px 30px -5px rgba(0, 0, 0, 0.7)',
            },
            backgroundImage: {
                'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
                'radial-gradient': 'radial-gradient(circle, var(--tw-gradient-stops))',
            }
        },
    },
    plugins: [],
}
