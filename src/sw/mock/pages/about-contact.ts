import type { MockEntry } from '../all-entries'

/** Mock entries for "about" and "contact" pages */
export const aboutContactEntries: readonly MockEntry[] = [
  {
    path: 'src/content/pages/about.en.md',
    content: `---
title: About Us
lang: en
---

# About Us

We are a movement for transparent digital governance.`,
  },
  {
    path: 'src/content/pages/about.ru.md',
    content: `---
title: О нас
lang: ru
---

# О нас

Мы — движение за прозрачное цифровое управление.`,
  },
  {
    path: 'src/content/pages/contact.en.md',
    content: `---
title: Contact
lang: en
---

# Contact

Reach out to us through our community channels.`,
  },
]
