# KMC+LUCAS Website

媒体制作公司官网，静态多页面网站。

## 技术栈

- **主体：** 纯 HTML + CSS + Vanilla JS，无框架，直接用浏览器打开 `index.html`
- **GSAP 3.12.5 + ScrollTrigger** — work.html 的 disposable scrollytelling（CDN 引入）
- **scroll-editorial/：** 独立子项目，React + Vite（实验性滚动动画）
- 不使用 TypeScript，不使用构建工具（主体部分）

## 设计规范

**字体**
- `Fustat` — 主要标题/UI（替换原 Inter 作为主字体）
- `Inter` — 部分正文
- `Kyiv Type Sans`（`--font-kyiv`）— menu drawer 链接
- `IBM Plex Sans` — MENU 标签
- `Inria Serif` — work 页面正文

**颜色**
- 品牌红：`#C21F1F`
- 背景米白：`#F4F3EF`（部分旧文件写作 `#EEECE6`，以 `#F4F3EF` 为准）
- 深色：`#201D13`（deep brown-black，work/SSV 页用）
- 橄榄色：`#645D45`
- SSV 红：`#C21F1F`（同品牌红）

## 文件结构

```
kmc-website/
├── index.html              # 首页（KMC+ LUCAS 大标题 + Lottie 开场 + 汉堡菜单）
├── work.html               # 作品列表（Hero → Disposable 滚动叙事 → 暗色卡片网格）
├── ssv.html                # Surviving Silicon Valley 专题页
├── ssv-watch-episodes.html # SSV「Watch Episodes」落地页
├── about.html              # 关于页面（无 page cursor；nav 色 #645D45）
├── case-stanford.html      # 案例：LabOS (YouTube: uW-h7aeZOz8)
├── case-real-estate.html
├── case-q3d.html
├── case-winery.html
├── case-study.html         # Aloe Blacc 案例
├── styles.css              # 全局样式（含 menu drawer、hero、work-footer）
├── menu.css                # index.html 专用 menu drawer 覆盖样式
├── index.css               # 首页专用样式
├── all-work.css            # work.html 样式（含 .aw-stage 1440×1024 + awScale 移动缩放）
├── about-page.css          # about.html 样式
├── case-detail.css         # 案例页共用样式（.cd-stage 1440×1500）
├── ssv.css                 # SSV 页样式
├── ssv-landing.css         # SSV landing 6帧动画样式
├── ssv-timeline.css        # SSV timeline section 样式
├── ssv-watch-episodes.css  # Watch Episodes 页样式
├── ssv-episodes.css/js     # SSV episode 卡片状态机组件（v1-v6，FSM）
├── work-disposable.js      # GSAP ScrollTrigger — #work_1_3 disposable 滚动叙事
├── ssv-landing.js          # SSV landing 6帧 SVG mask 动画驱动
├── ssv.js                  # SSV 页面交互（nativeTimelineScroll 模式）
├── work-list.js            # work.html 交互（含 awScale 移动缩放函数）
├── site.js                 # 首页全局 JS（bfcache 修复、services、hero 动画）
├── tokens.css              # CSS 变量（--font-kyiv、--red、--cream 等）
├── assets/
│   ├── kmc_logo_grey.svg
│   ├── disposable.svg      # 901×352，无白色 rect，filter:brightness(0) 显示
│   ├── ssv/
│   │   ├── landing.svg     # 旧版红色遮罩（保留）
│   │   ├── about_ssv.svg   # 旧版形变目标（保留）
│   │   ├── cover.mp4/webm  # SSV 主视频
│   │   └── landing-flow/
│   │       ├── Exclude1-6.svg  # 6帧 mask 序列
│   │       ├── cover.mp4       # 4.8s landing 背景视频
│   │       └── cover.webm
│   └── about/              # 关于页面团队照片
└── scroll-editorial/       # React+Vite 子项目（实验）
```

每个页面通常对应同名 `.css` 和 `.js` 文件。

## Menu Drawer（全局共用）

**视觉设计**（Figma 1033:544）：
- 背景：毛玻璃 `rgba(244,243,239,0.2)` + `backdrop-filter: blur(9.3px)`
- 链接颜色：`#929ec6`，`mix-blend-mode: exclusion`，`font-size: 20px`，`letter-spacing: 0.29em`，`text-transform: uppercase`
- 当前页面链接：`--accent` class → 颜色 `#a3add0` + `::before` 16×16 实心方块指示器
- `index.html` 用 `menu.css` 覆盖（结构为 `.menu-drawer__top` + `.menu-drawer__close`）；其他页面用 `styles.css`（结构为 `.menu-drawer__bar` + `.menu-drawer__toggle`）

**各页面当前页 `--accent` 位置：**
- `index.html` → Home
- `work.html` → The Work
- `ssv.html` → SSV
- `ssv-watch-episodes.html` → Watch Episodes
- `about.html` → About Us

## work.html — 架构

三个 section：
1. `#work_1_1` — Hero（"Work" 大标题 + 向下箭头）
2. `#work_1_3` — Disposable 滚动叙事（GSAP pin + scrub）
3. `#work_2` — 暗色卡片网格（6 个项目，paper-slide 覆盖钉住区域）

**Disposable Section 关键规则：**
- `.aw-w3-img`（disposable.svg）无 z-index，自然源序在 `.aw-w3-frame` 之前
- `.aw-w3-frame__rect`：`background:#fff; mix-blend-mode:difference` → 文字在 rect 内显示米白色
- `.aw-stage`：`isolation:isolate; background:var(--aw-bg)` 提供混合背景
- `#work_2 { z-index:2 }` 使暗色区域滑过钉住的 disposable
- GSAP：`pin:true, pinType:'transform', scrub:0.65, end:'+=220%'`

**移动端缩放（已实现）：**
`work-list.js` 中的 `awScale()` 计算 `Math.min(innerWidth/1440, innerHeight/1024, 1)` 并写入 `--aw-scale`，其他页面为流式布局无需此处理。

## SSV 页面（ssv.html）

当前架构：Landing（6帧动画）+ 原生滚动 Timeline（无 paper-slide sheets）。

**`nativeTimelineScroll` 模式：**
- `var nativeTimelineScroll = !document.querySelector('.ssv-sheet')` — 当前为 `true`
- wheel handler：landing 未结束时拦截向下滚动（跳过动画）；landing 结束后放行原生滚动
- touch handler：landing 活跃时拦截，结束后放行
- `syncCurrentByScroll()`：通过 `scrollY > 24` 同步 `current` 索引

**Landing 动画（ssv-landing.js）：**
- 6 帧 SVG mask（Exclude1-6.svg）每 800ms 切换
- 结束后：`is-finished` class → `display:none` → `#ssv-hero-poster.scrollIntoView()`
- 点击可跳过

## SSV Episodes 组件（ssv-episodes.js/css）

用于 `ssv-watch-episodes.html`：
- 3 个图层（A=cart, B=couch, C=red-coat），`data-state="v1"–"v6"` 驱动 CSS
- FSM：v1→hover:C→v2, v1→hover:B→v3, v1→click:A→v4, v2→click:C→v5 等
- v4→v1 用 `is-dissolve` class（300ms ease-out）

## index.html 已知修复

- `site.js` bfcache 修复：pageshow + scroll<80px 时重置 `body.style.backgroundColor = '#f4f3ef'`（防止从 work/SSV 返回时 bg 残留 `#201D13`）
- Services：GSAP fromTo 无 blur（防止 bfcache 恢复时模糊残留）

## scroll-editorial 子项目

```bash
cd scroll-editorial
npm install
npm run dev
npm run build
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

目标：让 CLAUDE.md 始终准确反映项目当前状态。
