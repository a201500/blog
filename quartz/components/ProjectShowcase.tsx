import { FullSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { byDateAndAlphabetical } from "./PageList"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

/** 项目文件夹 slug 前缀（content/项目/） */
export const PROJECT_DIR = "项目/"

/** 聚合 项目/ 文件夹下的项目文章（排除 folder index 自身、草稿、exclude、英文独立版） */
export function collectProjects(allFiles: QuartzPluginData[]): QuartzPluginData[] {
  return allFiles.filter(
    (f) =>
      f.slug?.startsWith(PROJECT_DIR) &&
      f.slug !== `${PROJECT_DIR}index` &&
      f.frontmatter?.lang !== "en" && // 英文独立版（xxx-en.md）不单独成卡，正文由中文卡进入
      !f.frontmatter?.draft &&
      !f.frontmatter?.exclude &&
      !!f.frontmatter?.title,
  )
}

/**
 * 项目展示页（复刻 chengliang.pro 的「已经交付的产品」）：
 * eyebrow 小字 + 大标题 + 两列纯文字网格。
 * 数据全部来自 项目/ 文件夹下文章的 frontmatter：
 *   description  一句话简介
 *   stack        技术栈标签（小字 · 分隔）
 *   status       状态（如 持续更新 / 已完成）
 *   metric       右下角大指标（如 5口）
 *   metricLabel  指标说明（如 千兆交换）
 * 整卡可点击，进入项目文章。
 */
export default (() => {
  const ProjectShowcase: QuartzComponent = ({ cfg, fileData, allFiles }: QuartzComponentProps) => {
    const slug = fileData.slug ?? ""
    if (slug !== `${PROJECT_DIR}index` && slug !== PROJECT_DIR.replace(/\/$/, "")) return null

    const fm = fileData.frontmatter ?? {}
    const eyebrow = (fm.eyebrow as string) ?? "BUILD JOURNAL"
    const headline = (fm.headline as string) ?? (fm.title as string) ?? "项目"
    const headlineEn = (fm.headlineEn as string) ?? "Delivered & In-Progress Work"

    const projects = collectProjects(allFiles).sort(byDateAndAlphabetical(cfg))
    if (projects.length === 0) return null

    /** 渲染一张项目卡；lang 决定取中文还是英文字段 */
    const renderItem = (p: QuartzPluginData, i: number, lang: "zh" | "en") => {
      const pf = p.frontmatter ?? {}
      const pick = (zh?: unknown, en?: unknown) => (lang === "en" ? (en ?? zh) : zh)
      const title = pick(pf.title, pf.titleEn) as string
      const desc = pick(pf.description, pf.descriptionEn) as string | undefined
      const status = pick(pf.status, pf.statusEn) as string | undefined
      const metric = pf.metric as string | undefined
      const metricLabel = pick(pf.metricLabel, pf.metricLabelEn) as string | undefined
      // 英文模式优先英文技术栈（如 "Hardware · Networking"），没有就回落中文
      const stack = ((lang === "en" ? (pf.stackEn ?? pf.stack) : pf.stack) ?? []) as string[]
      // 是否存在独立英文正文（同目录 xxx-en.md 且 frontmatter lang: en）
      const hasEnVersion = allFiles.some(
        (f) => f.frontmatter?.lang === "en" && f.slug?.startsWith(p.slug!),
      )

      if (!title) return null

      return (
        <a class="pj-item" href={resolveRelative(slug as FullSlug, p.slug!)}>
          <span class="pj-num">{String(i + 1).padStart(2, "0")}</span>
          {stack.length > 0 && (
            <p class="pj-stack">{stack.map((s) => s.toUpperCase()).join(" · ")}</p>
          )}
          <h3 class="pj-name">{title}</h3>
          {desc && <p class="pj-desc">{desc}</p>}
          <div class="pj-foot">
            {status && (
              <span class="pj-status">
                <span class="pj-dot" />
                {status}
              </span>
            )}
            {metric && (
              <span class="pj-metric">
                <strong>{metric}</strong>
                {metricLabel && <small>{metricLabel}</small>}
              </span>
            )}
          </div>
          {/* 英文模式下如果没有独立英文正文，明确告知点击后是中文——避免点进去落差 */}
          {lang === "en" && !hasEnVersion && (
            <span class="pj-lang-note">Article in Chinese</span>
          )}
        </a>
      )
    }

    return (
      <section class="pj-showcase">
        <p class="pj-eyebrow">{eyebrow}</p>
        <h1 class="pj-headline">
          <span data-lang-block="zh">{headline}</span>
          <span data-lang-block="en">{headlineEn}</span>
        </h1>

        <div class="pj-grid">
          <span data-lang-block="zh" class="pj-lang-wrap">
            {projects.map((p, i) => renderItem(p, i, "zh"))}
          </span>
          <span data-lang-block="en" class="pj-lang-wrap">
            {projects.map((p, i) => renderItem(p, i, "en"))}
          </span>
        </div>
      </section>
    )
  }

  ProjectShowcase.css = `
/* 双语块容器：本身不参与布局，让内部元素直接成为 grid 的项 */
.pj-lang-wrap {
  display: contents;
}

.pj-showcase {
  margin-top: 0.5rem;
}

.pj-eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  color: var(--gray);
  margin: 0 0 0.5rem;
}

.pj-headline {
  font-size: 2.1rem;
  font-weight: 700;
  font-family: var(--headerFont);
  color: var(--dark);
  margin: 0 0 2.2rem;
  line-height: 1.2;
  letter-spacing: 0.01em;
}

.pj-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.4rem 2.8rem;
}

.pj-item {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  padding: 0.2rem 0;
  border-top: 1px solid color-mix(in srgb, var(--lightgray) 70%, transparent);
  padding-top: 1.1rem;
  transition: transform 0.16s;
}

.pj-item:hover {
  transform: translateY(-2px);
}

.pj-num {
  font-size: 0.72rem;
  color: var(--gray);
  letter-spacing: 0.08em;
  margin-bottom: 0.45rem;
}

.pj-stack {
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  color: var(--gray);
  margin: 0 0 0.5rem;
}

.pj-name {
  font-size: 1.25rem;
  font-weight: 600;
  font-family: var(--headerFont);
  color: var(--dark);
  margin: 0 0 0.5rem;
  line-height: 1.35;
  transition: color 0.16s;
}

.pj-item:hover .pj-name {
  color: var(--secondary);
}

.pj-desc {
  font-size: 0.83rem;
  color: var(--gray);
  line-height: 1.7;
  margin: 0 0 0.9rem;
}

.pj-foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-top: auto;
}

.pj-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--darkgray);
}

.pj-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--secondary);
  flex-shrink: 0;
}

.pj-metric {
  display: inline-flex;
  align-items: baseline;
  gap: 0.45rem;
}

.pj-metric strong {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--dark);
  font-family: var(--headerFont);
}

.pj-metric small {
  font-size: 0.72rem;
  color: var(--gray);
}

/* 英文模式下无独立英文正文时的提示（弱化小字） */
.pj-lang-note {
  font-size: 0.68rem;
  color: var(--gray);
  letter-spacing: 0.04em;
  margin-top: 0.55rem;
  opacity: 0.75;
}

@media all and (max-width: 700px) {
  .pj-grid {
    grid-template-columns: 1fr;
    gap: 1.8rem;
  }

  .pj-headline {
    font-size: 1.65rem;
  }
}
`

  return ProjectShowcase
}) satisfies QuartzComponentConstructor
