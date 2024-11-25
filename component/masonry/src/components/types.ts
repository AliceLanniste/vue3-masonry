export interface cardItem {
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

