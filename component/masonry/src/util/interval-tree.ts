import { start } from "repl"

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
    left: undefined,
    //@ts-expect-error
    right: undefined,
    //@ts-expect-error
    list: null,
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

export interface IntervalTree {
    insert(start: number, end: number, index: number): void,
    remove(index: number): void
    search(start: number, end: number): void;
    size: number;
}

export function createIntervalTree():IntervalTree {
    const tree = {
        node: NULL_NODE,
        size:0
     }

    return {
        insert(start, end, index) {
            let topNode = tree.node
            let tempNode = NULL_NODE
            while (topNode !== NULL_NODE) {
                tempNode = topNode
                if (start === tempNode.start) return
                if (start < topNode.start) topNode = topNode.left
                else topNode = topNode.right
            }
            
            const initNode = {
                start,
                end,
                max: end,
                color: NodeColor.RED,
                left: NULL_NODE,
                right: NULL_NODE
            }


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

