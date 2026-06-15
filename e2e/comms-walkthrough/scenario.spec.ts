import { expect, type Page, test } from '@playwright/test'
import { installCommsMocks, type MockState } from './install-routes'
import {
  clearHighlight,
  hideCard,
  highlightSelector,
  installOverlay,
  showCard,
} from './overlay'

test.describe.configure({ mode: 'serial' })

const sleep = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms))

const titleCard = async (
  page: Page,
  parts: { eyebrow: string; title: string; sub: string }
): Promise<void> => {
  await showCard(page, parts)
  await sleep(2_200)
  await hideCard(page)
  await sleep(350)
}

type RecipientStrings = {
  readonly title: string
  readonly head: string
  readonly body: string
  readonly cta: string
}

const RECIPIENT_RU: RecipientStrings = {
  title: 'Russian / ru',
  head: 'Вы отписаны',
  body:
    'Вы больше не будете получать рассылку Коммунистического ' +
    'Прометея на этот адрес.',
  cta: 'Подписаться снова по почте',
}

const RECIPIENT_EN: RecipientStrings = {
  title: 'English / en',
  head: 'You have been unsubscribed',
  body:
    'You will no longer receive the Communist Prometheus newsletter ' +
    'at this address.',
  cta: 'Re-subscribe by email',
}

const showFullScreenOverlay = (
  page: Page,
  id: string,
  html: string
): Promise<void> =>
  page.evaluate(
    ({ overlayId, body }) => {
      const existing = document.getElementById(overlayId)
      if (existing !== null) existing.remove()
      const root = document.createElement('div')
      root.id = overlayId
      root.style.cssText =
        'position:fixed;inset:0;z-index:9500;' +
        "background:#0a0a0a;font-family:'Inter',system-ui,sans-serif;" +
        'display:flex;align-items:center;justify-content:center;' +
        'padding:3rem;color:#fff;opacity:0;transition:opacity 0.25s'
      root.innerHTML = body
      document.body.appendChild(root)
      requestAnimationFrame(() => {
        root.style.opacity = '1'
      })
    },
    { overlayId: id, body: html }
  )

const hideFullScreenOverlay = (page: Page, id: string): Promise<void> =>
  page.evaluate(overlayId => {
    const el = document.getElementById(overlayId)
    if (el !== null) {
      el.style.opacity = '0'
      setTimeout(() => {
        el.remove()
      }, 300)
    }
  }, id)

const inboxOverlayHtml = `
<div style="max-width:46rem;width:100%;background:#1a1a1a;
border-radius:0.75rem;padding:0;color:#fff;
box-shadow:0 20px 60px rgb(0 0 0 / 50%);
border:1px solid #2a2a2a;overflow:hidden">
  <div style="background:#222;padding:0.6rem 1rem;display:flex;
  align-items:center;gap:0.4rem;border-bottom:1px solid #2a2a2a">
    <span style="width:12px;height:12px;border-radius:50%;
    background:#ff5f56;display:inline-block"></span>
    <span style="width:12px;height:12px;border-radius:50%;
    background:#ffbd2e;display:inline-block"></span>
    <span style="width:12px;height:12px;border-radius:50%;
    background:#27c93f;display:inline-block"></span>
    <span style="margin-left:1rem;color:hsl(0,0%,55%);font-size:0.8rem">
    Gmail · inbox</span>
  </div>
  <div style="padding:1.5rem 1.75rem">
    <div style="display:flex;justify-content:space-between;
    align-items:flex-start;border-bottom:1px solid #2a2a2a;
    padding-bottom:1rem;margin-bottom:1rem;gap:1.5rem">
      <div style="display:flex;align-items:center;gap:0.75rem;
      min-width:0">
        <div style="width:2.5rem;height:2.5rem;border-radius:50%;
        background:#ee6f57;display:flex;align-items:center;
        justify-content:center;font-weight:700;flex-shrink:0">КП</div>
        <div style="min-width:0">
          <div style="font-weight:600">Communist Prometheus</div>
          <div style="font-size:0.85rem;color:hsl(0,0%,65%)">
          newsletter@comprom.org</div>
        </div>
      </div>
      <a style="display:inline-flex;align-items:center;
      padding:0.45rem 0.95rem;background:transparent;color:#ee6f57;
      border:2px solid #ee6f57;border-radius:0.45rem;
      text-decoration:none;font-weight:700;font-size:0.85rem;
      white-space:nowrap;outline:3px solid rgb(238 111 87 / 30%);
      outline-offset:3px">Unsubscribe</a>
    </div>
    <div style="font-weight:700;font-size:1.2rem;
    margin-bottom:0.5rem">Дайджест за неделю — 4 новые статьи</div>
    <div style="color:hsl(0,0%,65%);font-size:0.9rem;line-height:1.6">
    С момента вашего последнего дайджеста: подборка свежих материалов
    на ru и en…</div>
  </div>
  <div style="padding:1rem 1.75rem;background:rgb(238 111 87 / 8%);
  border-top:1px solid #2a2a2a;font-size:0.85rem;
  color:hsl(0,0%,75%)">
    <strong style="color:#ee6f57">RFC 8058</strong> — клик по кнопке
    отправляет одиночный POST на lists.comprom.org/unsubscribe и
    подтверждает отписку без открытия страницы.
  </div>
</div>`

const recipientCardHtml = (s: RecipientStrings) => `
<article style="max-width:36rem;width:100%;background:#1a1a1a;
border-radius:1rem;padding:2.5rem 2rem;color:#fff;
box-shadow:0 20px 60px rgb(0 0 0 / 50%);
border:1px solid #2a2a2a">
  <div style="font-size:0.7rem;text-transform:uppercase;
  letter-spacing:0.2em;color:#ee6f57;margin-bottom:1.25rem;
  font-weight:700">${s.title}</div>
  <h1 style="margin:0 0 0.75rem;font-size:1.75rem;font-weight:800;
  line-height:1.2">${s.head}</h1>
  <p style="margin:0 0 1.5rem;color:hsl(0,0%,65%);font-size:1rem;
  line-height:1.55">${s.body}</p>
  <a style="display:inline-flex;align-items:center;
  padding:0.7rem 1.15rem;background:transparent;color:#ee6f57;
  border:2px solid #ee6f57;border-radius:0.5rem;
  text-decoration:none;font-weight:700;font-size:0.95rem">
  ${s.cta}</a>
</article>`

const addFakeFailedRun = (state: MockState): void => {
  state.runs = [
    {
      id: state.nextRunId++,
      subscriberId: state.subscribers[0]?.id,
      tickAt: '2026-06-06T09:05:00.000Z',
      articleCount: 4,
      status: 'sent',
      resendId: `re_demo_${state.nextRunId}`,
      error: undefined,
      email: state.subscribers[0]?.email,
    },
    {
      id: state.nextRunId++,
      subscriberId: state.subscribers[1]?.id,
      tickAt: '2026-06-06T09:05:00.000Z',
      articleCount: 2,
      status: 'failed',
      resendId: undefined,
      error: 'resend 503: пример ошибки доставки (демо)',
      email: state.subscribers[1]?.email,
    },
    ...state.runs,
  ]
}

test('comms walkthrough recording', async ({ page }) => {
  const state = await installCommsMocks(page)

  await page.addInitScript(() => {
    localStorage.setItem('gh_token', 'mock-token')
    localStorage.setItem('sso_roles', JSON.stringify(['owner']))
    document.documentElement.setAttribute('data-theme', 'dark')
  })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.goto('/comms')
  await page.waitForSelector('[data-testid="comms-view"]')
  await page.waitForSelector('[data-testid="schedule-editor"]')
  await page.waitForSelector('[data-testid="add-subscriber-form"]')
  await page.waitForLoadState('networkidle')
  await sleep(800)

  await installOverlay(page)

  await test.step('Scene 0 — intro', async () => {
    await showCard(page, {
      eyebrow: 'Видео-инструкция',
      title: 'Управление рассылкой',
      sub: '/comms — подписчики, расписание, история отправок',
    })
    await sleep(3_500)
    await hideCard(page)
    await sleep(500)
  })

  await test.step('Scene 1 — overview', async () => {
    await titleCard(page, {
      eyebrow: 'Сцена 1',
      title: 'Что есть на странице',
      sub: 'Три блока: расписание, подписчики, история',
    })
    const a = await highlightSelector(page, '[data-testid="schedule-editor"]')
    await sleep(1_400)
    await a()
    const b = await highlightSelector(
      page,
      '[data-testid="add-subscriber-form"]'
    )
    await sleep(1_400)
    await b()
    await sleep(500)
  })

  await test.step('Scene 2 — add subscriber', async () => {
    await titleCard(page, {
      eyebrow: 'Сцена 2',
      title: 'Добавить подписчика',
      sub: 'Email + языки рассылки + кнопка',
    })
    const form = page.getByTestId('add-subscriber-form')
    const clear = await highlightSelector(
      page,
      '[data-testid="add-subscriber-form"]'
    )
    await form
      .getByTestId('add-subscriber-email')
      .fill('demo-reader@example.test')
    await sleep(800)
    await form.getByTestId('lang-toggle-ru').click()
    await sleep(400)
    await form.getByTestId('lang-toggle-en').click()
    await sleep(800)
    await form.getByTestId('add-subscriber-submit').click()
    await expect(
      page
        .getByTestId('subscriber-row')
        .filter({ hasText: 'demo-reader@example.test' })
    ).toBeVisible()
    await sleep(1_500)
    await clear()
  })

  await test.step('Scene 3 — edit langs', async () => {
    await titleCard(page, {
      eyebrow: 'Сцена 3',
      title: 'Изменить языки подписчика',
      sub: 'Клик по бейджу — мгновенно сохраняется',
    })
    const row = page
      .getByTestId('subscriber-row')
      .filter({ hasText: 'demo-reader@example.test' })
    await row.scrollIntoViewIfNeeded()
    await sleep(800)
    await row.getByTestId('lang-toggle-it').click()
    await sleep(700)
    await row.getByTestId('lang-toggle-en').click()
    await sleep(1_400)
  })

  await test.step('Scene 4 — remove subscriber', async () => {
    await titleCard(page, {
      eyebrow: 'Сцена 4',
      title: 'Удалить подписчика',
      sub: 'Кнопка ✕ открывает диалог подтверждения',
    })
    const row = page
      .getByTestId('subscriber-row')
      .filter({ hasText: 'demo-reader@example.test' })
    await row.getByTestId('subscriber-remove').click()
    await sleep(1_200)
    await page.getByTestId('remove-subscriber-confirm').click()
    await expect(
      page
        .getByTestId('subscriber-row')
        .filter({ hasText: 'demo-reader@example.test' })
    ).toHaveCount(0)
    await sleep(1_400)
  })

  await test.step('Scene 5 — schedule', async () => {
    await titleCard(page, {
      eyebrow: 'Сцена 5',
      title: 'Настроить расписание',
      sub: 'Crontab + IANA timezone + сохранение',
    })
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
    await sleep(700)
    const clear = await highlightSelector(
      page,
      '[data-testid="schedule-editor"]'
    )
    const cron = page.getByTestId('schedule-cron')
    await cron.click()
    await cron.fill('0 9 * * 1')
    await sleep(700)
    await page.getByTestId('schedule-timezone').selectOption('Europe/Moscow')
    await sleep(900)
    await page.getByTestId('schedule-save').click()
    await expect(page.getByTestId('schedule-next-run')).toContainText(
      '2026-06-08'
    )
    await sleep(1_800)
    await clear()
  })

  await test.step('Scene 5b — cutoff watermark', async () => {
    await titleCard(page, {
      eyebrow: 'Сцена 5б',
      title: 'Отсечка времени',
      sub: 'Единая для всех. Двигается на каждом успешном тике, можно сдвинуть руками.',
    })
    await page.getByTestId('cutoff-editor').scrollIntoViewIfNeeded()
    const clear = await highlightSelector(
      page,
      '[data-testid="cutoff-editor"]'
    )
    const input = page.getByTestId('cutoff-input')
    await input.fill('2026-06-05T12:00')
    await sleep(1_000)
    await page.getByTestId('cutoff-save').click()
    await sleep(1_400)
    await clear()
  })

  await test.step('Scene 5c — test dispatch button', async () => {
    await titleCard(page, {
      eyebrow: 'Сцена 5в',
      title: 'Кнопка тестовой отправки',
      sub: 'Выбери получателей галочками, отправь прямо сейчас — расписание не двигается',
    })
    await page.getByTestId('force-dispatch-panel').scrollIntoViewIfNeeded()
    const clear = await highlightSelector(
      page,
      '[data-testid="force-dispatch-panel"]'
    )
    await page.getByTestId('force-dispatch-select-all').click()
    await sleep(1_000)
    await page.getByTestId('force-dispatch-start').click()
    await sleep(1_400)
    await page.getByTestId('force-dispatch-confirm').click()
    await page.waitForSelector('[data-testid="force-dispatch-result"]', {
      timeout: 5_000,
    })
    await sleep(2_200)
    await clear()
  })

  await test.step('Scene 6 — run history happy path', async () => {
    await titleCard(page, {
      eyebrow: 'Сцена 6',
      title: 'История отправок',
      sub: 'После каждого запуска — новая строка',
    })
    state.runs = [
      {
        id: state.nextRunId++,
        subscriberId: state.subscribers[0]?.id,
        tickAt: '2026-06-06T09:05:00.000Z',
        articleCount: 4,
        status: 'sent',
        resendId: `re_demo_${state.nextRunId}`,
        error: undefined,
        email: state.subscribers[0]?.email,
      },
      ...state.runs,
    ]
    await page.reload()
    await page.waitForSelector('[data-testid="run-history-list"]')
    await installOverlay(page)
    const list = page.getByTestId('run-history-list')
    await list.scrollIntoViewIfNeeded()
    const clear = await highlightSelector(
      page,
      '[data-testid="run-history-list"]'
    )
    await sleep(2_200)
    await clear()
  })

  await test.step('Scene 6b — failed-row demo', async () => {
    await titleCard(page, {
      eyebrow: 'Сцена 6 · пример',
      title: 'Если запуск падает',
      sub: 'Красная строка — клик раскрывает текст ошибки',
    })
    addFakeFailedRun(state)
    await page.reload()
    await page.waitForSelector('[data-testid="run-history-list"]')
    await installOverlay(page)
    const list = page.getByTestId('run-history-list')
    await list.scrollIntoViewIfNeeded()
    await sleep(700)
    const failedRow = page.getByTestId('send-log-failed').first()
    await failedRow.click()
    await sleep(2_500)
  })

  await test.step('Scene 7 — native unsubscribe (RFC 8058)', async () => {
    await titleCard(page, {
      eyebrow: 'Сцена 7',
      title: 'Кнопка отписки в почтовом клиенте',
      sub: 'Gmail, Apple Mail, Outlook — нативная кнопка сверху письма',
    })
    await showFullScreenOverlay(page, 'mail-bar', inboxOverlayHtml)
    await sleep(5_000)
    await hideFullScreenOverlay(page, 'mail-bar')
    await sleep(450)
  })

  await test.step('Scene 7b — confirmation page in recipient language', async () => {
    await titleCard(page, {
      eyebrow: 'Сцена 7 · продолжение',
      title: 'Страница подтверждения',
      sub: 'Открывается на языке подписчика — по Accept-Language',
    })
    await showFullScreenOverlay(
      page,
      'recipient-page',
      recipientCardHtml(RECIPIENT_RU)
    )
    await sleep(3_200)
    await showFullScreenOverlay(
      page,
      'recipient-page',
      recipientCardHtml(RECIPIENT_EN)
    )
    await sleep(3_200)
    await hideFullScreenOverlay(page, 'recipient-page')
    await sleep(450)
  })

  await test.step('Scene 8 — outro', async () => {
    await showCard(page, {
      eyebrow: 'Готово',
      title: 'Подробнее — в editor-user-guide.md',
      sub: 'services/comms-worker/docs/',
    })
    await sleep(3_500)
    await clearHighlight(page)
  })
})
