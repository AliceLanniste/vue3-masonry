<template>
  <div class="masonry-container" ref="containerRef" @scroll="handleScroll">
    <div class="masonry-list" ref="listRef" :style="listStyle">
      <div class="masonry-item"
       v-for="{ item, style } in renderList" :style="style" :key="item.id">

          <slot name="item" :item="item"></slot>
        </div>

      </div>
      <!-- <div class="masonry-loading" v-show="dataState.isLoading"
         :style="{
        transform: `translate(0px, ${.scrollHeight}px)`,
       }">
        <slot name="loading">loading... </slot>
      </div>

      <div class="masonry-finished"  v-if="showFinish" v-show="state.isFinish" ref="finishRef"
         >
        <slot name="finished">到底了 </slot>
      </div> -->
  </div>
</template>

<!-- <script setup lang="ts">
import { computed, CSSProperties, nextTick, onMounted, onUnmounted, reactive, ref ,watch} from 'vue';
import { cardItem, columnQueue, masonryProps, renderCardItem } from './types';
import { debounce } from '../util/index';
import { useElementSize } from '@vueuse/core';

  
defineSlots<{
  item(props: { item: cardItem}): any,
  loading(): any,
  finished():any}>();
const {
      gap,
      column ,
      itemMinWidth = 220,
      minColumn =2,
      maxColumn,
      pageSize, 
      showFinish= true,
      showLoading = true,
      request } = defineProps<masonryProps>();
      
const cardList = ref<cardItem[]>([]);
const containerRef = ref<HTMLDivElement | null>(null);
const listRef = ref<HTMLDivElement>();
const finishRef = ref<HTMLDivElement>();
const { width: contentWidth } = useElementSize(containerRef)
const state = reactive({
  isFinish: false,
  isLoading:false,
  cardWidth:0,
  page:1,
  bottom:10,
  columnHeight:Array(column).fill(0),
  minHeight: -1,
  scrollHeight: 0,
  targetIndex: 0,
})

const scrollState = reactive({
  viewHeight: 0,
  viewWidth: 0,
  start: 0
})

const end = computed(() => scrollState.viewHeight + scrollState.start);

const queueState = reactive({
  queue: Array(column).fill(0).map<columnQueue>(() => ({ list: [], height: 0 })),
  len: 0
})

const computedResult = computed(() => {
  let heightColumn = queueState.queue.map((item) => item.height);
  return getMaxandMinColumn(heightColumn)
})

const listStyle = computed(()=> ({ height: `${computedResult.value.maxHeight}px` } as CSSProperties))

const preRenderList = computed(() => queueState.queue.reduce<renderCardItem[]>((pre, { list }) => pre.concat(list), []));
const renderList = computed(()=>preRenderList.value.filter((renderItem)=> renderItem.y+renderItem.height <= scrollState.start &&  renderItem.y + renderItem.height > end.value))


const addInQueue = (size: number) => {
  for (let i = 0; i < size; i++) {
    const minIndex = computedResult.value.minIndex;
    const currentColumn = queueState.queue[minIndex];
    const before = currentColumn.list[currentColumn.list.length - 1] || null;
    const dataItem = cardList.value[queueState.len];
    const item = generatorItem(dataItem, before, minIndex);
    currentColumn.list.push(item);
    currentColumn.height = item.y;
    queueState.len++;
  }
};

interface IItemRect {
  width: number;
  height: number;
}

const itemSizeInfo = computed(() =>
  cardList.value.reduce<Map<cardItem["id"], IItemRect>>((pre, current) => {
    const itemWidth = Math.floor((scrollState.viewWidth - (column - 1) * gap) / column);
    pre.set(current.id, {
      width: itemWidth,
      height: Math.floor((itemWidth * current.height) / current.width!),
    });
    return pre;
  }, new Map())
);


const generatorItem = (item: cardItem, before: renderCardItem | null, index: number): renderCardItem => {
  const rect = itemSizeInfo.value.get(item.id)!;
  const width = rect.width;
  const height = rect.height;
//   const imageHeight = rect.imageHeight;
  let y = 0;
  if (before) y = before.y + before.height + gap;
  return {
    item,
    y,
    height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate3d(${index === 0 ? 0 : (width + gap) * index}px, ${y}px, 0)`,
    },
  };
};


watch(() => state.isFinish, async () => {
  let maxHeight = Math.max(...state.columnHeight)
  await nextTick();
  if(!finishRef.value) return
  finishRef.value.style.top = `${maxHeight}px`;
    console.log("finishRef",finishRef.value?.style)


})
const resizeObserver = new ResizeObserver(() => handleResize())
const getCardList = async (page :number ,pageSize :number) =>{
  if (state.isFinish) return
  state.isLoading = true;
   const resList =  await request(page,pageSize)
   state.page++
  if (!resList.length) {
     state.isFinish = true
     state.isLoading = false
     return 0;
   };
   cardList.value = [...cardList.value,...resList];
    state.isLoading = false;
    console.log("getCardList",resList)
   return resList.length
}

const handleScroll = rafThrottle(() => {
    const { scrollTop, clientHeight } = containerRef.value!;
    scrollState.start = scrollTop
  if (scrollTop + clientHeight >=  computedResult.value.minHeight) {
      !state.isLoading && getCardList(state.page, pageSize).then((len) => {
          len && addInQueue(len);
    });
  }
})

function rafThrottle(fn: Function) {
  let lock =false;
  return function () {
    if(lock) return
    lock = true
    requestAnimationFrame(() => {
      fn()
      lock = false
    })
  }
}


const columnCount = computed(() => {
  let containerWidth = contentWidth.value
  if (containerWidth >= itemMinWidth*2) {
    let count = Math.ceil(containerWidth / itemMinWidth);
    if (maxColumn && count > maxColumn) {
      return maxColumn;
    }
    return count;  
  }
  return minColumn;
})


// const compCardWith = () =>{
//   if (containerRef.value) {
//     let column = columnCount.value;
//     let width = (containerRef.value.clientWidth -gap*(column-1)) / column
//     state.cardWidth = width;
//     state.columnHeight = new Array(column).fill(0)
//   }
// }


watch(()=>columnCount,
()=>handleResize())

// async function computedCardPos(imgList: cardItem[]) {
  
//   setImageHeight(imgList);
//   await nextTick();
//   computeDomHeight(imgList)

// }

// function setImageHeight(imgList: cardItem[]) {
//   imgList.forEach((item) => {
//     let height = compCardHeight(item, item.width!);
//     let width = state.cardWidth;
//     item.imageHeight = height
//     item.width = width
//   })
// }

// function computeDomHeight(list: cardItem[]) {
//   const children = listRef.value!.children;
//   list.forEach((item, index) => {
//     const nextIndex = state.targetIndex + index;
//     const cardHeight = children[nextIndex].getBoundingClientRect().height;
//     item.totalHeight = cardHeight
//     const { minIndex } = getShortestColumn(state.columnHeight);
//     item.x = minIndex * (state.cardWidth + gap);
//     item.y = state.columnHeight[minIndex];
//      state.columnHeight[minIndex] += cardHeight +gap;
//   })
//   state.targetIndex += list.length
// }
//compute minest height column
// const getShortestColumn = (heightColumns: number[]): { minIndex: number } => {
//   return { minIndex: heightColumns.indexOf(Math.min(...heightColumns)) }
// }

const getMaxandMinColumn = (heightColumns: number[]) => {
  let minHeight = Math.min(...heightColumns)
  let maxHeight = Math.max(...heightColumns)
  let minIndex = heightColumns.indexOf(Math.min(...heightColumns))
  return{ minHeight,maxHeight, minIndex}
}
// const compCardHeight =(card: cardItem,width: number) => {
//   const cardHeight = Math.floor((card.height! * state.cardWidth) / width);
//   return cardHeight;
// }


// const handleResize = debounce(() => {
//   const containerWidth = contentWidth.value;
//   let column = columnCount.value;
//   state.targetIndex = 0;
//   state.cardWidth = (containerWidth - gap * (column - 1)) / column;
//   state.columnHeight = new Array(column).fill(0);
//   computedCardPos(cardList.value);
// });

// const init =() =>{
//    if (containerRef.value) {
//       compCardWith();
//      getCardList(state.page, pageSize);
//     resizeObserver.observe(containerRef.value);
//    }
// }
const handleResize = debounce(() => {
  initScrollState();
  reComputedQueue();
}, 300);

const reComputedQueue = () => {
  queueState.queue = new Array(column).fill(0).map<columnQueue>(() => ({ list: [], height: 0 }));
  queueState.len = 0;
  addInQueue(cardList.value.length);
};


const initScrollState = () => {
  scrollState.viewWidth = containerRef.value!.clientWidth;
  scrollState.viewHeight = containerRef.value!.clientHeight;
  scrollState.start = containerRef.value!.scrollTop;
};

const init = async () => {
  initScrollState();
  resizeObserver.observe(containerRef.value!);
    const len = await getCardList(state.page, pageSize);
  console.log("init masonry_virtual",len)
  len && addInQueue(len);
};

onMounted(() => init())
onUnmounted(()=> containerRef.value && resizeObserver.unobserve(containerRef.value))
</script> -->


<script lang="ts" setup>
import { CSSProperties, computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import type {   columnQueue, renderItem, itemRect, cardItem, masonryProps } from "./types";
import { debounce } from "../util/index";

// const props = defineProps<IVirtualWaterFallProps>();
const {
      gap,
      column ,
      itemMinWidth = 220,
      minColumn =2,
      maxColumn,
      pageSize, 
      showFinish= true,
      showLoading = true,
      request } = defineProps<masonryProps>();
defineSlots<{
  item(props: { item: any }): any;
}>();

const containerRef = ref<HTMLDivElement | null>(null);

const resizeObserver = new ResizeObserver(() => {
  handleResize();
});

const dataState = reactive({
  loading: false,
  isFinish: false,
  currentPage: 1,
  list: [] as cardItem[],
});

const scrollState = reactive({
  viewWidth: 0,
  viewHeight: 0,
  start: 0,
});

const queueState = reactive({
  queue: new Array(column).fill(0).map<columnQueue>(() => ({ list: [], height: 0 })),
  len: 0,
});

const itemSizeInfo = computed(() =>
  dataState.list.reduce<Map<cardItem["id"], itemRect>>((pre, current) => {
    const itemWidth = Math.floor((scrollState.viewWidth - (column - 1) * gap) / column);
    pre.set(current.id, {
      width: itemWidth,
      height: Math.floor((itemWidth * current.imageHeight!) / current.width!),
    });
    return pre;
  }, new Map())
);

const end = computed(() => scrollState.viewHeight + scrollState.start);

const cardList = computed(() => queueState.queue.reduce<renderItem[]>((pre, { list }) => pre.concat(list), []));

const renderList = computed(() => cardList.value.filter((i) => i.h + i.y > scrollState.start && i.y < end.value));


const getMaxAndMinHeight = (columns: number[]) => {
    let maxHeight = Math.max(...columns)
    let minHeight = Math.min(...columns)
    let minIndex = columns.indexOf(minHeight)
    return {
        minIndex,
        minHeight,
        maxHeight
    }
}
const computedHeight = computed(() => {
    let heightColumn = queueState.queue.map(item => item.height);
    return getMaxAndMinHeight(heightColumn)
});

const listStyle = computed(() => ({ height: `${computedHeight.value.maxHeight}px` } as CSSProperties));

watch(
  () => column,
  () => {
    handleResize();
  }
);

const addInQueue = (size = pageSize) => {
  for (let i = 0; i < size; i++) {
    const minIndex = computedHeight.value.minIndex;
    const currentColumn = queueState.queue[minIndex];
    const before = currentColumn.list[currentColumn.list.length - 1] || null;
    const dataItem = dataState.list[queueState.len];
    const item = generatorItem(dataItem, before, minIndex);
    currentColumn.list.push(item);
    currentColumn.height += item.h;
    queueState.len++;
  }
};

const generatorItem = (item: cardItem, before: renderItem | null, index: number): renderItem => {
  const rect = itemSizeInfo.value.get(item.id);
  const width = rect!.width;
  const height = rect!.height;
  let y = 0;
  if (before) y = before.y + before.h + gap;

  return {
    item,
    y,
    h: height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate3d(${index === 0 ? 0 : (width + gap) * index}px, ${y}px, 0)`,
    },
  };
};

const loadDataList = async () => {
  if (dataState.isFinish) return;
  dataState.loading = true;
  const list = await request(dataState.currentPage++, pageSize);
  if (!list.length) {
    dataState.isFinish = true;
    return;
  }
  dataState.list.push(...list);
  dataState.loading = false;
  return list.length;
};

const handleScroll = rafThrottle(() => {
  const { scrollTop, clientHeight } = containerRef.value!;
  scrollState.start = scrollTop;
  if (scrollTop + clientHeight > computedHeight.value.minHeight) {
    !dataState.loading &&
      loadDataList().then((len) => {
        len && addInQueue(len);
      });
  }
});

function rafThrottle(fn: Function) {
  let lock =false;
  return function () {
    if(lock) return
    lock = true
    requestAnimationFrame(() => {
      fn()
      lock = false
    })
  }
}
const handleResize = debounce(() => {
  initScrollState();
  reComputedQueue();
}, 300);

const reComputedQueue = () => {
  queueState.queue = new Array(column).fill(0).map<columnQueue>(() => ({ list: [], height: 0 }));
  queueState.len = 0;
  addInQueue(dataState.list.length);
};

const initScrollState = () => {
  scrollState.viewWidth = containerRef.value!.clientWidth;
  scrollState.viewHeight = containerRef.value!.clientHeight;
  scrollState.start = containerRef.value!.scrollTop;
};

const init = async () => {
  initScrollState();
  resizeObserver.observe(containerRef.value!);
  const len = await loadDataList();
  len && addInQueue(len);
};

onMounted(() => {
  init();
});

onUnmounted(() => {
  resizeObserver.unobserve(containerRef.value!);
});
</script>

<style lang="less" scoped>
.masonry-container {
  position: relative;
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    overflow-x: hidden;
    padding-bottom: 5px;
}

.masonry-list {
  width: 100%;
  position: relative;
}

.masonry-item {
  position: absolute;
    left: 0;
    top: 0;
    box-sizing: border-box;
    transition: all 0.3s;
}

.masonry-loading {
 
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 6px;
    z-index: 999;
}

.masonry-finished {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 4px;
    z-index: 999;

}
</style>