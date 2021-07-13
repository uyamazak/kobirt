module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      zIndex: {
        0: 0,
        10: 10,
        20: 20,
        30: 30,
        40: 40,
        50: 50,
        25: 25,
        75: 75,
        100: 100,
        1000: 1000,
        2000: 2000,
        3000: 3000,
        auto: 'auto',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
  shortcuts: {
    'text-sync': 'text-xs sm:text-sm md:text-base lg:text-lg',
    'text-sync-lg': 'text-sm sm:text-base md:text-lg lg:text-xl',
  },
}
