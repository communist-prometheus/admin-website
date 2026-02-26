export interface ASTNode {
  readonly type: number
  readonly children?: readonly ASTNode[]
}

const isElementNode = (node: ASTNode): boolean => node.type === 1

export const getElementDepth = (node: ASTNode, depth = 0): number => {
  if (!node?.children) return depth

  const elementChildren = node.children.filter(isElementNode)

  if (elementChildren.length === 0) return depth

  const childDepths = elementChildren.map(child =>
    getElementDepth(child, depth + 1)
  )
  return Math.max(...childDepths)
}
