/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FinTech 深色主题配色（对齐 demo.html）
        dark: {
          bg: '#0a0e27',        // 页面背景
          panel: '#131722',     // 主面板背景
          card: '#131722',      // 卡片背景（与面板一致，统一风格）
          inner: '#1e2433',     // 内嵌控件/按钮背景（如 timeframe 按钮、输入框）
          border: '#1f2635',    // 分隔线/边框
          hover: '#1e2433',     // 悬停背景
        },
        tech: {
          blue: '#2962ff',      // 科技蓝强调
          cyan: '#00bcd4',
          forecast: '#fbbf24',  // 预测线（黄色）
        },
        trade: {
          up: '#26a69a',        // 涨绿
          down: '#ef5350',      // 跌红
        },
        text: {
          primary: '#e5e7eb',   // 主文本（demo 近似 gray-200）
          secondary: '#9ca3af', // 次级文本（demo gray-400）
          muted: '#6b7280',     // 暗淡文本（gray-500）
        }
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'Inter', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(41, 98, 255, 0.3)',
        'glow-green': '0 0 20px rgba(38, 166, 154, 0.3)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.4)',
      },
      // 可按需扩展圆角/spacing 等
    },
  },
  plugins: [],
}
