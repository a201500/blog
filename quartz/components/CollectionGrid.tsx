import { QuartzPluginData } from "../plugins/vfile"
import { FullSlug, resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import collectionFilter from "./scripts/collectionFilter.inline"
import {
  COLLECTION_DIR,
  COLLECTION_PREFIX,
  clampRating,
  collectionCoverUrl,
  formatScore,
  renderStars,
  starsCss,
  toStr,
} from "./collectionShared"

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
  /** 作品页地址，卡片有正文时用它做链接 */
  slug: FullSlug
  /** 正文写没写。空笔记的卡片不可点，避免点进去是一片空白 */
  hasBody: boolean
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
      if (!s || !s.startsWith(COLLECTION_PREFIX)) return false
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
        slug: f.slug as FullSlug,
        // 正文纯文本由 plugins/transformers/description.ts 写进 file.data.text，
        // 空笔记就是空字符串。ContentMeta 判断「有没有正文」用的也是同一个字段。
        hasBody: !!(f.text && f.text.trim()),
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
 * 收藏页（/收藏/）：封面 + 名称 + 自评分。
 *
 * 卡片默认只是陈列；某篇作品写了正文，那张卡就整张变成链接（点进去看感想），
 * 封面右上角多一个「感想」胶囊标记。没写正文的卡不可点，避免点进空白页。
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
    if (slug !== `${COLLECTION_DIR}/index` && slug !== COLLECTION_DIR) return null

    const fm = fileData.frontmatter ?? {}
    const items = collectCollections(allFiles)
    if (items.length === 0) return null

    const eyebrow = (fm.eyebrow as string) ?? "WATCHED · PLAYED · READ"
    const headline = (fm.headline as string) ?? (fm.title as string) ?? "收藏"
    const headlineEn = (fm.headlineEn as string) ?? (fm.titleEn as string) ?? "Collections"
    const lede = fm.lede as string | undefined
    const ledeEn = (fm.ledeEn as string | undefined) ?? lede

    const coverUrl = (file?: string): string | undefined =>
      collectionCoverUrl(ctx.argv.directory, slug, file)

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

      const inner = (
        <>
          <div class={cover ? "cl-cover has-image" : "cl-cover"}>
            {cover ? (
              // alt 留空：名字在下面已经有一份，读屏不要念两遍
              <img src={cover} alt="" loading="lazy" decoding="async" />
            ) : (
              <span class="cl-initial">{name.slice(0, 1)}</span>
            )}
            {item.hasBody && (
              <span class="cl-badge">
                <span data-lang-block="zh">感想</span>
                <span data-lang-block="en">Review</span>
              </span>
            )}
          </div>
          <div class="cl-meta">
            <span class="cl-name">
              <span data-lang-block="zh">{name}</span>
              <span data-lang-block="en">{nameEn}</span>
            </span>
            {rating !== null && (
              <span class="cl-rate">
                {renderStars(rating)}
                <span class="cl-score">{formatScore(rating)}</span>
              </span>
            )}
            {note && (
              <span class="cl-note">
                <span data-lang-block="zh">{note}</span>
                <span data-lang-block="en">{noteEn}</span>
              </span>
            )}
          </div>
        </>
      )

      // 只有写了正文的作品才整张卡变成链接；空笔记保持不可点
      return item.hasBody ? (
        <a class="cl-card cl-card-link" href={resolveRelative(slug as FullSlug, item.slug)}>
          {inner}
        </a>
      ) : (
        <figure class="cl-card">{inner}</figure>
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

  // 星形样式来自 collectionShared（它不是组件，CSS 不会被自动收集，只能手动拼）
  CollectionGrid.css =
    starsCss +
    `
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

/* 整张卡可点时用 <a> 包起来；base.scss 的 a{color/font-weight} 会漏进来，必须压回去 */
.cl-card-link {
  color: inherit;
  font-weight: inherit;
  text-decoration: none;
}

.cl-card-link:hover {
  text-decoration: none;
}

.cl-card-link:focus-visible {
  outline: 2px solid var(--secondary);
  outline-offset: 3px;
  border-radius: 6px;
}

.cl-card-link:hover .cl-cover {
  transform: translateY(-2px);
}

.cl-card-link:hover .cl-name {
  color: var(--secondary);
}

/* 封面右上角「有感想」标记：跟着封面走，不挡标题 */
.cl-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: color-mix(in srgb, #17181c 62%, transparent);
  color: #fff;
  font-size: 0.62rem;
  line-height: 1;
  padding: 0.26rem 0.4rem;
  border-radius: 4px;
  pointer-events: none;
  letter-spacing: 0.02em;
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
  transition: color 0.16s;
}

.cl-rate {
  display: flex;
  align-items: center;
  gap: 0.4rem;
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
