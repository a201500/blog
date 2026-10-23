/**
 * 收藏页的载体切换。
 *
 * 页面结构（由 CollectionGrid 渲染）：
 *   .cl-tab[data-filter="动画"]   顶部分类按钮
 *   .cl-group[data-carrier="动画"] 对应的分组容器
 *
 * 用独立 class（.cl-hide / .cl-tab-active）控制显隐，不用后代选择器 ——
 * 本项目的 CSS 压缩器对组合器空格敏感，class 方案更稳。
 *
 * SPA 模式下每次跳转都要重绑，统一挂在 nav 事件上。
 */
function setupCollectionFilter() {
  const tabs = Array.from(document.querySelectorAll<HTMLElement>(".cl-tab"))
  if (tabs.length === 0) return

  const groups = Array.from(document.querySelectorAll<HTMLElement>(".cl-group"))

  const activate = (carrier: string) => {
    for (const tab of tabs) {
      const on = tab.getAttribute("data-filter") === carrier
      tab.classList.toggle("cl-tab-active", on)
      tab.setAttribute("aria-pressed", on ? "true" : "false")
    }
    for (const group of groups) {
      group.classList.toggle("cl-hide", group.getAttribute("data-carrier") !== carrier)
    }
  }

  const bound: Array<{ el: HTMLElement; handler: () => void }> = []
  for (const tab of tabs) {
    const handler = () => {
      const carrier = tab.getAttribute("data-filter")
      if (carrier) activate(carrier)
    }
    tab.addEventListener("click", handler)
    bound.push({ el: tab, handler })
  }

  // 首屏默认选中第一个（服务端已把第一个设为可见，这里只同步状态）
  const first = tabs[0].getAttribute("data-filter")
  if (first) activate(first)

  window.addCleanup(() => {
    for (const { el, handler } of bound) el.removeEventListener("click", handler)
  })
}

document.addEventListener("nav", setupCollectionFilter)

export {}
