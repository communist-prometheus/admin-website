import type { BlockDef, WrapDef } from './command-types'

/** Wrap commands: bold, italic, code, strikethrough */
export const WRAP_CMDS: readonly WrapDef[] = [
  {
    label: 'B',
    title: 'Bold (Ctrl+B)',
    testId: 'cmd-bold',
    pre: '**',
    suf: '**',
    key: 'b',
  },
  {
    label: 'I',
    title: 'Italic (Ctrl+I)',
    testId: 'cmd-italic',
    pre: '*',
    suf: '*',
    key: 'i',
  },
  {
    label: '<>',
    title: 'Code (Ctrl+E)',
    testId: 'cmd-code',
    pre: '`',
    suf: '`',
    key: 'e',
  },
  {
    label: 'S',
    title: 'Strikethrough',
    testId: 'cmd-strike',
    pre: '~~',
    suf: '~~',
  },
] as const

/** Block commands: headings, lists, quote, etc. */
export const BLOCK_CMDS: readonly BlockDef[] = [
  { label: 'H2', title: 'Heading 2', prefix: '## ' },
  { label: 'H3', title: 'Heading 3', prefix: '### ' },
  { label: '•', title: 'Bullet list', prefix: '- ' },
  { label: '1.', title: 'Ordered list', prefix: '1. ' },
  { label: '>', title: 'Blockquote', prefix: '> ' },
] as const
