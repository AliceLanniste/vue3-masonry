
import { createIntervalTree, IntervalTree} from '../util/interval-tree'
import { describe, expect, it } from "vitest";
//@ts-ignore
const toExpectedIdSorted = (result) =>
  //@ts-ignore
  result.map(([, , id]) => id).sort((a, b) => a - b);
  //@ts-ignore
const search = (tree, low, high) => {
  const results: any[] = [];
  //@ts-ignore
  tree.search(low, high, (...args) => results.push(args));
  return results;
};

const getRandomInt = (min:number, max:number):number => {
  min = Math.ceil(min);
  max = Math.floor(max);
   return Math.floor(Math.random() * (max - min + 1)) + min;
}
//@ts-ignore
const expectSearch = (records, tree, low, high) => {
  //@ts-ignore
  const expectation = records.filter((record) => {
    if (!record) {
      return false;
    }
    const [otherLow, otherHigh] = record;
    return otherLow <= high && otherHigh >= low;
  });
  expect(toIdSorted(search(tree, low, high)).join(",")).toEqual(
    toExpectedIdSorted(expectation).join(",")
  );
};
//@ts-ignore
const toIdSorted = (result) => result.map(([id]) => id).sort((a, b) => a - b);


const shuffle = (original:any[]) => {
  const array = original.concat();
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

  describe("tree", () => {
    it("should insert, remove and find", () => {
      const tree = createIntervalTree();
      const list = [
        [15, 23, 1],
        [8, 9, 2],
        [25, 30, 3],
        [19, 20, 4],
        [16, 21, 5],
        [5, 8, 6],
        [26, 26, 7],
        [0, 21, 8],
        [17, 19, 9],
        [6, 10, 10],
      ];
      for (const [start, end, index] of list) {
        tree.insert(start, end, index);
      }
      expect(tree.size).toBe(10);
      
      const results = [
        [0, 30, "1,2,3,4,5,6,7,8,9,10"],
        [7, 8, "2,6,8,10"],
        [0, 1, "8"],
        [-2, -1, ""],
      ];
      
      for (const [low, high, result] of results) {
        expect(toIdSorted(search(tree, low, high)).join(",")).toEqual(result);
      }


      for (let i = 0; i < 10000; ++i) {
        for (const [, , id] of shuffle(list)) {
          tree.remove(id);
        }
      }
       console.log("tree.size", tree.size);
      expect(tree.size).toBe(0);


      
    });

    it("should insert and find", () => {
      //@ts-ignore
      const list = [];
      const tree = createIntervalTree();
      let id = 0;
      const addItem = (list:any[], tree:IntervalTree) => {
        const low = getRandomInt(0, 100);
        const record = [low, low + getRandomInt(0, 100), ++id];
        list.push(record);
        //@ts-ignore
        tree.insert(...record);
      }

      for (let i = 0; i < 1000; ++i) {
        
        //@ts-ignore
        addItem(list, tree);
        expect(list.length).toEqual(tree.size);
        for (let j = 0; j < 10; ++j) {
          const low = getRandomInt(0, 100);
          const high = low + getRandomInt(0, 100);
          //@ts-ignore
          expectSearch(list, tree, low, high);
        }
      }
      
    });
  
  
  })