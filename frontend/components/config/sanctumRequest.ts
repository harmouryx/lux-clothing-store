import  requestToLaravel from '@/lib/req';
import  { getCsrfToken } from '../config/crsf';

export const sanctumRequest = async (method: string, url: string, data = {}, config = {}) => {
    
const csrfToken = await getCsrfToken();

  const response = await requestToLaravel({
    method,
    url,
    data,
    headers: {
        'X-XSRF-TOKEN': csrfToken,
        'Content-Type': 'application/json',
      },
    ...config,
    withCredentials: true,
  });

  return response;
};