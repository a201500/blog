import { FullSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { getDate } from "./Date"
import { byDateAndAlphabetical } from "./PageList"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

interface Options {
  /** 首页最多显示几篇（博客页显示全部） */
  limit?: number
}

/**
 * 单条文章（rp-list 风格：标题 + 描述 + 标签，无封面）
 * lang 决定取哪一份文案：zh 用 title/description，en 用 titleEn/descriptionEn（缺则回落中文）
 */
export function renderPostItem(
  page: QuartzPluginData,
  currentSlug: FullSlug,
  lang: "zh" | "en" = "zh",
) {
  const pf = page.frontmatter ?? {}
  const title = (lang === "en" ? (pf.titleEn ?? pf.title) : pf.title) ?? ""
  const desc = (lang === "en" ? (pf.descriptionEn ?? pf.description) : pf.description) as
    | string
    | undefined
  const tags = (page.frontmatter?.tags ?? []) as string[]

  return (
    <li class="rp-list-item">
      <a class="rp-list-link" href={resolveRelative(currentSlug, page.slug!)}>
        <div class="rp-list-main">
          <div class="rp-list-heading">
            <h4>{title}</h4>
          </div>
          {desc && <p>{desc}</p>}
        </div>
        {tags.length > 0 && (
          <div class="rp-list-tags" aria-label="分类">
            {tags.slice(0, 2).map((t) => (
              <span>{t}</span>
            ))}
          </div>
        )}
      </a>
    </li>
  )
}

export const postListStyles = `
.post-list-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 0.2rem;
}

.post-list-head h2 {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  color: var(--dark);
}

.post-list-more {
  font-size: 0.78rem;
  color: var(--gray);
  text-decoration: none;
  transition: color 0.16s;
}

.post-list-more:hover {
  color: var(--secondary);
}

/* 博客页：分类筛选 chips */
.post-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0.5rem 0 0.4rem;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  font-size: 0.78rem;
  padding: 0.2rem 0.6rem;
  border-radius: 5px;
  border: 1px solid color-mix(in srgb, var(--lightgray) 76%, transparent);
  background: color-mix(in srgb, var(--lightgray) 40%, transparent);
  color: var(--darkgray);
  text-decoration: none;
  transition: color 0.16s, border-color 0.16s, background 0.16s;
}

.filter-chip:hover {
  color: var(--dark);
  border-color: color-mix(in srgb, var(--secondary) 35%, transparent);
}

.filter-chip-active {
  background: color-mix(in srgb, var(--secondary) 14%, transparent);
  color: var(--secondary);
  border-color: color-mix(in srgb, var(--secondary) 40%, transparent);
}

/* 年份 */
.rp-year-head {
  display: flex;
  align-items: baseline;
  gap: 0.55rem;
  margin: 2.2rem 0 0.2rem;
}

.rp-year-tag {
  font-size: 0.66rem;
  color: var(--gray);
  letter-spacing: 0.14em;
}

.rp-year-label {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--dark);
  font-family: var(--headerFont);
  line-height: 1.2;
}

/* 月份 */
.rp-month-head {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  margin: 1.5rem 0 0.2rem;
  font-size: 0.78rem;
  font-weight: 400;
  color: var(--gray);
}

.rp-month-count {
  opacity: 0.8;
}

.rp-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.rp-list-item {
  border-top: 1px solid color-mix(in srgb, var(--lightgray) 70%, transparent);
}

.rp-list-link {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 0.85rem 0;
  text-decoration: none;
}

.rp-list-main {
  min-width: 0;
}

.rp-list-heading h4 {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 500;
  color: var(--dark);
  line-height: 1.5;
  transition: color 0.16s;
}

.rp-list-link:hover .rp-list-heading h4 {
  color: var(--secondary);
}

.rp-list-main p {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: var(--gray);
  line-height: 1.65;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rp-list-tags {
  display: flex;
  gap: 0.3rem;
  flex-shrink: 0;
  padding-top: 0.15rem;
}

.rp-list-tags span {
  font-size: 0.72rem;
  padding: 0.08rem 0.42rem;
  border-radius: 4px;
  background: color-mix(in srgb, var(--lightgray) 70%, transparent);
  color: var(--darkgray);
  white-space: nowrap;
}

@media all and (max-width: 600px) {
  .rp-list-link {
    flex-direction: column;
    gap: 0.4rem;
  }
}
`

export default ((opts?: Options) => {
  const limit = opts?.limit ?? 3

  const PostList: QuartzComponent = ({ cfg, fileData, allFiles }: QuartzComponentProps) => {
    const slug = fileData.slug ?? ""
    const isHome = slug === "index"
    // 博客页：content/博客/ 文件夹的列表页
    const isBlog = slug === "博客/index" || slug === "博客"
    if (!isHome && !isBlog) return null

    const allPosts = allFiles
      .filter(
        (f) =>
          f.slug !== "index" &&
          !f.slug?.endsWith("/index") && // folder 索引页（博客/index、项目/index）不是文章
          !f.slug?.startsWith("项目/") && // 项目文章只进项目页，不进博客列表
          f.frontmatter?.lang !== "en" && // 英文独立版（xxx-en.md）不进中文列表
          !f.frontmatter?.draft &&
          !f.frontmatter?.exclude &&
          !!f.frontmatter?.title,
      )
      .sort(byDateAndAlphabetical(cfg))

    const posts = isHome ? allPosts.slice(0, limit) : allPosts
    if (posts.length === 0) return null

    // 年 → 月 → 文章（月份标签也做双语：zh 用「9 月」，en 用「Sep」）
    const zhMonths = [
      "1 月",
      "2 月",
      "3 月",
      "4 月",
      "5 月",
      "6 月",
      "7 月",
      "8 月",
      "9 月",
      "10 月",
      "11 月",
      "12 月",
    ]
    const enMonths = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]
    const monthLabel = (d: Date | undefined) => (d ? zhMonths[d.getMonth()] : "未分类")
    const years = new Map<number, Map<string, QuartzPluginData[]>>()
    posts.forEach((p) => {
      const d = getDate(cfg, p)
      const y = d ? d.getFullYear() : 0
      const m = monthLabel(d)
      if (!years.has(y)) years.set(y, new Map())
      const months = years.get(y)!
      const list = months.get(m) ?? []
      list.push(p)
      months.set(m, list)
    })

    // 标签计数（博客页筛选 chips 用）
    const tagCounts = new Map<string, number>()
    allPosts.forEach((p) =>
      ((p.frontmatter?.tags ?? []) as string[]).forEach((t) =>
        tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1),
      ),
    )

    /**
     * 同一份内容渲染中英两遍，分别包进 [data-lang-block="zh|en"]，
     * 由 language.inline.ts 按当前语言显隐（整块切换，零延迟）。
     */
    const renderAll = (lang: "zh" | "en") => (
      <>
        {isHome ? (
          <div class="post-list-head">
            <h2>{lang === "zh" ? "最新文章" : "Latest posts"}</h2>
            <a class="post-list-more" href={resolveRelative(slug, "博客/index" as FullSlug)}>
              {lang === "zh" ? "查看全部 →" : "View all →"}
            </a>
          </div>
        ) : (
          <div class="post-filter">
            <a
              class="filter-chip filter-chip-active"
              href={resolveRelative(slug, "博客/index" as FullSlug)}
            >
              {lang === "zh" ? `全部 ${allPosts.length}` : `All ${allPosts.length}`}
            </a>
            {[...tagCounts.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([t, n]) => (
                <a class="filter-chip" href={resolveRelative(slug, `tags/${t}` as FullSlug)}>
                  {t} {n}
                </a>
              ))}
          </div>
        )}

        {[...years.entries()].map(([year, months]) => (
          <div class="rp-year">
            {!isHome && (
              <div class="rp-year-head">
                <span class="rp-year-tag">YEAR</span>
                <span class="rp-year-label">{year || (lang === "zh" ? "未分类" : "Undated")}</span>
              </div>
            )}
            {[...months.entries()].map(([month, items]) => {
              // 月份双语：中文键 "9 月" → 英文显示 "Sep"
              const mIdx = month === "未分类" ? -1 : Number(month.replace(/[^0-9]/g, "")) - 1
              const label =
                lang === "zh" ? month : mIdx >= 0 && mIdx < 12 ? enMonths[mIdx] : "Undated"
              return (
                <div class="rp-month">
                  <h3 class="rp-month-head">
                    <span class="rp-month-label">{label}</span>
                    <span class="rp-month-count">
                      {lang === "zh" ? `${items.length} 篇` : `${items.length}`}
                    </span>
                  </h3>
                  <ol class="rp-list">
                    {items.map((p) => renderPostItem(p, slug as FullSlug, lang))}
                  </ol>
                </div>
              )
            })}
          </div>
        ))}
      </>
    )

    return (
      <section class="post-list">
        <span data-lang-block="zh">{renderAll("zh")}</span>
        <span data-lang-block="en">{renderAll("en")}</span>
      </section>
    )
  }

  PostList.css = postListStyles
  return PostList
}) satisfies QuartzComponentConstructor
