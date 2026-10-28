import { classNames } from "../util/lang"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import {
  clampRating,
  collectionCoverUrl,
  formatScore,
  isCollectionWorkSlug,
  renderStars,
  starsCss,
  toStr,
} from "./collectionShared"

/**
 * 收藏作品页（收藏/<载体>/<作品>）的头部：小封面 + 星级 + 数字分 + 一行短评。
 *
 * 只认作品页，其它页面一律返回 null —— 它挂在 defaultContentPageLayout 上，
 * 不能影响普通文章。
 *
 * 首页卡片不显示封面实图靠「首字占位」兜底，这里同理：
 * collectionCoverUrl 会先查文件在不在，不在就干脆不渲染这一格。
 */
const CollectionWorkHeader: QuartzComponent = ({
  fileData,
  ctx,
  displayClass,
}: QuartzComponentProps) => {
  const slug = fileData.slug ?? ""
  if (!isCollectionWorkSlug(slug)) return null

  const fm = fileData.frontmatter ?? {}
  const rating = clampRating(fm["评分"])
  const note = toStr(fm["短评"])
  const noteEn = toStr(fm["短评En"]) || note
  const cover = collectionCoverUrl(ctx.argv.directory, slug, toStr(fm["封面"]) || undefined)

  // 三样都没有就完全不留痕迹，页面还是干干净净的一个标题
  if (rating === null && !note && !cover) return null

  return (
    <div class={classNames(displayClass, "cw-head")}>
      {cover && (
        <div class="cw-poster">
          <img src={cover} alt="" loading="lazy" decoding="async" />
        </div>
      )}
      <div class="cw-info">
        {rating !== null && (
          <div class="cw-rate">
            {renderStars(rating)}
            <span class="cw-score">{formatScore(rating)}</span>
            <span class="cw-max">/ 10</span>
          </div>
        )}
        {note && (
          <p class="cw-note">
            <span data-lang-block="zh">{note}</span>
            <span data-lang-block="en">{noteEn}</span>
          </p>
        )}
      </div>
    </div>
  )
}

CollectionWorkHeader.css =
  starsCss +
  `
.cw-head {
  display: flex;
  align-items: center;
  gap: 0.95rem;
  margin: 1.05rem 0 1.5rem;
  padding-bottom: 1.15rem;
  border-bottom: 1px solid color-mix(in srgb, var(--lightgray) 72%, transparent);
}

.cw-poster {
  flex: 0 0 54px;
  width: 54px;
  height: 72px;
  border-radius: 5px;
  overflow: hidden;
  background: var(--lightgray);
}

.cw-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cw-info {
  min-width: 0;
}

.cw-rate {
  --cl-star-size: 0.8rem;
  display: flex;
  align-items: baseline;
  gap: 0.44rem;
}

.cw-score {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dark);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.cw-max {
  font-size: 0.72rem;
  color: var(--gray);
}

.cw-note {
  font-size: 0.83rem;
  color: var(--gray);
  line-height: 1.7;
  margin: 0.38rem 0 0;
}

@media all and (max-width: 700px) {
  .cw-poster {
    flex-basis: 46px;
    width: 46px;
    height: 61px;
  }
  .cw-score {
    font-size: 1rem;
  }
}
`

export default (() => CollectionWorkHeader) satisfies QuartzComponentConstructor
