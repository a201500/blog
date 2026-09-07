import path from "path"
import fs from "fs"
import { Root, Image } from "mdast"
import { visit } from "unist-util-visit"
import { QuartzTransformerPlugin } from "../types"
import { FilePath, slugifyFilePath } from "../../util/path"

/**
 * 提取每篇文章正文里的第一张图片，写入 frontmatter.firstImage。
 * 项目卡片等组件用它自动把文章配图当封面，写文章时只管插图，不用单独配封面。
 *
 * 图片路径来源有两种，靠「文件是否真实存在」区分：
 * 1. Obsidian wiki 嵌入 ![[attachments/x.png]]：到这一步是「相对 content 根」的路径
 * 2. 普通 markdown ![](x.png) / ![](../attachments/x.png)：是「相对当前文章目录」的路径
 * 依次尝试 根相对 → 文章目录相对，哪个文件真实存在就用哪个。
 */
export const FirstImage: QuartzTransformerPlugin = () => {
  return {
    name: "FirstImage",
    markdownPlugins(ctx) {
      const contentDir = ctx?.argv?.directory ?? ""
      return [
        () => {
          return (tree: Root, file) => {
            const data = file.data as any
            if (!data.frontmatter) data.frontmatter = {}

            const fp = data.filePath as string
            if (!fp) return
            const relFp = path.relative(contentDir, fp).replaceAll("\\", "/")
            const dir = path.posix.dirname(relFp)

            const existsOnDisk = (rel: string) => {
              try {
                return fs.existsSync(path.join(contentDir, rel))
              } catch {
                return false
              }
            }

            let found = false
            visit(tree, "image", (node: Image) => {
              if (found) return
              const raw = (node.url ?? "").trim()
              if (!raw || raw.startsWith("data:")) return

              if (/^https?:\/\//.test(raw)) {
                data.frontmatter.firstImage = raw
                found = true
                return
              }

              const decoded = decodeURI(raw)
              const fromRoot = decoded.startsWith("/") ? decoded.slice(1) : decoded
              const fromFileDir = path.posix.join(dir === "." ? "" : dir, decoded)

              // 优先按「相对 content 根」（wiki 链接的主流形态），不存在再按「相对文章目录」
              const joined = existsOnDisk(fromRoot) ? fromRoot : fromFileDir
              data.frontmatter.firstImage = slugifyFilePath(joined as FilePath)
              found = true
            })
          }
        },
      ]
    },
  }
}
