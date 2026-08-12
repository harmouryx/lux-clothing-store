"use server";
import axios from "axios";



type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};


export const response = async () => {
  const response = await axios.get<Post>("https://jsonplaceholder.typicode.com/posts/1");

  console.log("Données reçues par Axios ");
  const json = await response.data;
  console.log(json.body); // TypeScript knows this is a string
  console.log(json.title); // TypeScript knows this is a string
  return response.data;
};