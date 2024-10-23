export interface IVirtualWaterFallProps {
    gap: number; // 卡片间隔
    column: number; // 瀑布流列数
    bottom:number;
    pageSize: number; // 单次请求数据数量
    request: (page: number, pageSize: number) => Promise<cardItem[]>; // 数据请求方法
  }
  
export  interface cardItem {
    id: number | string;
    url:string;
    width: number;
    height: number;
    [key: string]: any;
  }
  
  
  
export  interface cardPos {
    width: number;
    height: number;
    x:number;
    y:number;
  }
  