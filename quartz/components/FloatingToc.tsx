import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { i18n } from "../i18n"
// @ts-ignore
import script from "./scripts/floatingToc.inline"

/**
 * 悬浮目录（复刻 chengliang.pro 的浮动 TOC）
 *
 * 与 Quartz 自带 TableOfContents 的区别：
 * - 自带版放在右栏（sidebar.right），会挤占内容宽度、且随页面滚动
 * - 本组件 position: fixed 悬浮在正文左侧空白处，正文流不受影响，滚动时始终可见
 *
 * 结构：
 *   <div class="floating-toc">
 *     <button class="floating-toc-head">   ← 折叠开关（图标 + 目录标题 + 箭头）
 *     <ul class="floating-toc-list">       ← 标题列表，当前项高亮
 *   </div>
 *
 * 显示规则（返回 null 即完全不输出）：
 * - 只有文章页（fileData.toc 有内容）才渲染
 * - 首页 / 列表页 / 标签页 / 完整程度不足的短文章不渲染（见 MIN_ITEMS）
 * - 窄屏（<1280px）由 CSS 隐藏，避免压住正文
 *
 * 数据来自 Plugin.TableOfContents() transformer 写入的 fileData.toc。
 */
const MIN_ITEMS = 3

const FloatingToc: QuartzComponent = ({ fileData, cfg }: QuartzComponentProps) => {
  const toc = fileData.toc
  if (!toc || toc.length < MIN_ITEMS) return null

  // 首页与文件夹索引页（无正文标题层级）不显示
  const slug = fileData.slug ?? ""
  if (slug === "index" || slug.endsWith("/index")) return null

  const title = i18n(cfg.locale).components.tableOfContents.title

  return (
    <aside class="floating-toc" aria-label={title}>
      <button type="button" class="floating-toc-head" aria-expanded="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="floating-toc-icon"
          aria-hidden="true"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
        <span class="floating-toc-title">{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="floating-toc-fold"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <ul class="floating-toc-list">
        {toc.map((entry) => (
          <li class={`ftoc-depth-${entry.depth}`}>
            <a href={`#${entry.slug}`} data-for={entry.slug}>
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}

FloatingToc.afterDOMLoaded = script

FloatingToc.css = `
/* 样式统一放在 quartz/styles/custom.scss，便于与主题变量一起调 */
`

export default (() => FloatingToc) satisfies QuartzComponentConstructor
