export interface ASTNode {
  readonly type: number
  readonly children?: readonly ASTNode[]
}

const isElementNode = (node: ASTNode): boolean => node.type === 1

const calculateChildDepth =
  (currentDepth: number) =>
  (child: ASTNode): number =>
    isElementNode(child)
      ? getElementDepth(child, currentDepth + 1)
      : currentDepth

export const getElementDepth = (node: ASTNode, depth = 0): number => {
  if (!node?.children) return depth

  const childDepths = node.children.map(calculateChildDepth(depth))
  return Math.max(depth, ...childDepths)
}
