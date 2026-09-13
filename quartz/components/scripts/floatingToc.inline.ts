/**
 * 悬浮目录交互：
 * 1. 折叠/展开（点标题栏切换 .collapsed）
 * 2. 滚动时高亮当前章节（IntersectionObserver 观察所有 h1-h6[id]）
 * 3. 点目录项平滑滚动（交给 CSS scroll-behavior: smooth）
 * 4. 页面滚动后才淡入（顶部时隐藏，避免和文章标题抢视觉）
 *
 * SPA 注意：每次 nav 都要重新绑定，旧监听用 window.addCleanup 清理。
 */

/** 当前正在看的标题 id */
let activeId: string | null = null

const updateActive = (id: string) => {
  if (activeId === id) return
  activeId = id
  for (const link of Array.from(document.querySelectorAll(".floating-toc-list a[data-for]"))) {
    const isSelf = link.getAttribute("data-for") === id
    link.classList.toggle("ftoc-active", isSelf)
    if (isSelf) {
      // 目录太长时自动把当前项滚进可视区
      link.scrollIntoView({ block: "nearest" })
    }
  }
}

/**
 * 用「最后一个已滚过顶部的标题」作为当前章节。
 * 比 IntersectionObserver 更稳：长章节 / 快速滚动时不会漏判。
 */
const pickActive = () => {
  const headers = Array.from(
    document.querySelectorAll<HTMLElement>("article h1[id], article h2[id], article h3[id], article h4[id]"),
  )
  if (headers.length === 0) return

  const offset = 90 // 留出顶栏高度
  let current = headers[0]
  for (const h of headers) {
    if (h.getBoundingClientRect().top <= offset) current = h
    else break
  }
  updateActive(current.id)
}

/** 滚动到一定距离后才显示悬浮目录 */
const syncVisibility = () => {
  const toc = document.querySelector(".floating-toc")
  if (!toc) return
  toc.classList.toggle("ftoc-visible", window.scrollY > 220)
}

function setupFloatingToc() {
  const toc = document.querySelector(".floating-toc")
  if (!toc) return

  const head = toc.querySelector(".floating-toc-head")
  const onClick = () => {
    const collapsed = toc.classList.toggle("collapsed")
    head?.setAttribute("aria-expanded", String(!collapsed))
  }
  head?.addEventListener("click", onClick)
  window.addCleanup(() => head?.removeEventListener("click", onClick))

  const onScroll = () => {
    pickActive()
    syncVisibility()
  }
  window.addEventListener("scroll", onScroll, { passive: true })
  window.addCleanup(() => window.removeEventListener("scroll", onScroll))

  // 重置状态（SPA 换页后 activeId 要清空，否则新页面高亮会错）
  activeId = null
  pickActive()
  syncVisibility()
}

document.addEventListener("nav", () => {
  setupFloatingToc()
})

export {}