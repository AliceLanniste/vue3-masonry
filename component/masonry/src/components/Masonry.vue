<template>
  <div class="masonry-container" ref="containerRef" @scroll="handleScroll">
    <div class="masonry-list">
      <div class="masonry-item"
       v-for="(item,index) in cardList" :key="index"
       :style="{
        width:`${item.width}px`,
        height:`${item.height}px`,
        transform: `translate(${item.x}px, ${item.y}px)`,
       }">
          <slot name="item" :item="item" :index="index"></slot>
        </div>

      </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref ,watch} from 'vue';
import { cardItem, masonryProps }  from './types'
import { debounce } from '../util';
import { useElementSize } from '@vueuse/core';
  
defineSlots<{item(props:{item:cardItem,index:number}):any}>();
const {
      gap,
      column ,
    itemMinWidth = 220,
    minColumn =2,
      maxColumn,
      pageSize, 
       request} = defineProps<masonryProps>();
const cardList = ref<cardItem[]>([]);
const containerRef = ref<HTMLDivElement | null>(null);
const { width: contentWidth } = useElementSize(containerRef)
const state = reactive({
  isFinish: false,
  isLoading:false,
  cardWidth:0,
  page:1,
  bottom:10,
  columnHeight:Array(column).fill(0),
  minHeight:-1
})

const resizeObserver = new ResizeObserver(() => handleResize())
const getCardList = async (page :number ,pageSize :number) =>{
  if(state.isFinish) return
   state.isLoading = true;
   const resList =  await request(page,pageSize)
   state.page++
   if(!resList.length) {
     state.isFinish = true
     return;
   };
   cardList.value = [...cardList.value,...resList];
    computedCardPos(resList);
   state.isLoading = false;
}

const handleScroll = rafThrottle(() => {
  const { scrollTop, clientHeight } = containerRef.value!;
  if (scrollTop + clientHeight >= state.minHeight) {
    !state.isLoading && getCardList(state.page, pageSize);
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


const compCardWith = () =>{
  if (containerRef.value) {
    let column = columnCount.value;
    let width = (containerRef.value.clientWidth -gap*(column-1)) / column
    state.cardWidth = width;
    state.columnHeight = new Array(column).fill(0)
  }
}


watch(()=>columnCount,
()=>handleResize())

function computedCardPos(imgList: cardItem[]) {
  imgList.forEach((item) => {
    let height = compCardHeight(item, item.width!);
    let width = state.cardWidth;
     item.height = height
    item.width = width
    const { minIndex } = getShortestColumn(state.columnHeight);
    item.x = minIndex * (state.cardWidth + gap);
    item.y = state.columnHeight[minIndex];
     state.columnHeight[minIndex] += item.height +gap;
  })
}
//compute minest height column
const getShortestColumn = (heightColumns: number[]): { minIndex: number } => {
  return { minIndex: heightColumns.indexOf(Math.min(...heightColumns)) }
}

const compCardHeight =(card: cardItem,width: number) => {
  const cardHeight = Math.floor((card.height! * state.cardWidth) / width);
  return cardHeight;
}


const handleResize = debounce(() => {
  const containerWidth = contentWidth.value;
  let column = columnCount.value;
  state.cardWidth = (containerWidth - gap * (column - 1)) / column;
  state.columnHeight = new Array(column).fill(0);
  computedCardPos(cardList.value);
});

const init =() =>{
   if (containerRef.value) {
      compCardWith();
     getCardList(state.page, pageSize);
    resizeObserver.observe(containerRef.value);
   }
}

onMounted(() => init())
onUnmounted(()=> containerRef.value && resizeObserver.unobserve(containerRef.value))
</script>

<style lang="less" scoped>
.masonry-container {
  width: 100%;
    height: 100%;
    overflow-y: scroll;
    overflow-x: hidden;
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
</style>