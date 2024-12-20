enum NodeColor  {
    RED = 0,
    BLACK,
    NIL
}

enum NodeStatus {
    DELETE = 0,
    KEPT = 1,
    UNDENFINED= -1,
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
NULL_NODE.pointer = NULL_NODE
NULL_NODE.left = NULL_NODE
NULL_NODE.right = NULL_NODE

interface Tree {
    root: TreeNode,
    size: number
}


function addInterval(treeNode: TreeNode, end: number, index: number): boolean {
    let node: ListNode | null = treeNode.list
    let tempNode: ListNode | undefined;

    while (node) {
      if (node.index === index) return false;
        if (node.end < end) break
        tempNode = node
        node = node.next
    }

    if (!tempNode) treeNode.list = { index, end, next: node }
    if (tempNode)  tempNode.next = {index,end, next: tempNode.next}
    return true
}

function removeInterval(treeNode: TreeNode, index:number):NodeStatus {
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
    return NodeStatus.UNDENFINED
}



function updateMax(node: TreeNode) {
    const max =  node.end;
    if (node.left === NULL_NODE && node.right === NULL_NODE) node.max = max;
    else if (node.left === NULL_NODE) node.max = Math.max(node.right.max, max);
    else if (node.right === NULL_NODE) node.max = Math.max(node.left.max, max)
    else  node.max = Math.max(Math.max(node.left.max,node.right.max),max)
}

function updateMaxUp(node: TreeNode) {
    let x = node;
    while ( x.pointer !== NULL_NODE) {
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

  if (x.pointer === NULL_NODE) tree.root = y;
  else if (x === x.pointer.left) x.pointer.left = y;
  else x.pointer.right = y;

  y.left = x;
  x.pointer = y;

  updateMax(x);
  updateMax(y);
}

function rotateRight(tree: Tree, x: TreeNode) {
  if (x.left === NULL_NODE)  return 
  const y = x.left;
  x.left = y.right;
  if (y.right !== NULL_NODE) { y.right.pointer = x; }
  y.pointer = x.pointer;
   
  if (x.pointer === NULL_NODE) tree.root = y;
  else if (x === x.pointer.right) x.pointer.right = y;
  else x.pointer.left = y;


    y.right = x;
    x.pointer = y;

    updateMax(x);
    updateMax(y);
}


function replaceNode(tree:Tree, x:TreeNode, y: TreeNode) {
    if (x.pointer === NULL_NODE) tree.root = y;
    else if ( x === x.pointer.left) x.pointer.left = y;
    else  x.pointer.right = y;
    y.pointer = x.pointer;
}


function fixRemove(tree: Tree, x: TreeNode) {
  let w;

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
        w.color = NodeColor.RED;
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
        w.right.color = NodeColor.BLACK;
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
          w.right.color = NodeColor.BLACK;
          w.color = NodeColor.RED;
          rotateLeft(tree, w);
          w = x.pointer.left;
        }

        w.color = x.pointer.color;
        x.pointer.color = NodeColor.BLACK;
        w.left.color = NodeColor.BLACK;
        rotateRight(tree, x.pointer);
        x = tree.root;
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
          y = z.pointer.pointer.right;

            if (y.color === NodeColor.RED) {
                z.pointer.color = NodeColor.BLACK;
                y.color = NodeColor.BLACK;
                z.pointer.pointer.color = NodeColor.RED;
                z = z.pointer.pointer;
            } else {
                if (z === z.pointer.right) {
                  z = z.pointer;
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
              z = z.pointer.pointer;
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
  insert(start: number, end: number, index: number): void;
  remove(index: number): void;
    search(start: number, end: number,callback: (index: number, low: number) => any): void;
    size: number;
    root: TreeNode;
}

export function createIntervalTree():IntervalTree {
    const tree:Tree = {
        root: NULL_NODE,
        size:0
     }
    const indexMap: Record<number, TreeNode> = {};

    return {
        insert(start, end, index) {
        let topNode = tree.root;
        let tempNode = NULL_NODE;

            while (topNode !== NULL_NODE) {
              tempNode = topNode;
              if (start === tempNode.start) break;
              if (start < topNode.start) topNode = topNode.left;
              else topNode = topNode.right;
            }

            if (start === tempNode.start && tempNode !== NULL_NODE) {
                if (!addInterval(tempNode, end, index)) return;
                tempNode.end = Math.max(tempNode.end, end);
                updateMax(tempNode);
                updateMaxUp(tempNode);
                indexMap[index] = tempNode;
                tree.size++;
                return;
            }

      //       let topNode: TreeNode = tree.root;
      // let tempNode: TreeNode = NULL_NODE;

      // while (topNode !== NULL_NODE) {
      //   tempNode = topNode;
      //   if (start === tempNode.start) break;
      //   if (start < topNode.start) topNode = topNode.left;
      //   else topNode = topNode.right;
      // }

      // if (start === tempNode.start && tempNode !== NULL_NODE) {
      //   if (!addInterval(tempNode, end, index)) return;
      //   tempNode.end = Math.max(tempNode.end, end);
      //   updateMax(tempNode);
      //   updateMaxUp(tempNode);
      //   indexMap[index] = tempNode;
      //   tree.size++;
      //   return;
      // }
            
            const initNode = {
                start,
                end,
                max: end,
                color: NodeColor.RED,
                pointer: tempNode,
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
                   
                }
               updateMaxUp(initNode);
            }
            
            
  
            fixInsert(tree, initNode);
            indexMap[index] = initNode;
            tree.size++

        },
        
      remove(index: number) {
         const removingNode = indexMap[index];
      if ( !removingNode ) return;
      delete indexMap[index];

        const intervalResult = removeInterval(removingNode, index);
        
      if (intervalResult === NodeStatus.UNDENFINED) return;
        if (intervalResult === NodeStatus.KEPT) {
        removingNode.end = removingNode.list.end;
        updateMax(removingNode);
        updateMaxUp(removingNode);
        tree.size--;
        return;
      }

      let y = removingNode;
      let originalYColor = y.color;
      let x: TreeNode;

      if (removingNode.left === NULL_NODE) {
        x = removingNode.right;
        replaceNode(tree, removingNode, removingNode.right);
      } else if (removingNode.right === NULL_NODE) {
        x = removingNode.left;
        replaceNode(tree, removingNode, removingNode.left);
      } else {
        y = minimumTree(removingNode.right);
        originalYColor = y.color;
        x = y.right;

        if (y.pointer === removingNode) {
          x.pointer = y;
        } else {
          replaceNode(tree, y, y.right);
          y.right = removingNode.right;
          y.right.pointer = y;
        }

        replaceNode(tree, removingNode, y);
        y.left = removingNode.left;
        y.left.pointer = y;
        y.color = removingNode.color;
      }

      updateMax(x);
      updateMaxUp(x);

      if (originalYColor === NodeColor.BLACK) fixRemove(tree, x);
      tree.size--;

        },
        
      

      search(start: number, end: number, callback: any) {
            const stack = [tree.root];
      while (stack.length !== 0) {
        const node = stack.pop() as TreeNode;
        if (node === NULL_NODE || start > node.max) continue;
        if (node.left !== NULL_NODE) stack.push(node.left);
        if (node.right !== NULL_NODE) stack.push(node.right);
        if (node.start <= end && node.end >= start) {
          let curr: ListNode | null = node.list;
          while (curr !== null) {
            if (curr.end >= start) callback(curr.index, node.start);
            curr = curr.next;
          }
        }
      }
           
        },

        get size() {
            return tree.size
        },

        get root() {
            return tree.root;
        }

    }
}
