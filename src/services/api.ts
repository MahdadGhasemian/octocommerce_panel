import axios, { AxiosInstance } from 'axios'

const instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-type': 'application/json'
  }
})

export default instance

export type ApiResponseMeta = {
  itemsPerPage: number
  totalItems: number
  currentPage: number
  totalPages: number
  sortBy: Array<any>
}

export type ApiResponseLinks = {
  current: string
  next: string
  last: string
}

export type ApiListResponse<T> = {
  data: Array<T>
  meta: ApiResponseMeta
  links: ApiResponseLinks
}
