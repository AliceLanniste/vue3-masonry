export interface ICardPos {
    width: number;
    height: number;
    x:number;
    y:number;
  }


export interface IcardViewItem {
    id: number | string;
  url:string;
  width: number;
  height: number;
  [key: string]: any;

}


export  interface masonryProps {
    gap: number; 
    column: number; 
    bottom:number;
    pageSize: number; 
    request?: (page: number, pageSize: number) => Promise<IcardViewItem[]>; 
  } 