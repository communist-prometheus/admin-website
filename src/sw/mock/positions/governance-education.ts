import type { MockEntry } from '../all-entries'

/** Mock entries for governance and education positions */
export const governanceEducationEntries: readonly MockEntry[] = [
  {
    path: 'src/content/positions/transparent-governance.en.md',
    content: `---
title: Transparent Governance
description: Every decision must be traceable and accountable.
order: 2
lang: en
---

# Transparent Governance

Public institutions must operate transparently.`,
  },
  {
    path: 'src/content/positions/education-access.en.md',
    content: `---
title: Universal Education Access
description: Quality education is a right, not a privilege.
order: 3
lang: en
---

# Universal Education Access

Everyone deserves equal access to knowledge.`,
  },
]
