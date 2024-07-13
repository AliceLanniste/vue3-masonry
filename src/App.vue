
<template>
  <div class="app">
    <div class="container">
      <masonry :bottom="20" :column="2" :gap="9" :page-size="20" :request="getData">
        <template #item="{ item, index }">
          <div
            class="card-box"
            :style="{
              background: colorArr[index % (colorArr.length - 1)],
            }"
          >
           
          </div>
        </template>
      </masonry>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped lang="less">
.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  .container {
    width:289px;
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

