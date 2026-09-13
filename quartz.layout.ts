import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// 纯单栏作品集布局（对齐 chengliang.pro）：
// 无侧栏，顶栏 = 首页标识 + 导航(博客/项目) + 搜索 + 语言切换 + 明暗切换，内容居中窄栏
//
// 双语机制（只覆盖首页 + 项目页；文章正文不翻，交给访客用浏览器自带翻译）：
// - frontmatter 里 xxx 写中文、xxxEn 写英文，组件两份都渲染，CSS/JS 按语言显隐
// - 顶栏语言切换按钮见 components/LanguageToggle.tsx
// - 正文页用 ArticlesOnly：只展示文章自身内容，避免首页/项目页专属组件串到文章里

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
              // folder 链接必须写成 .../index，让生成结果为带尾斜杠的 ./博客/
              // 否则 SPA 的 normalizeRelativeURLs 会把页面内相对链接算少一层 → 二次点击 404
              // textEn：切到 EN 时由 language.inline.ts 读取 data-nav-en 替换文本（见 Nav.tsx）
              { text: "博客", textEn: "Blog", href: "博客/index" },
              { text: "项目", textEn: "Projects", href: "项目/index" },
            ],
          }),
          grow: true,
        },
        { Component: Component.Search() },
        { Component: Component.LanguageToggle() },
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
      RSS: "https://a201500.github.io/blog/index.xml",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
    // 有独立英文版（xxx-en.md）时，顶部露出「English version →」入口
    Component.ArticleLangNote(),
    // 首页专属 hero：只认 slug === "index"，写在这里不影响其它文章页
    Component.HomeIntro(),
    // 悬浮目录：fixed 定位在正文右侧空白区，不参与文档流
    Component.FloatingToc(),
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
