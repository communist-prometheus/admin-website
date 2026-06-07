import type { Page } from '@playwright/test'

/** Stylesheet that powers the storyboard: hides dev chrome, centers the
 * `/comms` view, ships caption + highlight + intro components. */
export const OVERLAY_CSS = `
[aria-label="Dev notification triggers"],
[data-testid="trace-overlay"],
[data-testid*="sw-debug"],
.dev-trigger,
.trace-overlay,
.sw-debug-panel { display: none !important; }

.comms { margin: 0 auto !important; padding: 2rem 2rem 4rem !important; }

.tutorial-caption {
  position: fixed; inset: 0 0 auto 0; z-index: 9000;
  display: flex; align-items: center; justify-content: center;
  padding: 1.3rem 2.5rem; min-height: 4.5rem;
  background: linear-gradient(180deg,
    rgb(20 20 20 / 95%), rgb(20 20 20 / 70%)) !important;
  color: #fff !important;
  font: 700 1.55rem/1.3 system-ui, "Segoe UI", sans-serif !important;
  text-shadow: 0 1px 3px rgb(0 0 0 / 60%);
  border-bottom: 3px solid #ee6f57;
  transform: translateY(-100%); transition: transform 0.45s ease;
  pointer-events: none;
}
.tutorial-caption.is-visible { transform: translateY(0); }

.tutorial-highlight {
  outline: 3px solid #ee6f57 !important;
  outline-offset: 4px !important;
  box-shadow:
    0 0 0 8px rgba(238,111,87,0.35),
    0 0 24px 8px rgba(238,111,87,0.45) !important;
  border-radius: 0.5rem !important;
  transition: outline 0.2s, box-shadow 0.2s;
  position: relative;
  z-index: 5;
}

.tutorial-card {
  position: fixed; inset: 0; z-index: 10000;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 1.2rem;
  background: #0a0a0a;
  color: #fff; padding: 4rem;
  opacity: 0; transition: opacity 0.2s ease;
  pointer-events: none;
}
.tutorial-card.is-visible { opacity: 1; pointer-events: auto; }
.tutorial-card .eyebrow {
  font: 700 0.95rem/1 system-ui; letter-spacing: 0.22em;
  text-transform: uppercase; color: #ee6f57;
}
.tutorial-card .title {
  font: 800 4rem/1.05 system-ui; max-width: 60rem; text-align: center;
}
.tutorial-card .sub {
  font: 400 1.6rem/1.4 system-ui; max-width: 50rem;
  text-align: center; color: hsl(0,0%,75%);
}
.tutorial-card .footer {
  position: absolute; bottom: 3rem; font: 500 1rem/1 system-ui;
  color: hsl(0,0%,55%);
}
`

/** Install the storyboard stylesheet and seed empty caption + card nodes. */
export const installOverlay = async (page: Page): Promise<void> => {
  await page.addStyleTag({ content: OVERLAY_CSS })
  await page.evaluate(() => {
    const caption = document.createElement('div')
    caption.id = 'tutorial-caption'
    caption.className = 'tutorial-caption'
    document.body.appendChild(caption)
    const card = document.createElement('div')
    card.id = 'tutorial-card'
    card.className = 'tutorial-card'
    card.innerHTML =
      '<div class="eyebrow" id="card-eyebrow"></div>' +
      '<div class="title" id="card-title"></div>' +
      '<div class="sub" id="card-sub"></div>' +
      '<div class="footer">Communist Prometheus · Newsletter</div>'
    document.body.appendChild(card)
  })
}

/** Show or hide the top caption banner. */
export const setCaption = (page: Page, text: string): Promise<void> =>
  page.evaluate(t => {
    const el = document.getElementById('tutorial-caption')
    if (el === null) return
    el.textContent = t
    if (t === '') el.classList.remove('is-visible')
    else el.classList.add('is-visible')
  }, text)

/** Show / hide the full-screen title card. */
export const showCard = (
  page: Page,
  parts: {
    readonly eyebrow: string
    readonly title: string
    readonly sub: string
  }
): Promise<void> =>
  page.evaluate(p => {
    const root = document.getElementById('tutorial-card')
    const e = document.getElementById('card-eyebrow')
    const t = document.getElementById('card-title')
    const s = document.getElementById('card-sub')
    if (root === null || e === null || t === null || s === null) return
    e.textContent = p.eyebrow
    t.textContent = p.title
    s.textContent = p.sub
    root.classList.add('is-visible')
  }, parts)

export const hideCard = (page: Page): Promise<void> =>
  page.evaluate(() => {
    document.getElementById('tutorial-card')?.classList.remove('is-visible')
  })

/** Apply a glowing outline to a target. Returns a cleanup function. */
export const highlightSelector = async (
  page: Page,
  selector: string
): Promise<() => Promise<void>> => {
  await page.evaluate(sel => {
    document.querySelectorAll('.tutorial-highlight').forEach(n => {
      n.classList.remove('tutorial-highlight')
    })
    document.querySelector(sel)?.classList.add('tutorial-highlight')
  }, selector)
  return () =>
    page.evaluate(sel => {
      document.querySelector(sel)?.classList.remove('tutorial-highlight')
    }, selector)
}

export const clearHighlight = (page: Page): Promise<void> =>
  page.evaluate(() => {
    document.querySelectorAll('.tutorial-highlight').forEach(n => {
      n.classList.remove('tutorial-highlight')
    })
  })
