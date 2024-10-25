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
import { onMounted, reactive, ref } from 'vue';
import { cardItem, masonryProps }  from './types'
  
defineSlots<{item(props:{item:cardItem,index:number}):any}>();
const {
      gap,
      column,
      pageSize, 
       request} = defineProps<masonryProps>();
const cardList = ref<cardItem[]>([]);
const containerRef  =ref<HTMLDivElement | null> (null);
const state = reactive({
  isFinish: false,
  isLoading:false,
  cardWidth:0,
  page:1,
  bottom:10,
  columnHeight:Array(column).fill(0),
  minHeight:-1
})
  
const getCardList = async (page:number,pageSize:number) =>{
  if(state.isFinish) return
   state.isLoading = true;
   const resList =  await request(page,pageSize)
   state.page++
   if(!resList.length) {
     state.isFinish = true
     return;
   };
   const preCardList =[...cardList.value,...resList]
    const compedCardList = computedCardPos(preCardList);
   cardList.value = compedCardList;
   state.isLoading = false;
}

const handleScroll = rafThrottle(() => {
  const {scrollTop ,clientHeight}  = containerRef.value!;
  if (scrollTop + clientHeight >= state.minHeight) {
    !state.isLoading && getCardList(state.page, pageSize);
  }
  getCardList(state.page,pageSize);
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

//container.clientWidth -gap *(column-1)
const compCardWith = () =>{
  if (containerRef.value) {
    let width = (containerRef.value.clientWidth -gap*(column-1)) / column
    state.cardWidth = width;
  }
}

function computedCardPos(imgList: cardItem[]): cardItem[] {
  const cardList = imgList.map((item) => {
      item.width = state.cardWidth;
      item.height = compCardHeight(item)
      return item;
   }).map((item, index) => {
      if(index < column) {
         item.x = index ?index * (state.cardWidth + gap) : 0,
         item.y = 0
         state.columnHeight[index] =item.height+gap;
      } else {
         const {minIndex, minHeight} = getShortestColumn(state.columnHeight);
         item.x = minIndex ? minIndex * (state.cardWidth + gap) : 0,
         item.y = minHeight +gap;
         state.columnHeight[minIndex] += item.height +gap;
      }
      return item;
   })

   return cardList;
}
//compute minest height column
const getShortestColumn =(heightColumns:number[]):{minIndex: number, minHeight: number} =>{
   let minIndex = -1,minHeight = Infinity;
    heightColumns.forEach((height ,index) =>{
        if(height < minHeight){
          minHeight = height;
          minIndex = index
        }
    })
    state.minHeight = minHeight;
    return {
        minIndex,
        minHeight
    }
}

const compCardHeight =(card: cardItem) => {
  const cardHeight = Math.floor((card.height * state.cardWidth) / card.width);
  return cardHeight;
}

const init =() =>{
   if (containerRef.value) {
      compCardWith();
      getCardList(state.page,pageSize);
   }
}

onMounted(() => init())
</script>

<style lang="scss" scoped>
.masonry {
  &-container {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    overflow-x: hidden;
  }
  &-list {
    position: relative;
    width: 100%;
  }
  &-item {
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
  }
}
</style>