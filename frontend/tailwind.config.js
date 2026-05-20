export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0e0f11',
        surface: '#16181c',
        surface2: '#1e2026',
        border: '#2a2d35',
        accent: '#e8c547',
        muted: '#7c8090',
        danger: '#e85f5f',
        success: '#52d07a',
        info: '#5b9cf6',
      },
      fontFamily: {
        body: ['DM Sans', 'sans-serif'],
        display: ['DM Serif Display', 'serif'],
      },
      borderRadius: {
        card: '8px',
      },
    },
  },
  plugins: [],
};
