# Newsletter Editor Walkthrough — Video Script

> **Target runtime:** ~7 minutes
> **Audience:** editors (Russian-speaking)
> **Voice-over language:** Russian (literal speech content)
> **On-screen UI language:** English (the admin SPA is English-only)
> **Recommended capture:** 1920×1080, 30 fps, Loom / OBS
> **Companion doc:** [editor-user-guide.md](./editor-user-guide.md)

## Pre-flight checklist (before recording)

- [ ] Local `bunx wrangler dev --local` running for `comms-worker`.
- [ ] Admin SPA running on `localhost:5173` with comms base pointed
      at the local worker (`VITE_COMMS_BASE=http://127.0.0.1:8787`).
- [ ] `BYPASS_SCHEDULE=1` set in `.dev.vars` so manual dispatch
      works for the demo.
- [ ] DB seeded with two demo subscribers + one schedule row so the
      RunHistory section is not empty.
- [ ] Browser zoom at 110 % so text is legible at 1080p.
- [ ] Recorder cursor highlight ON.

---

## Scene 1 — Intro (0:00 – 0:30)

**On screen:** Title slide → `admin.comprom.org/comms` view.

**Action:** open `/comms`, sit on the page for 5 s so the viewer
sees the layout.

**Voice-over:**

> «Привет. В этом видео я покажу, как редактор рассылки управляет
> подписчиками Communist Prometheus. Мы рассмотрим четыре сценария:
> добавление и удаление подписчика, настройку расписания, ручной
> запуск рассылки и просмотр истории, а также — что видит получатель
> при отписке. Поехали».

---

## Scene 2 — Adding a subscriber (0:30 – 1:30)

**On screen:** `/comms` → focus on the **Subscribers** section.

**Action sequence:**

1. Click into the email input.
2. Type `demo-reader@example.test`.
3. Click the `ru` pill, then the `en` pill (both turn accent
   colour).
4. Press **Add subscriber**.
5. Pause 2 s so the new row animates into the table.

**Voice-over:**

> «Чтобы добавить подписчика, листаем до формы «Add subscriber».
> Вводим email, выбираем языки рассылки — здесь редактор выбирает,
> на каких языках человек хочет получать дайджест. Жмём «Add
> subscriber» и видим новую строку с бейджем «ACTIVE». Email
> проверяется по форме и должен быть валидным; повторное добавление
> того же активного адреса вернёт ошибку».

**Cut-in note:** zoom-in on the new row's **ACTIVE** badge for 1 s.

---

## Scene 3 — Editing subscriber languages (1:30 – 2:15)

**On screen:** the row just added.

**Action sequence:**

1. Click the `it` pill on that row — it turns on.
2. Click the `en` pill on that row — it turns off.
3. Pause 1 s.

**Voice-over:**

> «Список языков можно менять прямо в строке — одним кликом по
> бейджу. Сохранение происходит сразу, без отдельной кнопки. Если
> снять все языки сразу — изменение не сохранится: подписчик должен
> получать хотя бы один язык».

---

## Scene 4 — Removing a subscriber (2:15 – 2:45)

**On screen:** the row just edited.

**Action sequence:**

1. Hover over the trash button at the end of the row.
2. Click it.
3. Pause 1 s; the row disappears.

**Voice-over:**

> «Удалить подписчика — корзина справа. Это жёсткое удаление: запись
> исчезает совсем, отменить нельзя. Если подписчик сам нажал «отписаться»
> или письмо вернулось как bounce — статус подписчика меняется
> автоматически, удалять руками не нужно».

---

## Scene 5 — Schedule editor (2:45 – 4:00)

**On screen:** scroll to the top → **Schedule editor**.

**Action sequence:**

1. Click into the **Crontab** input.
2. Clear it and type `0 9 * * 1` (every Monday 09:00).
3. Open the **Timezone** dropdown and pick `Europe/Moscow`.
4. Pause 1 s — preview line updates ("every Monday at 09:00
   (Europe/Moscow)").
5. Click **Save schedule**.
6. Pause 1 s — Next run timestamp updates.

**Voice-over:**

> «Расписание задаётся в формате crontab — это пять полей, минуты,
> часы, день, месяц, день недели. Вводим выражение, выбираем
> таймзону. Прямо под полем — расшифровка по-человечески, чтобы не
> ошибиться. Под ней — точное время следующего запуска по UTC. Если
> синтаксис некорректный, при сохранении подсветится ошибка от
> парсера — мы ничего не потеряем. Жмём «Save» — следующий тик
> теперь будет в указанный момент».

**Cut-in note:** zoom on the **Next run:** line for 2 s so the
viewer sees the recomputed timestamp.

---

## Scene 6 — Force-dispatch + run history (4:00 – 5:30)

**On screen:** terminal window beside the browser (split screen if
possible).

**Action sequence:**

1. Switch to terminal.
2. Run:
   ```bash
   curl -X POST "http://127.0.0.1:8787/api/dispatch?force=1" \
        -H "Cf-Access-Jwt-Assertion: stub-jwt"
   ```
3. Show the JSON response (`{"sent": 1, "failed": 0, ...}`).
4. Switch back to the browser; scroll to **Run history**.
5. Hard-reload (Ctrl+F5) so the store re-fetches.
6. Point cursor at the brand-new top row — status `sent`, the demo
   email, 3 articles.
7. Show a failed row from earlier (seeded). Click it.
8. The error message expands underneath.

**Voice-over:**

> «Чтобы запустить рассылку вручную — например, для проверки шаблона
> — есть закрытая ручка POST `/api/dispatch?force=1`. В проде она
> вернёт 404, но в dev и e2e она работает, если выставлен флаг
> `BYPASS_SCHEDULE=1`. Зовём, видим краткий отчёт: сколько отправлено,
> сколько провалилось. Возвращаемся в админку, перезагружаем — в
> разделе «Run history» появилась свежая строка. История хранится 90
> дней, новые тики сверху. Провалившиеся отправки подсвечиваются
> красным; кликнув на них, видим точное сообщение об ошибке от
> Resend».

---

## Scene 7 — Recipient unsubscribe flow (5:30 – 6:30)

**On screen:** mail client (real or stub) → confirmation page.

**Action sequence:**

1. Open the digest email sent during Scene 6.
2. Point at the Gmail / Apple Mail one-click **Unsubscribe** button
   at the top (just point — DO NOT click in the live demo).
3. Instead, scroll to the footer and click the
   **«Отписаться» / "Unsubscribe"** link.
4. New tab opens at `lists.comprom.org/unsubscribe?t=…` — confirmation
   page in Russian (because `Accept-Language: ru-RU`).
5. Switch back to admin `/comms` → reload → the subscriber's status
   badge is now **UNSUBSCRIBED**.

**Voice-over:**

> «У каждого получателя есть два способа отписаться. Современные
> почтовые клиенты — Gmail, Apple Mail — показывают кнопку
> «Unsubscribe» в шапке письма; она работает по протоколу RFC 8058
> и не требует подтверждения. Старые клиенты используют ссылку из
> футера письма. Она открывает страницу подтверждения на
> `lists.comprom.org` — на языке получателя, по заголовку
> Accept-Language. Сразу после клика — статус подписчика в админке
> меняется на UNSUBSCRIBED, и на следующих рассылках мы его
> пропустим».

---

## Scene 8 — Outro (6:30 – 7:00)

**On screen:** quick montage of all three sections (3 s each), then
final slide with the user-guide URL.

**Voice-over:**

> «Это весь интерфейс. Подробнее — в editor-user-guide.md в
> репозитории comms-worker. Спасибо за просмотр».

---

## Recording tips

- Hide bookmarks bar and notifications before each take.
- Use a separate Chrome profile with `gh_token` cookie pre-set so
  CF Access doesn't prompt mid-demo.
- Capture with the system clock visible — viewers like seeing the
  worker's structured logs roll in real-time.
- If a take goes wrong, restart from the nearest scene boundary —
  every scene above is self-contained.

---

## Post-production checklist

- [ ] Trim leading 5 s and trailing 3 s of every scene.
- [ ] Add scene-title cards (1 s, fade) between cuts.
- [ ] Burn in the voice-over from `voiceover.txt` (export the
      Russian lines from this file).
- [ ] Final pass: ensure no real email leaks on screen — every demo
      address uses the `example.test` TLD reserved by RFC 6761.
- [ ] Upload to Loom (private link first → review → make public).
