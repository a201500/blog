import { FullSlug, resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export interface NavLink {
  text: string
  /** 站内 slug（如 "index"、"tags/index"、"关于"），或 http 开头的完整外链 */
  href: string
}

export default ((opts?: { links: NavLink[] }) => {
  const Nav: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const links = opts?.links ?? []
    const current = fileData.slug ?? ""

    return (
      <nav class={displayClass ? `top-nav ${displayClass}` : "top-nav"}>
        <ul>
          {links.map((l) => {
            const external = /^https?:/.test(l.href)
            const href = external ? l.href : resolveRelative(fileData.slug!, l.href as FullSlug)
            const active = !external && (current === l.href || current.startsWith(l.href + "/"))

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
