import { FullSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { byDateAndAlphabetical } from "./PageList"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

/** 项目文件夹 slug 前缀（content/项目/） */
export const PROJECT_DIR = "项目/"

/** 聚合 项目/ 文件夹下的项目文章（排除 folder index 自身、草稿、exclude） */
export function collectProjects(allFiles: QuartzPluginData[]): QuartzPluginData[] {
  return allFiles.filter(
    (f) =>
      f.slug?.startsWith(PROJECT_DIR) &&
      f.slug !== `${PROJECT_DIR}index` &&
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

    const projects = collectProjects(allFiles).sort(byDateAndAlphabetical(cfg))
    if (projects.length === 0) return null

    return (
      <section class="pj-showcase">
        <p class="pj-eyebrow">{eyebrow}</p>
        <h1 class="pj-headline">{headline}</h1>

        <div class="pj-grid">
          {projects.map((p, i) => {
            const pf = p.frontmatter ?? {}
            const title = pf.title as string
            const desc = pf.description as string | undefined
            const stack = (pf.stack ?? []) as string[]
            const status = pf.status as string | undefined
            const metric = pf.metric as string | undefined
            const metricLabel = pf.metricLabel as string | undefined

            return (
              <a
                class="pj-item"
                href={resolveRelative(slug as FullSlug, p.slug!)}
              >
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
              </a>
            )
          })}
        </div>
      </section>
    )
  }

  ProjectShowcase.css = `
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
