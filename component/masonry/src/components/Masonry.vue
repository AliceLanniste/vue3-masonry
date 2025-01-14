<template>
  <div class="masonry-container" ref="containerRef" @scroll="handleScroll">
    <div class="masonry-list" ref="listRef" :style="listStyle">
      <div class="masonry-item"
       v-for="{ item, style } in renderList" :style="style" :key="item.id">

          <slot name="item" :item="item"></slot>
        </div>

      </div>
  </div>
</template>



<script lang="ts" setup>
import { CSSProperties, computed, onMounted, onUnmounted, reactive, ref } from "vue";
import type {   columnQueue, renderItem, itemRect, cardItem, masonryProps } from "./types";
import { debounce } from "../util/index";
import { useElementSize } from '@vueuse/core'
const {
      gap,
      column,
      itemMinWidth,
      pageSize, 
      request } = defineProps<masonryProps>();
defineSlots<{
  item(props: { item: any }): any;
}>();

const containerRef = ref<HTMLDivElement | null>(null);

const { width:containerWidth, height:containerHeight } = useElementSize(containerRef)
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


const computedColumn = ref(0);
const getColumn = () => {
  let minWidth = itemMinWidth || 200;
  let columnCount = column || Math.floor(scrollState.viewWidth / (minWidth + gap)) || 2;
  return columnCount;
};

const queueState = reactive({
  queue: new Array(computedColumn.value).fill(0).map<columnQueue>(() => ({ list: [], height: 0 })),
  len: 0,
});

const itemSizeInfo = computed(() =>
  dataState.list.reduce<Map<cardItem["id"], itemRect>>((pre, current) => {
    const itemWidth = Math.floor((scrollState.viewWidth - (computedColumn.value - 1) * gap) / computedColumn.value);
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
  computedColumn.value = getColumn();
  reComputedQueue();
}, 300);

const reComputedQueue = () => {
  queueState.queue = new Array(computedColumn.value).fill(0).map<columnQueue>(() => ({ list: [], height: 0 }));
  queueState.len = 0;
  addInQueue(dataState.list.length);
};


const initScrollState = () => {
  scrollState.viewWidth = containerWidth.value;
  scrollState.viewHeight = containerHeight.value;
  scrollState.start = containerRef.value!.scrollTop;
};

const init = async () => {
  initScrollState();
  computedColumn.value = getColumn();
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