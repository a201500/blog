import { FullSlug, resolveRelative } from "../util/path"
import { byDateAndAlphabetical } from "./PageList"
import { renderPostItem, postListStyles } from "./PostList"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default (() => {
  const TagWall: QuartzComponent = ({ cfg, fileData, allFiles }: QuartzComponentProps) => {
    const slug = fileData.slug ?? ""
    if (!slug.startsWith("tags")) return null

    const isIndex = slug === "tags" || slug === "tags/index"
    const currentTag =
      !isIndex && slug.startsWith("tags/") ? decodeURIComponent(slug.slice(5)) : null

    const posts = allFiles
      .filter(
        (f) =>
          !f.frontmatter?.draft &&
          !f.frontmatter?.exclude &&
          !!f.frontmatter?.title &&
          f.slug !== "index" &&
          !f.slug?.endsWith("/index") &&
          !f.slug?.startsWith("项目/"),
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
            <ol class="rp-list">{items.map((page) => renderPostItem(page, slug as FullSlug))}</ol>
          </section>
        ))}
      </div>
    )
  }

  TagWall.css =
    postListStyles +
    `
.tag-wall {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
}

.tag-group-head {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  margin-bottom: 0.2rem;
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
