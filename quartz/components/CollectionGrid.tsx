import fs from "fs"
import path from "path"
import { QuartzPluginData } from "../plugins/vfile"
import { FilePath, FullSlug, joinSegments, pathToRoot, slugifyFilePath } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import collectionFilter from "./scripts/collectionFilter.inline"

/** 收藏文件夹 slug（content/收藏/） */
const DIR = "收藏"
const DIR_PREFIX = `${DIR}/`
/** 封面图目录（相对 content/），frontmatter 里只写文件名 */
const COVERS_DIR = "attachments/covers"

/** 载体固定顺序；有数据才出现标签，没条目就不渲染。未知载体排在最后 */
const CARRIERS = ["动画", "剧集", "电影", "游戏", "小说", "漫画"]
const CARRIERS_EN: Record<string, string> = {
  动画: "Anime",
  剧集: "Series",
  电影: "Films",
  游戏: "Games",
  小说: "Novels",
  漫画: "Comics",
}

const clampRating = (raw: unknown): number | null => {
  const n = typeof raw === "number" ? raw : Number.parseFloat(String(raw ?? ""))
  if (!Number.isFinite(n)) return null
  return Math.min(10, Math.max(0, n))
}

/** 整数显示成 8，小数保留一位（9.4） */
const formatScore = (n: number): string => (Number.isInteger(n) ? String(n) : n.toFixed(1))

const toStr = (v: unknown): string => (typeof v === "string" ? v.trim() : "")

/** 一篇作品笔记解析后的样子 */
interface CollectionItem {
  carrier: string
  name: string
  nameEn: string
  note: string
  noteEn: string
  coverFile?: string
  rating: number | null
  order: number
}

/**
 * 聚合 收藏/<载体>/<作品>.md —— 一个作品一篇笔记，载体就是所在文件夹名。
 *
 * 这样在 Obsidian 里加一部作品 = 在文件夹里新建一篇笔记、填几个普通属性，
 * 不需要动 index.md，也不会碰到「属性面板不支持嵌套对象数组」的问题。
 *
 * 排序：`排序` 数字升序；没填的按评分从高到低排在后面。
 * 直接放在 收藏/ 根下的笔记（不在载体文件夹里）会被忽略。
 */
export function collectCollections(allFiles: QuartzPluginData[]): CollectionItem[] {
  return allFiles
    .filter((f) => {
      const s = f.slug
      if (!s || !s.startsWith(DIR_PREFIX)) return false
      if (s.endsWith("/index")) return false // 文件夹索引页本身
      if (f.frontmatter?.lang === "en") return false // 英文独立版不单独成卡
      if (f.frontmatter?.draft) return false
      return true
    })
    .map((f) => {
      const parts = f.slug!.split("/")
      // 收藏/动画/进击的巨人 → parts[1] 是载体
      const carrier = parts.length >= 3 ? parts[parts.length - 2] : ""
      const fm = f.frontmatter ?? {}
      const orderRaw = Number.parseFloat(String(fm["排序"] ?? ""))
      return {
        carrier,
        name: toStr(fm.title),
        nameEn: toStr(fm.titleEn) || toStr(fm.title),
        note: toStr(fm["短评"]),
        noteEn: toStr(fm["短评En"]) || toStr(fm["短评"]),
        coverFile: toStr(fm["封面"]) || undefined,
        rating: clampRating(fm["评分"]),
        order: Number.isFinite(orderRaw) ? orderRaw : Number.POSITIVE_INFINITY,
      }
    })
    .filter((it) => it.carrier !== "" && it.name !== "")
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      const ra = a.rating ?? -1
      const rb = b.rating ?? -1
      if (ra !== rb) return rb - ra
      return a.name.localeCompare(b.name, "zh")
    })
}

/**
 * 收藏页（/收藏/）：封面 + 名称 + 自评分，纯展示，卡片不可点击。
 *
 * 数据由 collectCollections 从 content/收藏/<载体>/ 下的笔记聚合而来，
 * 所以「加一部作品」= 新建一篇笔记，不用回来改这个文件或 index.md。
 *
 * 双语：每个文本节点包一对 <span data-lang-block>，图片只渲染一次。
 * 不走「整套渲染两遍」的老做法，否则每张封面会被请求两次。
 */
export default (() => {
  const CollectionGrid: QuartzComponent = ({
    fileData,
    allFiles,
    ctx,
  }: QuartzComponentProps) => {
    const slug = fileData.slug ?? ""
    if (slug !== `${DIR}/index` && slug !== DIR) return null

    const fm = fileData.frontmatter ?? {}
    const items = collectCollections(allFiles)
    if (items.length === 0) return null

    const eyebrow = (fm.eyebrow as string) ?? "WATCHED · PLAYED · READ"
    const headline = (fm.headline as string) ?? (fm.title as string) ?? "收藏"
    const headlineEn = (fm.headlineEn as string) ?? (fm.titleEn as string) ?? "Collections"
    const lede = fm.lede as string | undefined
    const ledeEn = (fm.ledeEn as string | undefined) ?? lede

    const baseDir = pathToRoot(slug as FullSlug)
    const coversDir = path.join(ctx.argv.directory, COVERS_DIR)

    /**
     * 封面：外链直接返回；本地只写文件名，拼到 attachments/covers/ 下并做 slug 化。
     * 构建期先看文件在不在 —— 不在就返回 undefined，退回「首字 + 淡色块」占位，
     * 否则 <img> 会指向一个不存在的地址，页面上就是破图。
     */
    const coverUrl = (file?: string): string | undefined => {
      if (!file) return undefined
      if (/^https?:\/\//.test(file)) return file
      const bare = file.replace(/^.*[\\/]/, "")
      if (!fs.existsSync(path.join(coversDir, bare))) return undefined
      return joinSegments(baseDir, slugifyFilePath(joinSegments(COVERS_DIR, bare) as FilePath))
    }

    // 先按 CARRIERS 固定顺序排，未知载体排在最后（按名字）
    const carrierRank = (c: string) => {
      const i = CARRIERS.indexOf(c)
      return i === -1 ? CARRIERS.length : i
    }
    const carriers = Array.from(new Set(items.map((it) => it.carrier))).sort(
      (a, b) => carrierRank(a) - carrierRank(b) || a.localeCompare(b, "zh"),
    )
    const groups = carriers.map((carrier) => ({
      carrier,
      list: items.filter((it) => it.carrier === carrier),
    }))

    if (groups.length === 0) return null

    const renderCard = (item: CollectionItem) => {
      const name = item.name
      if (!name) return null
      const nameEn = item.nameEn || name
      const note = item.note
      const noteEn = item.noteEn || note
      const cover = coverUrl(item.coverFile)
      const rating = item.rating
      const fill = rating === null ? 0 : (rating / 10) * 100

      return (
        <figure class="cl-card">
          <div class={cover ? "cl-cover has-image" : "cl-cover"}>
            {cover ? (
              <img src={cover} alt={name} loading="lazy" decoding="async" />
            ) : (
              <span class="cl-initial">{name.slice(0, 1)}</span>
            )}
          </div>
          <figcaption class="cl-meta">
            <span class="cl-name">
              <span data-lang-block="zh">{name}</span>
              <span data-lang-block="en">{nameEn}</span>
            </span>
            {rating !== null && (
              <span class="cl-rate">
                <span class="cl-stars" style={`--cl-fill:${fill.toFixed(2)}%`}>
                  <span class="cl-stars-base">★★★★★</span>
                  <span class="cl-stars-fill">★★★★★</span>
                </span>
                <span class="cl-score">{formatScore(rating)}</span>
              </span>
            )}
            {note && (
              <span class="cl-note">
                <span data-lang-block="zh">{note}</span>
                <span data-lang-block="en">{noteEn}</span>
              </span>
            )}
          </figcaption>
        </figure>
      )
    }

    return (
      <section class="cl-view">
        <p class="cl-eyebrow">{eyebrow}</p>
        <h1 class="cl-headline">
          <span data-lang-block="zh">{headline}</span>
          <span data-lang-block="en">{headlineEn}</span>
        </h1>
        {lede && (
          <p class="cl-lede">
            <span data-lang-block="zh">{lede}</span>
            <span data-lang-block="en">{ledeEn}</span>
          </p>
        )}

        <div class="cl-tabs" role="tablist">
          {groups.map((g, i) => (
            <button
              type="button"
              class={i === 0 ? "cl-tab cl-tab-active" : "cl-tab"}
              data-filter={g.carrier}
              aria-pressed={i === 0 ? "true" : "false"}
            >
              <span data-lang-block="zh">{g.carrier}</span>
              <span data-lang-block="en">{CARRIERS_EN[g.carrier] ?? g.carrier}</span>
              <span class="cl-tab-count">{g.list.length}</span>
            </button>
          ))}
        </div>

        {groups.map((g, i) => (
          <div class={i === 0 ? "cl-group" : "cl-group cl-hide"} data-carrier={g.carrier}>
            <div class="cl-group-head">
              <h2 class="cl-group-title">
                <span data-lang-block="zh">{g.carrier}</span>
                <span data-lang-block="en">{CARRIERS_EN[g.carrier] ?? g.carrier}</span>
              </h2>
              <span class="cl-group-count">
                <span data-lang-block="zh">{g.list.length} 部</span>
                <span data-lang-block="en">{g.list.length}</span>
              </span>
            </div>
            <div class="cl-grid">{g.list.map((item) => renderCard(item))}</div>
          </div>
        ))}
      </section>
    )
  }

  CollectionGrid.afterDOMLoaded = collectionFilter

  CollectionGrid.css = `
.cl-view {
  margin-top: 0.5rem;
}

.cl-eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  color: var(--gray);
  margin: 0 0 0.6rem;
}

.cl-headline {
  font-size: 2.1rem;
  font-weight: 700;
  font-family: var(--headerFont);
  color: var(--dark);
  margin: 0 0 0.7rem;
  line-height: 1.2;
  letter-spacing: 0.01em;
}

.cl-lede {
  font-size: 0.9rem;
  color: var(--gray);
  line-height: 1.8;
  margin: 0 0 1.8rem;
  max-width: 32rem;
}

.cl-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.42rem;
  margin: 0 0 1.7rem;
}

.cl-tab {
  appearance: none;
  cursor: pointer;
  font-family: var(--bodyFont);
  font-size: 0.78rem;
  line-height: 1.35;
  padding: 0.24rem 0.62rem;
  border-radius: 5px;
  border: 1px solid color-mix(in srgb, var(--lightgray) 76%, transparent);
  background: color-mix(in srgb, var(--lightgray) 40%, transparent);
  color: var(--darkgray);
  transition: color 0.16s, border-color 0.16s, background 0.16s;
}

.cl-tab:hover {
  color: var(--dark);
  border-color: color-mix(in srgb, var(--secondary) 35%, transparent);
}

.cl-tab-active {
  background: color-mix(in srgb, var(--secondary) 14%, transparent);
  color: var(--secondary);
  border-color: color-mix(in srgb, var(--secondary) 40%, transparent);
}

.cl-tab-count {
  margin-left: 0.34rem;
  opacity: 0.66;
  font-variant-numeric: tabular-nums;
}

.cl-group + .cl-group {
  margin-top: 2.4rem;
}

.cl-hide {
  display: none;
}

.cl-group-head {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  padding-top: 0.85rem;
  border-top: 1px solid color-mix(in srgb, var(--lightgray) 70%, transparent);
  margin-bottom: 1.1rem;
}

.cl-group-title {
  font-size: 1.15rem;
  font-weight: 600;
  font-family: var(--headerFont);
  color: var(--dark);
  margin: 0;
  line-height: 1.2;
}

.cl-group-count {
  font-size: 0.74rem;
  color: var(--gray);
  letter-spacing: 0.04em;
}

.cl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 1.5rem 1rem;
}

.cl-card {
  margin: 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cl-cover {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: 6px;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--secondary) 18%, var(--lightgray)),
    var(--lightgray)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.16s;
}

.cl-card:hover .cl-cover {
  transform: translateY(-2px);
}

.cl-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cl-initial {
  font-size: 1.7rem;
  font-weight: 500;
  font-family: var(--headerFont);
  color: color-mix(in srgb, var(--secondary) 60%, var(--light));
}

.cl-meta {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  margin-top: 0.55rem;
}

.cl-name {
  font-size: 0.86rem;
  font-weight: 500;
  color: var(--dark);
  line-height: 1.45;
}

.cl-rate {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* 两层星形叠加：底层灰星决定宽度，上层墨绿按 --cl-fill 裁切 */
.cl-stars {
  position: relative;
  display: inline-block;
  font-size: 0.7rem;
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

.cl-score {
  font-size: 0.76rem;
  font-weight: 500;
  color: var(--darkgray);
  font-variant-numeric: tabular-nums;
}

.cl-note {
  font-size: 0.74rem;
  color: var(--gray);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media all and (max-width: 700px) {
  .cl-headline {
    font-size: 1.65rem;
  }
  .cl-grid {
    grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
    gap: 1.2rem 0.7rem;
  }
  .cl-initial {
    font-size: 1.35rem;
  }
  .cl-lede {
    font-size: 0.85rem;
  }
}
`

  return CollectionGrid
}) satisfies QuartzComponentConstructor
