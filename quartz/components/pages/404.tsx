import { i18n } from "../../i18n"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

const NotFound: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
  // If baseUrl contains a pathname after the domain, use this as the home link
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
  // 子路径部署时必须补尾斜杠（/blog → /blog/）：
  // 否则 SPA 的 _rebaseHtmlElement 会把 /blog 当成文件名，导致页面内相对链接前缀被吞。
  // 详见 quartz/util/path.ts 与项目 MEMORY 里「目录链接必须写成 xxx/index」的约定。
  const baseDir = url.pathname.endsWith("/") ? url.pathname : url.pathname + "/"

  return (
    <article class="popover-hint">
      <h1>404</h1>
      <p>{i18n(cfg.locale).pages.error.notFound}</p>
      <a href={baseDir}>{i18n(cfg.locale).pages.error.home}</a>
    </article>
  )
}

export default (() => NotFound) satisfies QuartzComponentConstructor
