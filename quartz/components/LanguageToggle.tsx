// @ts-ignore
import languageScript from "./scripts/language.inline"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

/**
 * 中英切换按钮（导航右侧）
 * 配合 language.inline.ts 给 <html> 打 data-language 属性，
 * CSS 按属性显示对应语言的文案块（见 language.scss）。
 */
const LanguageToggle: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div
      class={classNames(displayClass, "language-toggle")}
      role="group"
      aria-label="Language switch"
    >
      <button type="button" class="lang-toggle-btn" data-lang-target="zh" aria-pressed="false">
        中文
      </button>
      <span class="lang-toggle-separator" aria-hidden="true">
        /
      </span>
      <button type="button" class="lang-toggle-btn" data-lang-target="en" aria-pressed="false">
        EN
      </button>
    </div>
  )
}

LanguageToggle.beforeDOMLoaded = languageScript
LanguageToggle.css = `
.language-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  flex-shrink: 0;
}

.lang-toggle-btn {
  background: none;
  border: none;
  padding: 0.1rem 0.15rem;
  cursor: pointer;
  font-family: var(--bodyFont);
  font-size: 0.85rem;
  color: var(--gray);
  transition: color 0.16s;
}

.lang-toggle-btn:hover {
  color: var(--dark);
  background: none;
}

.lang-toggle-btn.active {
  color: var(--dark);
  font-weight: 500;
}

.lang-toggle-separator {
  color: var(--lightgray);
  font-size: 0.85rem;
  user-select: none;
}

@media all and (max-width: 800px) {
  .lang-toggle-btn {
    font-size: 0.8rem;
  }
}
`

export default (() => LanguageToggle) satisfies QuartzComponentConstructor
