import { FullSlug, joinSegments, pathToRoot, resolveRelative } from "../util/path"
import { byDateAndAlphabetical } from "./PageList"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { renderProjectRow, resolveProjectCover, projectCardStyles } from "./ProjectCards"
import { collectProjects } from "./ProjectShowcase"

/**
 * 首页作品集区（复刻 chengliang.pro 的 home-intro）
 * 内容全部读自 index.md 的 frontmatter，改内容不用动代码：
 *
 * ---
 * title: 莫子剑          # 大标题 + 头像首字
 * avatar: avatar.jpg     # 可选，图片放 content 目录
 * lede: 一句话介绍
 * focus: [关注一, 关注二]
 * contact:
 *   GitHub: https://github.com/xxx
 * email: a@b.com
 * ---
 */
export default (() => {
  const HomeIntro: QuartzComponent = ({ fileData, allFiles, cfg }: QuartzComponentProps) => {
    if (fileData.slug !== "index") return null

    const fm = fileData.frontmatter ?? {}
    const name = (fm.title as string) ?? cfg.pageTitle
    const avatar = fm.avatar as string | undefined
    const lede = fm.lede as string | undefined
    const focus = (fm.focus ?? []) as string[]

    // 项目列表：自动聚合 content/项目/ 文件夹下的文章（单一数据源，无需手工维护）
    const projects = collectProjects(allFiles).sort(byDateAndAlphabetical(cfg))
    const contact = (fm.contact ?? {}) as Record<string, string>
    const email = fm.email as string | undefined

    const baseDir = pathToRoot(fileData.slug!)
    const avatarUrl = avatar
      ? /^https?:/.test(avatar)
        ? avatar
        : joinSegments(baseDir, avatar)
      : undefined

    return (
      <section class="home-intro">
        <div class="home-hero-row">
          <div class="home-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} />
            ) : (
              <span>{name.trim().slice(0, 1)}</span>
            )}
          </div>
          <div class="home-hero-text">
            <h1 class="home-title">{name}</h1>
            {lede && <p class="home-lede">{lede}</p>}
          </div>
        </div>

        {focus.length > 0 && (
          <div class="home-status-line">
            <span class="home-status-label">关注</span>
            <span class="home-status-items">
              {focus.map((f) => (
                <span class="home-chip">{f}</span>
              ))}
            </span>
          </div>
        )}

        {projects.length > 0 && (
          <div class="project-section">
            <p class="section-label">项目</p>
            <div class="project-rows">
              {projects.map((p) =>
                renderProjectRow(p, resolveProjectCover(p, baseDir), fileData.slug as FullSlug),
              )}
            </div>
            <a class="project-more" href={resolveRelative(fileData.slug!, "项目/index" as FullSlug)}>
              查看全部项目 →
            </a>
          </div>
        )}

        <div class="home-contact">
          <div class="home-separator"></div>
          <p class="home-find-label">找到我</p>
          <div class="home-social-links">
            {Object.entries(contact).map(([n, u]) => (
              <a href={u} rel="noopener external">
                {n}
              </a>
            ))}
          </div>
          {email && (
            <p class="home-email-line">
              也可以发邮件到 <a href={`mailto:${email}`}>{email}</a>。
            </p>
          )}
        </div>
      </section>
    )
  }

  HomeIntro.css =
    projectCardStyles +
    `
.home-intro {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.home-hero-row {
  display: flex;
  align-items: center;
  gap: 1.1rem;
}

.home-avatar {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--secondary) 30%, var(--lightgray)),
    var(--lightgray)
  );
}

.home-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home-avatar span {
  font-size: 1.9rem;
  font-weight: 500;
  font-family: var(--headerFont);
  color: color-mix(in srgb, var(--secondary) 70%, var(--light));
}

.home-hero-text {
  min-width: 0;
}

.home-title {
  font-size: 1.85rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.25;
  color: var(--dark);
}

.home-lede {
  font-size: 0.95rem;
  color: var(--darkgray);
  margin: 0.4rem 0 0;
  line-height: 1.8;
}

.home-status-line {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.home-status-label {
  font-size: 0.78rem;
  color: var(--gray);
  min-width: 2.4rem;
  flex-shrink: 0;
}

.home-status-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.home-chip {
  display: inline-flex;
  align-items: center;
  min-height: 1.85rem;
  border: 1px solid color-mix(in srgb, var(--lightgray) 76%, transparent);
  background: color-mix(in srgb, var(--lightgray) 48%, transparent);
  border-radius: 5px;
  padding: 0.22rem 0.55rem;
  font-size: 0.82rem;
  font-weight: 500;
  line-height: 1.25;
  color: var(--darkgray);
  text-decoration: none;
  transition: color 0.16s, border-color 0.16s, transform 0.16s;
}

.home-chip:hover {
  color: var(--dark);
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--secondary) 35%, transparent);
}

.section-label {
  font-size: 0.78rem;
  color: var(--gray);
  margin: 0 0 0.7rem;
  font-weight: 500;
}

.home-contact {
  margin-top: 0.3rem;
}

.home-separator {
  height: 1px;
  background: color-mix(in srgb, var(--lightgray) 76%, transparent);
  margin: 1.2rem 0 1rem;
}

.home-find-label {
  font-size: 0.78rem;
  color: var(--gray);
  margin: 0 0 0.5rem;
}

.home-social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.9rem;
}

.home-social-links a {
  font-size: 0.85rem;
  color: var(--darkgray);
  text-decoration: none;
  border-bottom: 1px solid color-mix(in srgb, var(--secondary) 40%, transparent);
  transition: color 0.16s;
}

.home-social-links a:hover {
  color: var(--secondary);
}

.home-email-line {
  font-size: 0.82rem;
  color: var(--gray);
  margin: 0.6rem 0 0;
}

.home-email-line a {
  color: var(--darkgray);
  text-decoration: none;
  border-bottom: 1px solid color-mix(in srgb, var(--secondary) 40%, transparent);
}

@media all and (max-width: 600px) {
  .home-hero-row {
    gap: 0.9rem;
  }

  .home-avatar {
    width: 60px;
    height: 60px;
  }

  .home-title {
    font-size: 1.5rem;
  }

  .home-status-label {
    min-width: auto;
  }
}
`

  return HomeIntro
}) satisfies QuartzComponentConstructor
