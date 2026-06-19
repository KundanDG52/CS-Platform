// B-Tree (minimum degree t=2 → max 3 keys per node) with split-on-insert.
export interface BTreeNode { keys: number[]; children: BTreeNode[]; leaf: boolean }
const T = 2 // min degree; max keys = 2t-1 = 3

function newNode(leaf: boolean): BTreeNode { return { keys: [], children: [], leaf } }

function splitChild(parent: BTreeNode, i: number) {
  const child = parent.children[i]
  const z = newNode(child.leaf)
  z.keys = child.keys.splice(T) // right half keys (indices t..2t-2)
  const midKey = child.keys.pop()! // median moves up
  if (!child.leaf) z.children = child.children.splice(T)
  parent.children.splice(i + 1, 0, z)
  parent.keys.splice(i, 0, midKey)
}

function insertNonFull(node: BTreeNode, key: number) {
  let i = node.keys.length - 1
  if (node.leaf) {
    node.keys.push(0)
    while (i >= 0 && key < node.keys[i]) { node.keys[i + 1] = node.keys[i]; i-- }
    node.keys[i + 1] = key
  } else {
    while (i >= 0 && key < node.keys[i]) i--
    i++
    if (node.children[i].keys.length === 2 * T - 1) {
      splitChild(node, i)
      if (key > node.keys[i]) i++
    }
    insertNonFull(node.children[i], key)
  }
}

export function btreeInsert(root: BTreeNode, key: number): BTreeNode {
  if (root.keys.length === 2 * T - 1) {
    const s = newNode(false)
    s.children.push(root)
    splitChild(s, 0)
    insertNonFull(s, key)
    return s
  }
  insertNonFull(root, key)
  return root
}

export function emptyBTree(): BTreeNode { return newNode(true) }

// BFS into levels for rendering
export function btreeLevels(root: BTreeNode): BTreeNode[][] {
  const levels: BTreeNode[][] = []
  let q = [root]
  while (q.length) {
    levels.push(q)
    const next: BTreeNode[] = []
    for (const n of q) next.push(...n.children)
    q = next
  }
  return levels
}
