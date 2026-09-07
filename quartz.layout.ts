import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// 极简单栏布局（参考 astro-art-portfolio）：
// 无侧栏，顶栏只有 站名 + 搜索 + 明暗切换，内容居中窄栏

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [
    Component.Flex({
      components: [
        {
          Component: Component.Nav({
            links: [
              { text: "首页", href: "index" },
              { text: "标签", href: "tags/index" },
              { text: "关于", href: "关于" },
              { text: "GitHub", href: "https://github.com/a201500" },
            ],
          }),
          grow: true,
        },
        { Component: Component.Search() },
        { Component: Component.Darkmode() },
      ],
      direction: "row",
      alignItems: "center",
    }),
  ],
  afterBody: [
    Component.ArticleGrid({ limit: 12 }),
    Component.Comments({
      provider: "giscus",
      options: {
        repo: "a201500/blog",
        repoId: "R_kgDOUQGfoQ",
        category: "Announcements",
        categoryId: "DIC_kwDOUQGfoc4DFAQG",
        mapping: "pathname",
        strict: false,
        reactionsEnabled: true,
        inputPosition: "top",
        lang: "zh-CN",
      },
    }),
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/a201500",
      博客园: "https://www.cnblogs.com/erased",
      RSS: "/index.xml",
    },
  }),
}

// 左侧固定栏（Cola 版式）：身份卡 + 文章导航
const sidebarLeft = [
  Component.Profile({
    name: "莫工",
    tags: ["暖通制冷", "电子硬件"],
    motto: "写给自己看，顺便能帮到别人。",
    links: {
      GitHub: "https://github.com/a201500",
      博客园: "https://www.cnblogs.com/erased",
      邮箱: "mailto:bcd2027@qq.com",
      RSS: "index.xml",
    },
  }),
  Component.DesktopOnly(Component.Explorer({ title: "文章" })),
]

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [Component.ArticleTitle(), Component.ContentMeta(), Component.TagList()],
  left: sidebarLeft,
  right: [],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.ArticleTitle(), Component.ContentMeta(), Component.TagWall()],
  left: sidebarLeft,
  right: [],
}
