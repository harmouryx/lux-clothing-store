import { get } from "@/lib/users";

export default async function Home() {

  const data = get();
  return (
    <div>
       <h1>hOLA ESTE ES ES EL FRONTEND </h1>
       <h1>{data}</h1>
    </div>
  );
}
