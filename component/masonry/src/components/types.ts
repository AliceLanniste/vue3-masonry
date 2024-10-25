export interface cardItem {
    width:number;
    height: number;
    x: number;
    y: number;
}


export interface masonryProps {
    gap: number;
    column: number;
    pageSize: number;
    request:(page:number,pageSize:number) => Promise<cardItem[]>
}

