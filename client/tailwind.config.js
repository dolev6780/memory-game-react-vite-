// tailwind.config.js
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        // These are custom utilities that would be added to make card flipping work
        rotate: {
          'y-180': 'rotateY(180deg)',
        },
      },
    },
    plugins: [],
  }