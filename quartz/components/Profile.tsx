import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { pathToRoot, joinSegments } from "../util/path"
import { classNames } from "../util/lang"

interface Options {
  /** 显示名，默认取站点标题 */
  name?: string
  /** 头像文字（取不到图片时显示），默认取名字首字 */
  initial?: string
  /** 头像图片，放在 quartz/static 下的文件名，如 "avatar.png" */
  avatar?: string
  /** 彩色小标签，最多建议两个 */
  tags?: string[]
  /** 一句话简介 */
  motto?: string
  /** 外部链接，如 GitHub / 邮箱 / RSS */
  links?: Record<string, string>
}

export default ((opts?: Options) => {
  const Profile: QuartzComponent = ({ cfg, fileData, displayClass }: QuartzComponentProps) => {
    const name = opts?.name ?? cfg.pageTitle
    const initial = opts?.initial ?? name.trim().slice(0, 1) ?? "?"
    const tags = opts?.tags ?? []
    const motto = opts?.motto
    const avatar = opts?.avatar
    const links = opts?.links ?? {}
    const baseDir = pathToRoot(fileData.slug!)
    const resolve = (url: string) =>
      /^(https?:|mailto:|#)/.test(url) ? url : joinSegments(baseDir, url)

    return (
      <div class={classNames(displayClass, "profile")}>
        <div class="profile-card">
          <a class="profile-avatar" href={baseDir} aria-label={name}>
            {avatar ? (
              <img src={joinSegments(baseDir, "static", avatar)} alt={name} />
            ) : (
              <span>{initial}</span>
            )}
          </a>
          <div class="profile-text">
            <a class="profile-name" href={baseDir}>
              {name}
            </a>
            {tags.length > 0 && (
              <div class="profile-tags">
                {tags.map((tag, i) => (
                  <span class={i === 0 ? "profile-tag" : "profile-tag profile-tag-alt"}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        {motto && <p class="profile-motto">{motto}</p>}
        {Object.keys(links).length > 0 && (
          <ul class="profile-links">
            {Object.entries(links).map(([text, url]) => (
              <li>
                <a href={resolve(url)} rel="noopener external">
                  {text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  Profile.css = `
.profile {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background: var(--lightgray);
  border-radius: 10px;
}

.profile-avatar {
  width: 54px;
  height: 54px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--secondary);
  color: var(--light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 600;
  text-decoration: none;
  overflow: hidden;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.profile-name {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--dark);
  text-decoration: none;
  line-height: 1.3;
}

.profile-name:hover {
  color: var(--secondary);
}

.profile-tags {
  display: flex;
  gap: 0.35rem;
  margin-top: 0.35rem;
  flex-wrap: wrap;
}

.profile-tag {
  font-size: 0.72rem;
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  background: var(--secondary);
  color: var(--light);
}

.profile-tag-alt {
  background: var(--tertiary);
}

.profile-motto {
  font-size: 0.85rem;
  color: var(--gray);
  margin: 0;
  line-height: 1.7;
}

.profile-links {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.9rem;
  margin: 0;
  padding: 0;
}

.profile-links a {
  font-size: 0.82rem;
  color: var(--darkgray);
  text-decoration: none;
}

.profile-links a:hover {
  color: var(--secondary);
}
`

  return Profile
}) satisfies QuartzComponentConstructor
