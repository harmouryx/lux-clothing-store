import { get } from "@/lib/users";
import { response } from "@/lib/axiosFetching";

export default async function Home() {

  const data = get();
  const axiosResponse = await response();
  return (
    <div>
       <h1>hOLA ESTE ES ES EL FRONTEND </h1>
       <h1>{data}</h1>
       <h1>{axiosResponse.title}</h1>
    </div>
  );
}
