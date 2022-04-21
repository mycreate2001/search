export function search(key:string):Promise<ProductData[]>

export interface ProductData{
    url:string;
    image:string;
    name:string;
    price:number;
}