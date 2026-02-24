import type { Directive, DirectiveBinding, VNode } from 'vue'
import { createVNode, render } from 'vue'

/**
 * Render children config type
 */
interface RenderChild {
  tag: string
  class?: string
  attrs?: Record<string, unknown>
  children?: RenderChild[]
  text?: string
}

/**
 * Directive to render children inside an element
 * Usage: v-children="[{tag: 'img', attrs: {src: '...'}}, {tag: 'section', children: [...]}]"
 */
export const vChildren: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<RenderChild[]>) {
    renderChildren(el, binding.value)
  },
  updated(el: HTMLElement, binding: DirectiveBinding<RenderChild[]>) {
    el.innerHTML = ''
    renderChildren(el, binding.value)
  },
}

/**
 * Render children to element
 * @param el - Target element
 * @param children - Children configuration
 */
function renderChildren(el: HTMLElement, children: RenderChild[]): void {
  if (!children || !Array.isArray(children)) return

  children.forEach(child => {
    const vnode = createVNodeFromConfig(child)
    const container = document.createElement('div')
    render(vnode, container)
    if (container.firstChild) {
      el.appendChild(container.firstChild)
    }
  })
}

/**
 * Create VNode from configuration
 * @param config - Child configuration
 * @returns VNode
 */
function createVNodeFromConfig(config: RenderChild): VNode {
  const props: Record<string, unknown> = {}

  if (config.class) {
    props.class = config.class
  }

  if (config.attrs) {
    Object.assign(props, config.attrs)
  }

  const children = config.children
    ? config.children.map(createVNodeFromConfig)
    : config.text
      ? [config.text]
      : []

  return createVNode(config.tag, props, children)
}
