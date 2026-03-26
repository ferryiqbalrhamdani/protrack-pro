import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                "primary": "#1a2b3c",
                "background-light": "#f1f5f9",
                "background-dark": "#0f172a",
                "brand": {
                    "accent": "#0070f3",
                    "glow": "rgba(0, 112, 243, 0.15)",
                }
            },
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                "display": ["Inter", "sans-serif"]
            },
            borderRadius: { "DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem" },
            backgroundImage: {
                'grid-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(15 23 42 / 0.04)'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E\")",
                'grid-pattern-dark': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(51 65 85 / 0.1)'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E\")",
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'reveal': 'reveal 0.8s cubic-bezier(0.77, 0, 0.175, 1) forwards',
                'slide-up-fade': 'slide-up-fade 0.5s ease-out both',
                'fade-in': 'fade-in 0.4s ease-out forwards',
            },
            keyframes: {
                reveal: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-up-fade': {
                    '0%': { opacity: '0', transform: 'translateY(15px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                }
            }
        },
    },

    plugins: [forms],
};
