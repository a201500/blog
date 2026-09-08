import { FullSlug, resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export interface NavLink {
  text: string
  /** 站内 slug（如 "index"、"tags/index"、"关于"），或 http 开头的完整外链 */
  href: string
}

interface Options {
  links: NavLink[]
  /** 左上角圆形标识（点回首页） */
  brand?: { text: string; href: string }
}

export default ((opts?: Options) => {
  const Nav: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const links = opts?.links ?? []
    const brand = opts?.brand
    const current = fileData.slug ?? ""

    return (
      <nav class={displayClass ? `top-nav ${displayClass}` : "top-nav"}>
        {brand && (
          <a
            class="top-nav-brand"
            href={resolveRelative(fileData.slug!, brand.href as FullSlug)}
            aria-label={brand.text}
          >
            {brand.text}
          </a>
        )}
        <ul>
          {links.map((l) => {
            const external = /^https?:/.test(l.href)
            const href = external ? l.href : resolveRelative(fileData.slug!, l.href as FullSlug)
            // 文件夹链接写成 xxx/index 时，子页面（如 博客/某文章）也要高亮父级导航
            const dirPrefix = l.href.endsWith("/index")
              ? l.href.slice(0, -"/index".length)
              : l.href
            const active =
              !external &&
              (current === l.href ||
                current.startsWith(l.href + "/") ||
                current.startsWith(dirPrefix + "/"))

            return (
              <li>
                {external ? (
                  <a href={href} rel="noopener external">
                    {l.text}
                  </a>
                ) : (
                  <a href={href} class={active ? "active" : undefined}>
                    {l.text}
                  </a>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }

  Nav.css = `
.top-nav {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.top-nav-brand {
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 50%;
  background: var(--secondary);
  color: var(--light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 500;
  text-decoration: none;
  flex-shrink: 0;
  transition: transform 0.16s;
}

.top-nav-brand:hover {
  transform: scale(1.06);
}

.top-nav ul {
  list-style: none;
  display: flex;
  gap: 1.35rem;
  margin: 0;
  padding: 0;
}

.top-nav a {
  font-size: 0.85rem;
  color: var(--gray);
  text-decoration: none;
  padding-bottom: 3px;
  border-bottom: 2px solid transparent;
  transition: color 0.16s, border-color 0.16s;
}

.top-nav a:hover {
  color: var(--dark);
}

.top-nav a.active {
  color: var(--dark);
  border-bottom-color: var(--secondary);
}

@media all and (max-width: 800px) {
  .top-nav ul {
    gap: 1rem;
  }

  .top-nav a {
    font-size: 0.8rem;
  }
}
`

  return Nav
}) satisfies QuartzComponentConstructor
