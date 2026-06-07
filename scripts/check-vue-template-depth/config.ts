export interface Config {
  readonly maxDepth: number
  readonly excludePatterns: readonly string[]
}

export const config: Config = {
  maxDepth: 2,
  excludePatterns: [
    'src/components/icons/**/*.vue',
    'src/components/AppLayout.vue',
    'src/components/AppHeader.vue',
    'src/views/ContentEditView.vue',
    'src/components/CreateContentDialog/**/*.vue',
    'src/components/MarkdownEditor/ArticlesPicker/AddArticleRow.vue',
    'src/views/ContentEditView/PublishConfirmDialog.vue',
    'src/views/ContentEditView/PublishDialogCard.vue',
    'src/views/SettingsView/InviteDialog.vue',
    'src/views/SettingsView/MemberRow.vue',
    'src/views/SettingsView/MembersSection.vue',
    'src/views/CommsView/SubscribersTable.vue',
    'src/views/CommsView/SubscriberRow.vue',
    'src/views/CommsView/RunHistoryList.vue',
    'src/views/CommsView/RunHistoryRow.vue',
    'src/views/CommsView/AddSubscriberForm.vue',
    'src/views/CommsView/TimezoneSelect.vue',
    'src/views/CommsView/ScheduleEditor.vue',
    'src/views/CommsView/CommsView.vue',
    'src/views/CommsView/CommsSection.vue',
    'src/views/CommsView/ForceDispatchPanel.vue',
    'src/views/CommsView/CutoffEditor.vue',
  ],
} as const

const normalizePathSeparators = (path: string): string =>
  path.replace(/\\/g, '/')

const matchesPattern =
  (normalizedPath: string) =>
  (pattern: string): boolean =>
    pattern.includes('**')
      ? normalizedPath.startsWith(pattern.split('**')[0])
      : normalizedPath === pattern

export const isExcluded = (filePath: string): boolean => {
  const cwd = normalizePathSeparators(process.cwd())
  const full = normalizePathSeparators(filePath)
  const relative = full.startsWith(`${cwd}/`)
    ? full.slice(cwd.length + 1)
    : full
  return config.excludePatterns.some(matchesPattern(relative))
}
