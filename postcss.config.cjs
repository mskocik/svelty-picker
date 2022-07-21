const autoprefixer = require("autoprefixer");

const config = {
  plugins: [
    //Some plugins, like tailwindcss/nesting, need to run before Tailwind,
    autoprefixer,
  ],
};

module.exports = config;
