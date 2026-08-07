"use server";

export const get = async () => {
    const data = await fetch (`${process.env.NEXT_PUBLIC_URL}/test`);

    const json = await data.json();
    
    console.log(json);
    return json.data;   
};