import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// 纯单栏作品集布局（对齐 chengliang.pro）：
// 无侧栏，顶栏 = 首页标识 + 导航(博客/项目) + 搜索 + 明暗切换，内容居中窄栏

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [
    Component.Flex({
      components: [
        {
          Component: Component.Nav({
            brand: { text: "莫", href: "index" },
            links: [
              { text: "博客", href: "博客" },
              { text: "项目", href: "项目" },
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
    Component.PostList({ limit: 3 }),
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

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
    Component.HomeIntro(),
  ],
  left: [],
  right: [],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagWall(),
    Component.ProjectShowcase(),
  ],
  left: [],
  right: [],
}
