<template>
  <div class="app">
      <div class="container" ref="fContainerRef">
          <Masonry
            :bottom="20" 
            :column="column" 
            :gap="10" 
            :page-size="20" 
            :request="getCardList">
              <template #item="{ index }">
                  <div
                      class="card-box"
                      :style="{
                      background: colorArr[index % (colorArr.length - 1)],
                      }"
                  ></div>
        
              </template>
          </Masonry>
      </div>
  </div>
</template>

<script setup lang="ts">
import { cardItem } from 'masonry' 
import  data1  from "./data/data1.json"
import   data2  from "./data/data2.json"
import { Masonry } from "masonry";
import { ref } from 'vue';

const colorArr = ["#409eff", "#67c23a", "#e6a23c", "#f56c6c", "#909399"];
const column = ref(4);
const list1:cardItem[] = (data1 as any).data.items.map((dataItem:any) => ({
id: dataItem.id,
url: dataItem.note_card.cover.url_pre,
width: dataItem.note_card.cover.width,
height: dataItem.note_card.cover.height,
}));

const list2:cardItem[] = (data2 as any).data.items.map((dataItem:any) => ({
id: dataItem.id,
url: dataItem.note_card.cover.url_pre,
width: dataItem.note_card.cover.width,
height: dataItem.note_card.cover.height,
}));

const cardList =[...list1,...list2];

const getCardList = (pageNum:number,pageSize:number) => {
  return new Promise<cardItem[]>((resolve) => {
      setTimeout(() => {
          resolve(cardList.slice((pageNum - 1) * pageSize, (pageNum - 1) * pageSize + pageSize));
       }, 1000);
  })
}

</script>


<style scoped lang="less">
.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  .container {
    width: 1400px;
    height: 600px;
    border: 1px solid red;
  }
  .card-box {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 10px;
  }
}
</style>