
import axios from "axios";

const requestToLaravel = axios.create({
    baseURL: process.env.NEXT_PUBLIC_URL,
    withCredentials: true,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

export default requestToLaravel;