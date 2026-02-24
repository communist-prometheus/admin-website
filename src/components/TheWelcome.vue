<script setup lang="ts">
import CommunityIcon from './icons/IconCommunity.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import EcosystemIcon from './icons/IconEcosystem.vue'
import SupportIcon from './icons/IconSupport.vue'
import ToolingIcon from './icons/IconTooling.vue'
import WelcomeItem from './WelcomeItem/WelcomeItem.vue'

const s = [
  { icon: DocumentationIcon, heading: 'Docs', text: 'Official Vue docs', linkHref: 'https://vuejs.org/', linkText: 'Read' },
  { icon: ToolingIcon, heading: 'Tool', text: 'Vite build tool', linkHref: 'https://vite.dev/', linkText: 'Go' },
  { icon: EcosystemIcon, heading: 'Eco', text: 'Pinia state', linkHref: 'https://github.com/vuejs/awesome-vue', linkText: 'Go' },
  { icon: CommunityIcon, heading: 'Chat', text: 'Discord chat', linkHref: 'https://chat.vuejs.org', linkText: 'Go' },
  { icon: SupportIcon, heading: 'Help', text: 'Sponsor Vue', linkHref: 'https://vuejs.org/sponsor/', linkText: 'Go' },
]
</script>

<template>
  <WelcomeItem
    v-for="(x, i) in s"
    :key="i"
    :icon="x.icon"
    :heading="x.heading"
    :text="x.text"
    :link-href="x.linkHref"
    :link-text="x.linkText"
  />
</template>
