import { FullSlug, joinSegments, pathToRoot, resolveRelative } from "../util/path"
import { byDateAndAlphabetical } from "./PageList"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { renderProjectRow, resolveProjectCover, projectCardStyles } from "./ProjectCards"
import { collectProjects } from "./ProjectShowcase"

/**
 * 首页作品集区（复刻 chengliang.pro 的 home-intro），支持中英双语。
 *
 * 内容全部读自 index.md 的 frontmatter，中文写一份、英文写一份（不写英文则英文模式回落中文）：
 *
 * ---
 * title: 莫子剑
 * titleEn: Zijian Mo
 * avatar: avatar.jpg
 * lede: 一句话中文介绍
 * ledeEn: One-line English intro
 * focus: [嵌入式开发, 独立产品]
 * focusEn: [Embedded, Indie Products]
 * email: a@b.com
 * contact:                # 社交链接（中英共用）
 *   GitHub: https://github.com/xxx
 * ---
 *
 * 双语渲染方式：同一段内容渲染两份，分别包在 [data-lang-block="zh|en"] 中，
 * 由 CSS 按 <html data-language> 显示/隐藏，切换无需刷新（见 language.inline.ts）。
 *
 * 注意范围：本组件只负责首页 hero + 项目预览 + 联系方式。
 * 文章正文不翻译（英文正文按需另建 xxx-en.md，frontmatter 写 lang: en）。
 */

/** 双语块：把中英两份内容都渲染出来，CSS 决定显示哪份 */
function LangBlock(props: { zh: any; en: any }) {
  const hasEn = props.en !== undefined && props.en !== null
  return (
    <>
      <span data-lang-block="zh">{props.zh}</span>
      {hasEn && <span data-lang-block="en">{props.en}</span>}
    </>
  )
}

export default (() => {
  const HomeIntro: QuartzComponent = ({ fileData, allFiles, cfg }: QuartzComponentProps) => {
    if (fileData.slug !== "index") return null

    const fm = fileData.frontmatter ?? {}
    const name = (fm.title as string) ?? cfg.pageTitle
    const nameEn = fm.titleEn as string | undefined
    const avatar = fm.avatar as string | undefined
    const lede = fm.lede as string | undefined
    const ledeEn = fm.ledeEn as string | undefined
    const focus = (fm.focus ?? []) as string[]
    const focusEn = (fm.focusEn ?? []) as string[]

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

    const contactEntries = Object.entries(contact)

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
            <h1 class="home-title">
              <LangBlock zh={name} en={nameEn} />
            </h1>
            {lede && (
              <p class="home-lede">
                <LangBlock zh={lede} en={ledeEn} />
              </p>
            )}
          </div>
        </div>

        {focus.length > 0 && (
          <div class="home-status-line">
            <span class="home-status-label">
              <LangBlock zh="关注" en="Focus" />
            </span>
            <span class="home-status-items">
              <span data-lang-block="zh">
                {focus.map((f) => (
                  <span class="home-chip">{f}</span>
                ))}
              </span>
              {focusEn.length > 0 && (
                <span data-lang-block="en">
                  {focusEn.map((f) => (
                    <span class="home-chip">{f}</span>
                  ))}
                </span>
              )}
            </span>
          </div>
        )}

        {projects.length > 0 && (
          <div class="project-section">
            <p class="section-label">
              <LangBlock zh="项目" en="Projects" />
            </p>
            <div class="project-rows">
              {projects.map((p) => {
                const hasEnVersion = allFiles.some(
                  (f) => f.frontmatter?.lang === "en" && f.slug?.startsWith(p.slug!),
                )
                return (
                  <>
                    <span data-lang-block="zh">
                      {renderProjectRow(
                        p,
                        resolveProjectCover(p, baseDir),
                        fileData.slug as FullSlug,
                        "zh",
                        hasEnVersion,
                      )}
                    </span>
                    <span data-lang-block="en">
                      {renderProjectRow(
                        p,
                        resolveProjectCover(p, baseDir),
                        fileData.slug as FullSlug,
                        "en",
                        hasEnVersion,
                      )}
                    </span>
                  </>
                )
              })}
            </div>
            <a class="project-more" href={resolveRelative(fileData.slug!, "项目/index" as FullSlug)}>
              <LangBlock zh="查看全部项目 →" en="All projects →" />
            </a>
          </div>
        )}

        <div class="home-contact">
          <div class="home-separator"></div>
          <p class="home-find-label">
            <LangBlock zh="找到我" en="Find me" />
          </p>
          <div class="home-social-links">
            {contactEntries.map(([n, u]) => (
              <a href={u} rel="noopener external">
                {n}
              </a>
            ))}
          </div>
          {email && (
            <p class="home-email-line">
              <LangBlock
                zh={
                  <>
                    也可以发邮件到 <a href={`mailto:${email}`}>{email}</a>。
                  </>
                }
                en={
                  <>
                    Or email me at <a href={`mailto:${email}`}>{email}</a>.
                  </>
                }
              />
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
