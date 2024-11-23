<template>
    <div class="masonry-card" >
        <div class="masonry-image" :style="{
    height: `${imageHeight}px`,
    'background-color': `${bgColor}`
            
        }"></div>

        <div class="masonry-footer" v-if="!onlyImage">
            <div class="masonry-title"></div>
              <div class="masonry-author">
        <div class="masonry-author-info">
          <div class="avatar" :style="{
            'background-color':`${bgColor}`
          }"></div>
          <span class="name">{{ author }}</span>
        </div>
        <div class="like">100</div>
      </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
interface ICardDetail {
  bgColor: string;
  title: string;
  author: string;
    imageHeight: number;
    onlyImage: boolean;
    [key: string]: any;
  
}
const props = defineProps<{
  detail: ICardDetail;
}>();
// const props = defineProps<ICardDetail>();
const { imageHeight,bgColor,onlyImage,author} = props.detail
</script>

<style lang="less" scoped>
    .masonry-card {
        width: 100%;
        height: 100%;
        background-color: #fff;
    }

    .masonry-image{
        width: 100%;
        border: 1px solid #eee;
        border-radius: 20px;
    }

    .masonry-footer{
        padding: 12px;
        font-size: 14px;
        .masonry-title {
            margin-bottom:8px ;
             word-break: break-all;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            color: rgba(51, 51, 51, 0.8);
        }

        .masonry-author {
            font-size: 13px;
            display: flex;
            align-items: center;
            justify-self: space-between;
            gap:5px;

            .masonry-author-info {
                flex:1;
                display: flex;
                align-items: center;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
               .avatar {
                    margin-right: 6px;
                    width: 20px;
                    height: 20px;
                    border-radius: 20px;
                    border: 1px solid rgba(0, 0, 0, 0.08);
               }
               .name {
                width: 80%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: rgba(51, 51, 51, 0.8);
               }
            }
        }
    }

    
</style>