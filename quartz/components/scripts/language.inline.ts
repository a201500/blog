/**
 * 站内中英切换（复刻 chengliang.pro 的做法，但显示/隐藏改由 JS 控制）
 *
 * 机制：
 * 1. 页面里同时渲染中英两份文案，各自包在 [data-lang-block="zh|en"] 里
 * 2. 本脚本在 DOM 就绪前把 <html> 打上 data-language，并给非当前语言的块加 .lang-hidden
 * 3. 语言存 localStorage，默认跟随浏览器语言（中文环境 → zh，其他 → en）
 * 4. 切换时实时增删 .lang-hidden，无需刷新
 * 5. 同时翻译 <title>、导航标签（[data-nav-zh|en]）、giscus 评论区语言
 *
 * 为什么用 JS 而不是纯 CSS 控制显隐：
 * 本项目的 CSS 压缩器会删掉选择器里组合器前后的空格，
 * `html[x] [y]` → `html[x][y]`（变成同一元素，永不匹配），所以后代选择器不可靠。
 * 由 JS 直接打 class 最稳，且切换零延迟。
 */
const LANG_KEY = "preferred-language"

type Lang = "zh" | "en"

const isLang = (v: unknown): v is Lang => v === "zh" || v === "en"

const getLang = (): Lang => {
  let saved: string | null = null
  try {
    saved = localStorage.getItem(LANG_KEY)
  } catch {
    saved = null
  }
  if (isLang(saved)) return saved
  const nav = (navigator.language || "zh").toLowerCase()
  return nav.startsWith("zh") ? "zh" : "en"
}

/** 按语言显示/隐藏文案块，并同步 title、导航、评论区与按钮选中态 */
const applyLang = (lang: Lang) => {
  const root = document.documentElement
  root.setAttribute("data-language", lang)
  root.lang = lang === "zh" ? "zh-CN" : "en"

  // 关键：给「非当前语言」的块打上 lang-hidden
  for (const el of Array.from(document.querySelectorAll("[data-lang-block]"))) {
    const blockLang = el.getAttribute("data-lang-block")
    el.classList.toggle("lang-hidden", blockLang !== lang)
  }

  // 同步 <title>
  const zhTitle = root.getAttribute("data-title-zh")
  const enTitle = root.getAttribute("data-title-en")
  const title = lang === "zh" ? zhTitle : enTitle
  if (title) document.title = title

  // 同步导航标签（Nav 组件把两份文案写在 data-nav-zh / data-nav-en 上）
  for (const navLink of Array.from(document.querySelectorAll("[data-nav-en]"))) {
    const zhText = navLink.getAttribute("data-nav-zh")
    const enText = navLink.getAttribute("data-nav-en")
    const text = lang === "zh" ? zhText : enText
    if (text) navLink.textContent = text
  }

  // 同步 giscus 评论区语言（改完属性重新挂载，否则不会生效）
  for (const box of Array.from(document.querySelectorAll(".giscus"))) {
    const next = lang === "zh" ? "zh-CN" : "en"
    if (box.getAttribute("data-lang") === next) continue
    box.setAttribute("data-lang", next)
    window.dispatchEvent(new CustomEvent("giscus-reload"))
  }

  // 同步按钮选中态
  for (const btn of Array.from(document.querySelectorAll(".lang-toggle-btn"))) {
    const isActive = btn.getAttribute("data-lang-target") === lang
    btn.classList.toggle("active", isActive)
    btn.setAttribute("aria-pressed", String(isActive))
  }
}

applyLang(getLang())

document.addEventListener("nav", () => {
  applyLang(getLang())

  for (const btn of Array.from(document.querySelectorAll(".lang-toggle-btn"))) {
    const onClick = () => {
      const target = btn.getAttribute("data-lang-target")
      if (!isLang(target)) return
      if (document.documentElement.getAttribute("data-language") === target) return
      try {
        localStorage.setItem(LANG_KEY, target)
      } catch {
        /* 隐私模式下 localStorage 可能不可用，忽略 */
      }
      applyLang(target)

      // 触发一次淡入动画
      document.documentElement.classList.add("lang-switching")
      window.setTimeout(() => document.documentElement.classList.remove("lang-switching"), 240)
    }
    btn.addEventListener("click", onClick)
    window.addCleanup(() => btn.removeEventListener("click", onClick))
  }
})

export {}
