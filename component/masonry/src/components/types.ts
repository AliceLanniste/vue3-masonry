import { CSSProperties } from "vue";

export interface cardItem {
    id: number | string;
    width?:number;
    imageHeight?: number;
    footerHeight?: number;
    totalHeight?: number;
    x: number;
    y: number;
    [key: string]: any;
}


export interface masonryProps {
    gap: number;
    column: number;
    pageSize: number;
    itemMinWidth?: number;
    minColumn?: number;
    maxColumn?: number;
    showLoading?: boolean;
    showFinish?: boolean;
    request:(page:number,pageSize:number) => Promise<cardItem[]>
}


export interface renderCardItem {
    item: cardItem;
    y: number;
    height: number;
    style: CSSProperties; 
}


export interface columnQueue {
  list: renderItem[];
  height: number;
}

// 渲染视图项
export interface renderItem {
  item: cardItem;
  y: number;
  h: number;
  style: CSSProperties;
}

export interface itemRect {
  width: number;
  height: number;
}