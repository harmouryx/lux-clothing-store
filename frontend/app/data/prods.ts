import { Product } from "@/lib/types";
import { Tax } from "@/lib/types";


export async function fetchProductData(): Promise<Product[]> {

    const tax: Tax = {
        id: 1,
        name: "IVA 15%",
  tax_percentage: 15,
  is_active: true,
  is_default: true,
  created_at: '11/10/2026',
};


const products: Product[] = 
[ 
    {
    id: "1",
    name: "Peace For Ecuador T-Shirt",
    base_price: 20,
    tax_applied_id: tax.id,
    tax: tax,
    image_url: "/data/imgs/nueva-merch2.png",
},
   {
    id: "2",
    name: "Ecuador Plan T - Shirt",
    base_price: 20,
    tax_applied_id: tax.id,
    tax: tax,
    image_url: "/data/imgs/tshirt-new-conceptwow.png",
},

   {
    id: "3",
    name: "BASURA T - Shirt",
    base_price: 20,
    tax_applied_id: tax.id,
    tax: tax,
    image_url: "/data/imgs/camiseta_guaman.png",
},

   {
    id: "4",
    name: "SALUDAME A TU ÑAÑA T - Shirt",
    base_price: 20,
    tax_applied_id: tax.id,
    tax: tax,
    image_url: "/data/imgs/camiseta_mirecinto.png",
},

]; 

return products;

}