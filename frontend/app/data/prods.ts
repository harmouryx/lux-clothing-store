import { Product,
     ProductVariant,
      Tax,
       VariantAttributes,
    Stock } from "@/lib/types";

export async function fetchProductData(): Promise<Product[]> {

const stockGlobal: Stock = {
  id: 1,
  product_id_variant: 1,
  quantity: 20,  
};

    const tax: Tax = {
        id: 1,
        name: "IVA 15%",
        tax_percentage: 15,
        is_active: true,
        is_default: true,
        created_at: '11/10/2026',
    };
    
    const varAttributs: VariantAttributes ={
          size: "L",
          "1": "LUXDROP-001" 
    };
    
    const varAttributs2: VariantAttributes ={
          size: "XL",
          "1": "LUXDROP-001" 
    };

    const prodVars: ProductVariant[]= [
        {
            id: 1,
              fk_product_id: "PROD-001",
              sku: "LUXDRP-001",
              stock: stockGlobal,
              attributes: varAttributs,
    },
        {
            id: 2,
              fk_product_id: "PROD-002",
              sku: "LUXDRP-002",
              stock: stockGlobal,
              attributes: varAttributs2,
    },
];


    
    
const products: Product[] = 
[ 
    {
    id: "1",
    name: "Peace For Ecuador T-Shirt",
    base_price: 30,
    tax_applied_id: tax.id,
    tax: tax,
    variants: prodVars,
    image_url: "/data/imgs/nueva-merch2.png",
},
   {
    id: "2",
    name: "Ecuador Plan T - Shirt",
    base_price: 30,
    tax_applied_id: tax.id,
    tax: tax,
    variants: prodVars,
    image_url: "/data/imgs/tshirt-new-conceptwow.png",
},

   {
    id: "3",
    name: "BASURA T - Shirt",
    base_price: 25,
    tax_applied_id: tax.id,
    tax: tax,
    variants: prodVars,
    image_url: "/data/imgs/camiseta_guaman.png",
},

   {
    id: "4",
    name: "SALUDAME A TU ÑAÑA T - Shirt",
    base_price: 25,
    tax_applied_id: tax.id,
    tax: tax,
    variants: prodVars,
    image_url: "/data/imgs/camiseta_mirecinto.png",
},

]; 

return products;

}