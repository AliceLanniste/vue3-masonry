<template>
  <div class="app">
    <div class="container" ref="fContainerRef">
      <Masonry :request="getData" :gap="15" :page-size="20" :column="column">
        <template #item="{ item }">
          <div
            class="test-item"
            :style="{
              background: item.bgColor,
            }"
          ></div>
        </template>
      </Masonry>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Masonry } from "masonry";
import  data1  from "./data/data1.json"
import   data2  from "./data/data2.json"
import type { cardItem } from 'masonry' 
const fContainerRef = ref<HTMLDivElement | null>(null);
const colorArr = ["#409eff", "#67c23a", "#e6a23c", "#f56c6c", "#909399"];
const column = ref(4);
const list1:cardItem[] = (data1 as any).data.items.map((dataItem:any) => ({
id: dataItem.id,
url: dataItem.note_card.cover.url_pre,
width: dataItem.note_card.cover.width,
imageHeight: dataItem.note_card.cover.height,
}));

const list2:cardItem[] = (data2 as any).data.items.map((dataItem:any) => ({
id: dataItem.id,
url: dataItem.note_card.cover.url_pre,
width: dataItem.note_card.cover.width,
imageHeight: dataItem.note_card.cover.height,
}));

const cardList =[...list1, ...list2].map((item, index) => ({ bgColor: colorArr[index % (colorArr.length - 1)], ...item }));
const getData = (page: number, pageSize: number) => {
  return new Promise<cardItem[]>((resolve) => {
    setTimeout(() => {
      resolve(cardList.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize));
    }, 1000);
  });
};
</script>

<style scoped lang="less">
.app {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  .container {
    width: 90vw;
    height: 90vh;
    border: 1px solid red;
  }

  .test-item {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border-radius: 10px;
    animation: MoveAnimate 0.25s; // 添加动画，使其出现时更加丝滑
  }
}

@keyframes MoveAnimate {
  from {
    opacity: 0;
    transform: translateY(200px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>