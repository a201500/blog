import fs from "fs"
import path from "path"
import { FilePath, FullSlug, joinSegments, pathToRoot, slugifyFilePath } from "../util/path"

/**
 * 收藏模块的共用件：CollectionGrid（收藏页卡片墙）和 CollectionWorkHeader（作品页头部）
 * 都要算评分、拼封面地址、画星星，抽出来一处改两处生效。
 *
 * 为什么 CSS 也导出成字符串：
 * plugins/emitters/componentResources.ts 只遍历 emitter.getQuartzComponents() 拿到的组件，
 * 本文件不是组件，它的 .css 不会被收进 index.css。所以由使用方把 starsCss 拼进自己的 .css。
 */

/** 收藏文件夹 slug（content/收藏/） */
export const COLLECTION_DIR = "收藏"
export const COLLECTION_PREFIX = `${COLLECTION_DIR}/`
/** 封面图目录（相对 content/），frontmatter 里只写文件名 */
export const COVERS_DIR = "attachments/covers"

/** 评分限定在 0–10；不是数字就返回 null（卡片上就不显示星级） */
export const clampRating = (raw: unknown): number | null => {
  const n = typeof raw === "number" ? raw : Number.parseFloat(String(raw ?? ""))
  if (!Number.isFinite(n)) return null
  return Math.min(10, Math.max(0, n))
}

/** 整数显示成 8，小数保留一位（9.4） */
export const formatScore = (n: number): string => (Number.isInteger(n) ? String(n) : n.toFixed(1))

export const toStr = (v: unknown): string => (typeof v === "string" ? v.trim() : "")

/**
 * 是否是一篇「作品笔记」的页面：收藏/<载体>/<作品>
 *
 * 收藏/index（收藏首页）、收藏/动画/index（载体文件夹页）都不算，
 * 直接放在 收藏/ 根下的笔记（parts.length < 3）也不算。
 */
export function isCollectionWorkSlug(slug: string): boolean {
  if (!slug.startsWith(COLLECTION_PREFIX)) return false
  const parts = slug.split("/")
  if (parts.length < 3) return false
  const last = parts[parts.length - 1]
  return last !== "" && last !== "index"
}

/**
 * 封面地址。
 * - 填的是 http(s) 外链 → 原样返回
 * - 填的是文件名 → 拼到 attachments/covers/ 下并 slug 化
 * 构建期先看文件在不在，不在就返回 undefined，让调用方退回「首字占位」，
 * 否则 <img> 会指向不存在的地址，页面上就是破图。
 */
export function collectionCoverUrl(
  contentDir: string,
  currentSlug: string,
  file?: string,
): string | undefined {
  const raw = toStr(file)
  if (!raw) return undefined
  if (/^https?:\/\//.test(raw)) return raw
  const bare = raw.replace(/^.*[\\/]/, "")
  if (!fs.existsSync(path.join(contentDir, COVERS_DIR, bare))) return undefined
  return joinSegments(
    pathToRoot(currentSlug as FullSlug),
    slugifyFilePath(joinSegments(COVERS_DIR, bare) as FilePath),
  )
}

/**
 * 两层星形叠加：底层灰星决定宽度，上层墨绿按 --cl-fill 裁切。
 * 5 星 = 10 分，所以 7.4 分 fills 74%。
 */
export const renderStars = (rating: number) => {
  const fill = Math.min(100, Math.max(0, (rating / 10) * 100))
  return (
    <span class="cl-stars" style={`--cl-fill:${fill.toFixed(2)}%`}>
      <span class="cl-stars-base">★★★★★</span>
      <span class="cl-stars-fill">★★★★★</span>
    </span>
  )
}

/** 星星样式，字号由使用方通过 --cl-star-size 覆盖（卡片小、作品页头部略大） */
export const starsCss = `
.cl-stars {
  position: relative;
  display: inline-block;
  font-size: var(--cl-star-size, 0.7rem);
  line-height: 1;
  letter-spacing: 0.09em;
  white-space: nowrap;
}

.cl-stars-base {
  color: color-mix(in srgb, var(--lightgray) 78%, var(--gray));
}

.cl-stars-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  overflow: hidden;
  width: var(--cl-fill, 0%);
  color: var(--secondary);
}
`
