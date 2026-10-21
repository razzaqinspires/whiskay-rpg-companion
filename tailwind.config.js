/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: { colors: { aether: { ink: '#070b17', gold: '#f6c978', cyan: '#72f0ff' } }, backdropBlur: { glass: '18px' } } },
  plugins: [],
};
