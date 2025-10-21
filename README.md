# ⚡ Smart Energy Dashboard

基于 React + Vite + Tailwind CSS v4 的智能能源管理前端应用。提供电价预测、交易中心与可视化分析，面向拥有太阳能/储能设备的家庭或小型能源用户。

## 功能特性
- 电价预测：支持多时间范围的预测/实际对比曲线
- 电力交易：售电操作面板、价格刷新、收益估算、历史记录
- 状态与统计：当前价格/均价/峰值/谷值等信息卡片
- 数据可视化：响应式折线图、柱状图与交互式提示
- 响应式布局：桌面端与移动端良好体验

## 技术栈
- React 19 + React Router
- Vite 7（开发与构建）
- Tailwind CSS 4（基于 PostCSS）
- Recharts（图表）

## 目录结构
```
smart-energy-dashboard/
  smart-energy-dashboard/
    index.html
    package.json
    postcss.config.js
    tailwind.config.js
    vite.config.js
    public/
      vite.svg
    src/
      App.jsx
      main.jsx
      index.css
      components/
        Navbar.jsx
        Footer.jsx
        Hero.jsx
        Features.jsx
        About.jsx
      pages/
        Landing.jsx
        Dashboard.jsx
        Trading.jsx
```

## 安装与运行
要求：Node.js >= 18（建议 LTS）

1. 安装依赖
```
npm install
```

2. 启动开发服务器（默认端口 5173）
```
npm run dev
```

3. 构建生产包
```
npm run build
```

4. 预览生产包
```
npm run preview
```

## 配置要点
- Tailwind v4：在 `src/index.css` 顶部使用 `@import "tailwindcss"` 引入，具体扫描范围见 `tailwind.config.js` 的 `content`。
- PostCSS：配置于 `postcss.config.js`（`@tailwindcss/postcss` + `autoprefixer`）。
- 字体引入：通过 `index.html` 中的 `<link>` 加载 Web 字体，避免在 CSS 中使用 `@import` 导致 PostCSS 指令顺序报错。

## 可用脚本
- `npm run dev`：本地开发
- `npm run build`：生产构建（输出至 `dist/`）
- `npm run preview`：预览构建结果

## 常见问题
- 样式未生效或“散架”：
  - 确认 `src/index.css` 顶部是 `@import "tailwindcss"`；
  - 确认 `tailwind.config.js` 的 `content` 包含 `./index.html` 与 `./src/**/*.{js,ts,jsx,tsx}`；
  - 字体请在 `index.html` 以 `<link>` 方式引入；
  - 重启开发服务器并强制刷新浏览器缓存（Ctrl+F5）。
- 端口被占用：在 PowerShell 使用 `netstat -ano | findstr :5173` 查找并结束对应进程。

## 许可证
本项目未声明开源许可证。如需开源，请添加 `LICENSE` 文件并在此处说明。