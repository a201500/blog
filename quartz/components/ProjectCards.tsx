import { FullSlug, joinSegments, pathToRoot, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"

/** 项目封面：取文章 frontmatter.firstImage（由 FirstImage transformer 从正文第一张图提取） */
export function resolveProjectCover(
  page: QuartzPluginData,
  baseDir: string,
): string | undefined {
  const img = page.frontmatter?.firstImage as string | undefined
  if (!img) return undefined
  return /^https?:/.test(img) ? img : joinSegments(baseDir, img)
}

/** 首页项目行卡（紧凑横向：小缩略图 + 标题/简介/技术栈，整卡可点击进项目文章） */
export function renderProjectRow(
  page: QuartzPluginData,
  cover: string | undefined,
  currentSlug: FullSlug,
) {
  const pf = page.frontmatter ?? {}
  const title = pf.title as string
  const desc = pf.description as string | undefined
  const stack = ((pf.stack ?? pf.tags ?? []) as string[]).filter((t) => t !== "项目")

  return (
    <a class="project-row" href={resolveRelative(currentSlug, page.slug!)}>
      <div class={cover ? "project-thumb has-image" : "project-thumb"}>
        {cover ? (
          <img src={cover} alt={title} loading="lazy" />
        ) : (
          <span>{title.trim().slice(0, 1)}</span>
        )}
      </div>
      <div class="project-row-body">
        <h3 class="project-name">{title}</h3>
        {desc && <p class="project-desc">{desc}</p>}
        {stack.length > 0 && (
          <div class="project-tags">
            {stack.map((t) => (
              <span>{t}</span>
            ))}
          </div>
        )}
      </div>
    </a>
  )
}

export const projectCardStyles = `
.project-rows {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.project-row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.6rem;
  border: 1px solid color-mix(in srgb, var(--lightgray) 76%, transparent);
  border-radius: 8px;
  background: var(--light);
  text-decoration: none;
  transition: transform 0.16s, border-color 0.16s, box-shadow 0.16s;
}

.project-row:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--secondary) 42%, transparent);
  box-shadow: 0 6px 20px color-mix(in srgb, var(--dark) 8%, transparent);
}

.project-thumb {
  width: 92px;
  height: 64px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--secondary) 20%, var(--lightgray)),
    var(--lightgray)
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-thumb span {
  font-size: 1.4rem;
  font-weight: 500;
  font-family: var(--headerFont);
  color: color-mix(in srgb, var(--secondary) 65%, var(--light));
}

.project-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-row-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.project-name {
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
  color: var(--dark);
  line-height: 1.45;
}

.project-row:hover .project-name {
  color: var(--secondary);
}

.project-desc {
  font-size: 0.8rem;
  color: var(--gray);
  margin: 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-tags {
  display: flex;
  gap: 0.3rem;
  margin-top: 0.15rem;
  flex-wrap: wrap;
}

.project-tags span {
  font-size: 0.72rem;
  padding: 0.05rem 0.4rem;
  border-radius: 4px;
  background: color-mix(in srgb, var(--lightgray) 70%, transparent);
  color: var(--darkgray);
}

.project-more {
  display: inline-block;
  margin-top: 0.55rem;
  font-size: 0.78rem;
  color: var(--gray);
  text-decoration: none;
  transition: color 0.16s;
}

.project-more:hover {
  color: var(--secondary);
}

@media all and (max-width: 600px) {
  .project-thumb {
    width: 76px;
    height: 56px;
  }
}
`

// 兼容旧引用：项目展示已迁移到 ProjectShowcase（/项目/ 页）与 HomeIntro（首页行卡），
// 本默认组件不再渲染任何内容，仅保留导出避免布局引用报错。
import { QuartzComponent, QuartzComponentConstructor } from "./types"

export default (() => {
  const ProjectCards: QuartzComponent = () => null
  ProjectCards.css = ""
  return ProjectCards
}) satisfies QuartzComponentConstructor
