enum NodeColor  {
    RED = 0,
    BLACK,
    NIL
}

enum NodeStatus {
    DELETE = 0,
    KEPT = 1
}

type ListNode = {
    index: number,
    end: number,
    next: ListNode | null
}

interface TreeNode {
    start: number,
    end: number,
    max: number,
    color: NodeColor,
    pointer: TreeNode,
    left: TreeNode,
    right: TreeNode,
    list:ListNode,
}

const NULL_NODE: TreeNode = {
    start: 0,
    end: 0,
    max: 0,
    color: NodeColor.NIL,
    //@ts-expect-error
    pointer: undefined,
    //@ts-expect-error
    left: undefined,
    //@ts-expect-error
    right: undefined,
    //@ts-expect-error
    list: null,
}

interface Tree {
    root: TreeNode,
    size: number
}

NULL_NODE.left = NULL_NODE
NULL_NODE.right = NULL_NODE

function addInterval(treeNode: TreeNode, end: number, index: number): boolean {
    let node: ListNode | null = treeNode.list
    let tempNode: ListNode | undefined;

    while (node) {
        if (node.end === end) return false
        if (node.end < end) break
        tempNode = node
        node = node.next
    }

    if (!tempNode) treeNode.list = { index, end, next: node }
    if (tempNode)  tempNode.next = {index,end, next: tempNode.next}
    return true
}

function removeInterval(treeNode: TreeNode, index:number) {
    let node: ListNode | null = treeNode.list;
    if (node.index === index) {
        if (node.next === null) {
            return NodeStatus.DELETE;
        }
        treeNode.list = node.next;
        return NodeStatus.KEPT;
    }

    let prevNode: ListNode | undefined = node;
    node = node.next;

    while (node !== null) {
         if (node.index === index) {
             prevNode.next = node.next;
             return NodeStatus.KEPT;
         }
        prevNode = node;
        node = node.next;
    }
}

function updateMax(node: TreeNode) {
    const max = node.end;
    if (node.left === NULL_NODE && node.right === NULL_NODE) node.max = max;
    else if (node.left === NULL_NODE) node.max = Math.max(node.right.max, max);
    else if (node.right === NULL_NODE) node.max = Math.max(node.left.max, max)
    else node.max = Math.max(Math.max(node.left.max,node.right.max),max)
}

function updateMaxUp(node: TreeNode) {
    let x = node;
    while (x.pointer !== NULL_NODE) {
        updateMax(x.pointer)
        x = x.pointer
    }
}


function rotateLeft(tree:Tree,x:TreeNode) {
    if (x.right === NULL_NODE) return;
    const y = x.right;
    x.right = y.left;
    if (y.left !== NULL_NODE) y.left.pointer = x;
    y.pointer = x.pointer;

    if (x.pointer == NULL_NODE) tree.root = y;
    else if (x === x.pointer.left) x.pointer.left = y;
    else x.pointer.right = y;

    x.left = x;
    x.pointer = y;

    updateMax(x);
    updateMax(y);
}

function rotateRight(tree:Tree, x:TreeNode) {
    if (x.left === NULL_NODE) {
        return
    }
    const y = x.left;
    x.left = y.right;
    if (y.right !== NULL_NODE) {
        y.right.pointer = x;
    }
    y.pointer = x.pointer

    if (x.pointer === NULL_NODE) tree.root = y;
    else if (x === x.pointer.right) x.pointer.right = y;
    else x.pointer.left = y

    y.right = x;
    x.pointer = y;

    updateMax(x);
    updateMax(y);
}


function replaceNode(tree:Tree, x:TreeNode, y: TreeNode) {
    if (x.pointer === NULL_NODE) tree.root = y;
    else if (x === x.pointer.left) x.pointer.left = y;
    else x.pointer.right = y;
    y.pointer = x.pointer;
}

function fixRemove(tree: Tree, x:TreeNode) {
    let w:TreeNode;
    while (x !== NULL_NODE && x.color === NodeColor.BLACK) {
        if (x === x.pointer.left) {
            w = x.pointer.right;

            if (w.color === NodeColor.RED) {
                w.color = NodeColor.BLACK;
                x.pointer.color = NodeColor.RED;
                rotateLeft(tree, x.pointer);
                w = x.pointer.right;
            }

            if (w.left.color === NodeColor.BLACK && w.right.color === NodeColor.BLACK) {
                w.color = NodeColor.RED
                x = x.pointer;
            } else {
                if (w.right.color === NodeColor.BLACK) {
                    w.left.color = NodeColor.BLACK;
                    w.color = NodeColor.RED;
                    rotateRight(tree, w);
                    w = x.pointer.right;
                }

                w.color = x.pointer.color;
                x.pointer.color = NodeColor.BLACK;
                w.pointer.color = NodeColor.BLACK;
                rotateLeft(tree, x.pointer);
                x = tree.root;
            }
        } else {
            w = x.pointer.left;

            if (w.color === NodeColor.RED) {
                w.color = NodeColor.BLACK;
                x.pointer.color = NodeColor.RED;
                rotateRight(tree, x.pointer);
                w = x.pointer.left;
            }

            if (w.right.color === NodeColor.BLACK && w.left.color === NodeColor.BLACK) {
                w.color = NodeColor.RED;
                x = x.pointer;
            } else {
                if (w.left.color === NodeColor.BLACK) {
                    w.right.color = NodeColor.BLACK
                    w.color = NodeColor.RED
                    rotateLeft(tree, w);
                    w = x.pointer.left;
                }

                w.color = x.pointer.color;
                x.pointer.color = NodeColor.BLACK;
                x.left.color = NodeColor.BLACK;
                rotateRight(tree, x.pointer);
                x = tree.root
            }
        }
    }
    x.color = NodeColor.BLACK;
}

function minimumTree(x: TreeNode) {
    while (x.left !== NULL_NODE) x = x.left
    return x;
}

function fixInsert(tree:Tree, z:TreeNode) {
    let y: TreeNode;   
    while (z.pointer.color === NodeColor.RED) {
        if (z.pointer == z.pointer.pointer.left) {
            y = z.pointer.pointer.right

            if (y.color === NodeColor.RED) {
                z.pointer.color = NodeColor.BLACK;
                y.color = NodeColor.BLACK;
                z.pointer.pointer.color = NodeColor.RED;
                z = z.pointer.pointer;
            } else {
                if (z === z.pointer.right) {
                    z = z.pointer
                    rotateLeft(tree, z);
                }

                z.pointer.color = NodeColor.BLACK;
                z.pointer.pointer.color = NodeColor.RED;
                rotateRight(tree, z.pointer.pointer);
            }
        } else {
            y = z.pointer.pointer.left;
            
            if (y.color === NodeColor.RED) {
                z.pointer.color = NodeColor.BLACK;
                y.color = NodeColor.BLACK;
                z.pointer.pointer.color = NodeColor.RED;
                z = z.pointer.pointer
            } else {
                if (z === z.pointer.left) {
                    z = z.pointer;
                    rotateRight(tree, z);
                }

                z.pointer.color = NodeColor.BLACK;
                z.pointer.pointer.color = NodeColor.RED;
                rotateLeft(tree, z.pointer.pointer);
            }
        }
    }
    tree.root.color = NodeColor.BLACK;
}

export interface IntervalTree {
    insert(start: number, end: number, index: number): void,
    remove(index: number): void
    search(start: number, end: number): void;
    size: number;
}

export function createIntervalTree():IntervalTree {
    const tree:Tree = {
        root: NULL_NODE,
        size:0
     }

    return {
        insert(start, end, index) {
            let topNode = tree.root
            let tempNode = NULL_NODE

            while (topNode !== NULL_NODE) {
                tempNode = topNode
                if (start === tempNode.start) return
                if (start < topNode.start) topNode = topNode.left
                else topNode = topNode.right
            }

            if (start === tempNode.start && tempNode !== NULL_NODE) {
                if (!addInterval(tempNode, end, index)) return;
                tempNode.end = Math.max(tempNode.end, end);
                updateMax(topNode);
                updateMaxUp(tempNode);
                // indexMap[index] = tempNode;
                tree.size++;
                return;
            }
            
            const initNode = {
                start,
                end,
                max: end,
                color: NodeColor.RED,
                pointer:NULL_NODE,
                left: NULL_NODE,
                right: NULL_NODE,
                list: { index, end, next: null}
            }

            if (tempNode === NULL_NODE) {
                tree.root = initNode
            } else {
                if (initNode.start < tempNode.start) {
                    tempNode.left = initNode;
                } else {
                    tempNode.right = initNode;
                    updateMaxUp(initNode);
                }
            }
            
            fixInsert(tree, initNode);
            tree.size++

        },
        
        remove(index) {

        },

        search(start, end) {
            
        },

        get size() {
            return tree.size
        }

    }
}

