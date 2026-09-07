import { FullSlug, joinSegments, pathToRoot, resolveRelative } from "../util/path"
import { Date, getDate } from "./Date"
import { byDateAndAlphabetical } from "./PageList"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

interface Options {
  /** 首页最多显示几篇 */
  limit?: number
  /** 是否只在首页显示，默认 true */
  onlyOnIndex?: boolean
}

export default ((opts?: Options) => {
  const limit = opts?.limit ?? 12
  const onlyOnIndex = opts?.onlyOnIndex ?? true

  const ArticleGrid: QuartzComponent = ({ cfg, fileData, allFiles }: QuartzComponentProps) => {
    if (onlyOnIndex && fileData.slug !== "index") return null

    const baseDir = pathToRoot(fileData.slug!)
    const posts = allFiles
      .filter(
        (f) =>
          f.slug !== "index" &&
          !f.frontmatter?.draft &&
          !f.frontmatter?.exclude &&
          !!f.frontmatter?.title,
      )
      .sort(byDateAndAlphabetical(cfg))
      .slice(0, limit)

    if (posts.length === 0) return null

    return (
      <section class="article-grid">
        <div class="article-grid-head">
          <h2 class="article-grid-title">最新文章</h2>
          <a class="article-grid-more" href={resolveRelative(fileData.slug!, "tags/index" as FullSlug)}>
            按标签浏览 →
          </a>
        </div>
        <div class="article-grid-list">
          {posts.map((page) => {
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
              <a class="post-card" href={resolveRelative(fileData.slug!, page.slug!)}>
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
                    {tags.slice(0, 2).map((tag) => (
                      <span class="post-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </section>
    )
  }

  ArticleGrid.css = `
.article-grid {
  margin-top: 3rem;
}

.article-grid-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 1.1rem;
}

.article-grid-title {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  color: var(--dark);
  letter-spacing: 0.01em;
}

.article-grid-more {
  font-size: 0.78rem;
  color: var(--gray);
  text-decoration: none;
  transition: color 0.16s;
}

.article-grid-more:hover {
  color: var(--secondary);
}

.article-grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 1.1rem;
}

.post-card {
  display: flex;
  flex-direction: column;
  background: var(--light);
  border: 1px solid color-mix(in srgb, var(--lightgray) 76%, transparent);
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  transition: transform 0.16s, border-color 0.16s, box-shadow 0.16s;
}

.post-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--secondary) 42%, transparent);
  box-shadow: 0 6px 20px color-mix(in srgb, var(--dark) 8%, transparent);
}

.post-cover {
  aspect-ratio: 16 / 9;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--secondary) 16%, var(--lightgray)),
    var(--lightgray)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-cover-initial {
  font-size: 1.7rem;
  font-weight: 500;
  font-family: var(--headerFont);
  color: color-mix(in srgb, var(--secondary) 65%, var(--light));
}

.post-body {
  padding: 0.8rem 0.9rem 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
}

.post-title {
  font-size: 0.94rem;
  font-weight: 500;
  margin: 0;
  color: var(--dark);
  line-height: 1.45;
}

.post-desc {
  font-size: 0.79rem;
  color: var(--gray);
  margin: 0;
  line-height: 1.65;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  font-size: 0.73rem;
  color: var(--gray);
}

.post-tag {
  padding: 0.05rem 0.38rem;
  border-radius: 4px;
  background: color-mix(in srgb, var(--lightgray) 70%, transparent);
  color: var(--darkgray);
  font-size: 0.72rem;
}

@media all and (max-width: 600px) {
  .article-grid-list {
    grid-template-columns: 1fr;
  }
}
`

  return ArticleGrid
}) satisfies QuartzComponentConstructor
