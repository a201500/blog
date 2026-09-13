import { FullSlug, resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

/**
 * 文章语言标记（只在需要时出现，其余情况返回 null）：
 *
 * 1. 中文文章存在独立英文版（同目录 xxx-en.md，frontmatter lang: en）
 *    → 在文章顶部给一条「English version →」链接，方便访客/面试官直接切
 * 2. 文章本身是英文版（frontmatter lang: en）
 *    → 反过来给一条「中文版 →」链接
 *
 * 全站双语按钮只管首页与项目页；正文不做机器翻译，英文版按需手写。
 * 这里只负责「有英文版时把入口露出来」，不做任何翻译。
 */
const ArticleLangNote: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  const fm = fileData.frontmatter ?? {}
  const slug = fileData.slug ?? ""

  // 首页 / 文件夹索引页 / 标签页不显示
  if (!slug || slug === "index" || slug.endsWith("/index") || slug.startsWith("tags")) return null

  const isEn = fm.lang === "en"
  // 独立英文版命名约定：同目录下 <原名>-en.md
  const counterpartSlug = isEn ? slug.replace(/-en$/, "") : `${slug}-en`
  const counterpart = allFiles.find((f) => f.slug === counterpartSlug)

  if (!counterpart) return null

  const label = isEn ? "中文版" : "English version"
  const arrow = "→"

  return (
    <p class="article-lang-note">
      <a href={resolveRelative(slug as FullSlug, counterpart.slug!)}>
        {label} {arrow}
      </a>
    </p>
  )
}

ArticleLangNote.css = `
/* 样式在 quartz/styles/custom.scss 的 .article-lang-note */
`

export default (() => ArticleLangNote) satisfies QuartzComponentConstructor
