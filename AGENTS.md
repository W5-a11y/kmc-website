# KMC+LUCAS Website

媒体制作公司官网，静态多页面网站。

## 技术栈

- **主体：** 纯 HTML + CSS + Vanilla JS，无框架，直接用浏览器打开 `index.html`
- **scroll-editorial/：** 独立子项目，React + Vite（用于实验性滚动动画），开发命令见下方
- 不使用 TypeScript，不使用构建工具（主体部分）

## 设计规范

**字体**
- `Inter` — 主要正文/UI
- `IBM Plex Sans` — MENU 标签
- `Inria Serif` — work 页面正文

**颜色**
- 品牌红：`#C21F1F`
- 背景米白：`#EEECE6`
- 深色：`#111111`

## 文件结构

```
kmc-website/
├── index.html          # 首页（大标题 KMC+ LUCAS + 汉堡菜单）
├── work.html           # 作品列表（6 sections，paper-slide 动画）
├── ssv.html            # Surviving Silicon Valley 专题页
├── ssv-watch-episodes.html  # SSV「Watch Episodes」落地页（Figma 805:927）
├── ssv-watch-episodes.css
├── about.html          # 关于页面
├── case-stanford.html  # 案例：LabOS (YouTube: uW-h7aeZOz8)
├── case-real-estate.html
├── case-q3d.html
├── case-winery.html
├── styles.css          # 全局样式
├── assets/
│   └── ssv/            # SSV 专题资源（SVG、视频）
│       └── watch-episodes/  # Watch Episodes 页导出图（来自 Figma MCP）
└── scroll-editorial/   # React+Vite 子项目（实验）
```

每个页面通常对应同名 `.css` 和 `.js` 文件（如 `work.html` → `work.css` + `work.js`）。

## SSV 页面动画说明

`ssv.html` 的 Landing → About 形变动画：
- `assets/ssv/landing.svg` — 红色遮罩，SSV 字形镂空（视频透过此处播放）
- `assets/ssv/about_ssv.svg` — 实心红色 SSV 字母（形变目标）
- 点击/滚动触发：landing.svg 缩小（scale 0.1，transform-origin 75% 50%）
- 350ms 后：about_ssv.svg 从 scale(0.12) 展开（transform-origin 88% 50%）
- 1050ms 后：landing 完全移除

## scroll-editorial 子项目

```bash
cd scroll-editorial
npm install
npm run dev    # 开发服务器
npm run build  # 构建
```

## 设计资源

- Figma 文件：`PMj0WnXSp4qBpFj48SE2Fr`
- Figma API Token：`figd_rCX0OgmA6_ex-UyO64WgVT65yOYmMm_hvKKlzvV9`
- 原始 SVG 素材：`~/Desktop/Web資料/SSV/`

## 维护说明

每次执行 `git commit` 或 `git push` 前，自动检查并更新本文件：
- 新增或删除了页面（`.html` 文件）→ 更新「文件结构」章节
- 引入了新的字体、颜色、JS 库 → 更新「技术栈」或「设计规范」章节
- 新增了重要资源（SVG、视频、子项目）→ 更新对应章节
- 内容有误或过时 → 直接修正

目标：让 AGENTS.md 始终准确反映项目当前状态。
