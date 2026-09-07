import { FullSlug, joinSegments, pathToRoot, resolveRelative } from "../util/path"
import { Date, getDate } from "./Date"
import { byDateAndAlphabetical } from "./PageList"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default (() => {
  const TagWall: QuartzComponent = ({ cfg, fileData, allFiles }: QuartzComponentProps) => {
    const slug = fileData.slug ?? ""
    if (!slug.startsWith("tags")) return null

    const baseDir = pathToRoot(slug)
    const isIndex = slug === "tags" || slug === "tags/index"
    const currentTag =
      !isIndex && slug.startsWith("tags/") ? decodeURIComponent(slug.slice(5)) : null

    const posts = allFiles
      .filter(
        (f) =>
          !f.frontmatter?.draft &&
          !f.frontmatter?.exclude &&
          !!f.frontmatter?.title &&
          f.slug !== "index",
      )
      .sort(byDateAndAlphabetical(cfg))

    const groups = new Map<string, typeof posts>()
    posts.forEach((p) => {
      const tags = (p.frontmatter?.tags ?? []) as string[]
      tags.forEach((t) => {
        const list = groups.get(t) ?? []
        list.push(p)
        groups.set(t, list)
      })
    })

    const entries: [string, typeof posts][] = currentTag
      ? groups.has(currentTag)
        ? [[currentTag, groups.get(currentTag)!]]
        : []
      : [...groups.entries()].sort((a, b) => b[1].length - a[1].length)

    if (entries.length === 0) return null

    return (
      <div class="tag-wall">
        {entries.map(([tag, items]) => (
          <section class="tag-group">
            <div class="tag-group-head">
              <a class="tag-group-name" href={resolveRelative(slug, `tags/${tag}` as FullSlug)}>
                # {tag}
              </a>
              <span class="tag-group-count">{items.length} 篇</span>
            </div>
            <div class="article-grid-list">
              {items.map((page) => {
                const title = page.frontmatter?.title ?? ""
                const desc = page.frontmatter?.description as string | undefined
                const tags = (page.frontmatter?.tags ?? []) as string[]
                const cover = page.frontmatter?.cover as string | undefined
                const coverUrl = cover
                  ? /^https?:/.test(cover)
                    ? cover
                    : joinSegments(baseDir, cover)
                  : undefined

                return (
                  <a class="post-card" href={resolveRelative(slug, page.slug!)}>
                    <div class={coverUrl ? "post-cover has-image" : "post-cover"}>
                      {coverUrl ? (
                        <img src={coverUrl} alt={title} loading="lazy" />
                      ) : (
                        <span class="post-cover-initial">{title.trim().slice(0, 1)}</span>
                      )}
                    </div>
                    <div class="post-body">
                      <h3 class="post-title">{title}</h3>
                      {desc && <p class="post-desc">{desc}</p>}
                      <div class="post-meta">
                        {page.dates && <Date date={getDate(cfg, page)!} locale={cfg.locale} />}
                        {tags.slice(0, 2).map((t) => (
                          <span class="post-tag">{t}</span>
                        ))}
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    )
  }

  TagWall.css = `
.tag-wall {
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
}

.tag-group-head {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  margin-bottom: 0.9rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid color-mix(in srgb, var(--lightgray) 76%, transparent);
}

.tag-group-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--dark);
  text-decoration: none;
  transition: color 0.16s;
}

.tag-group-name:hover {
  color: var(--secondary);
}

.tag-group-count {
  font-size: 0.75rem;
  color: var(--gray);
}

/* 隐藏 Quartz 自带的标签列表，改用卡片墙 */
[data-slug^="tags"] ul.section-ul {
  display: none;
}
`

  return TagWall
}) satisfies QuartzComponentConstructor
