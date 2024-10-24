<template>
  <div class="masonry-container" ref="containerRef" @scroll="handleScroll">
  <div class="masonry-list">
    <div class="masonry-item" v-for="(item,index) in dataState.cardList"
     :key="item.id"
     :style="{
      width: `${dataState.cardPos[index].width}px`,
      height: `${dataState.cardPos[index].height}px`,
       transform: `translate(${dataState.cardPos[index].x}px, ${dataState.cardPos[index].y}px)`,
     }">
        <slot name="item" :item="item" :index="index"></slot>
    </div>
  </div>
</div>


</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref} from 'vue';
import { IVirtualWaterFallProps,cardItem,cardPos } from './types';
 
const props = defineProps<IVirtualWaterFallProps>();

defineSlots<{
  item(props: { item: cardItem; index: number }): any;
}>();
const dataState = reactive({
     isFinish:false,
     page:1,
     cardWidth:0,
     cardList:[] as cardItem[],
     cardPos:[] as cardPos[],
     loading:false,
     columnHeight:  new Array(props.column).fill(0) as number[]
});


const containerRef = ref<HTMLDivElement | null>(null);

const getCardList = async (page: number, pageSize: number) => {
  if (dataState.isFinish) return;
  dataState.loading= true
  const list = await props.request(page, pageSize);
  dataState.page++;
  if (!list.length) {
    dataState.isFinish = true;
    return;
  }
 
  dataState.cardList = [...dataState.cardList, ...list];
  computedCardPos(list); // key：根据请求的数据计算卡片位置
  dataState.loading = false
};


const computedWidth = async () =>{
  if(containerRef.value) {
    const containerWidth = containerRef.value.clientWidth;
     dataState.cardWidth = (containerWidth - props.gap * (props.column - 1)) / props.column;
    await getCardList(dataState.page, props.pageSize);

  }
 

}

const init =async ()=>{
 if (containerRef.value) {
      await computedWidth()
  }
}

const minColumn = computed(() => {
  let minIndex = -1,
  
    minHeight = Infinity;

  dataState.columnHeight.forEach((item, index) => {
    if (item < minHeight) {
      minHeight = item;
      minIndex = index;
    }
  });

  return {
    minIndex,
    minHeight,
  };
});

const computedCardPos = (list: cardItem[]) =>{
  list.forEach((item,index) => {
      const cardHeight = Math.floor((item.height * dataState.cardWidth) / item.width);
      if(index < props.column && dataState.cardList.length <= props.pageSize) {
         dataState.cardPos.push({
          width:dataState.cardWidth,
          height:cardHeight,
           x: index ? index * (dataState.cardWidth + props.gap) : 0,
           y: 0,
         })

         dataState.columnHeight[index] = cardHeight + props.gap;
        } else {
          const { minIndex, minHeight} = minColumn.value
          dataState.cardPos.push({
            width:dataState.cardWidth,
            height: cardHeight,
            x: minIndex ? minIndex *(dataState.cardWidth +props.gap) : 0,
            y:minHeight
          })
          dataState.columnHeight[minIndex] += cardHeight + props.gap;
        }
  });

}

const handleScroll = rafThrottle(() => {
  const { scrollTop, clientHeight } = containerRef.value!;
  const { minHeight } = minColumn.value
  if (scrollTop + clientHeight >= minHeight) {
    !dataState.loading && getCardList(dataState.page, props.pageSize);
  }
})

 function rafThrottle(fn: Function) {
  let lock = false;
  return function (this: any, ...args: any[]) {
    if (lock) return;
    lock = true;
    window.requestAnimationFrame(() => {
      fn.apply(this, args);
      lock = false;
    });
  };
}
onMounted( () => {
  init()
})



</script>



<style scoped lang="scss">
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
