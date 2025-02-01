import api, { ApiListResponse } from './api'
import { createParams, InputColumnFiltersModel, InputSortingModel } from './param'

export enum RoleEndpointMethodType {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Patch = 'PATCH',
  Delete = 'DELETE'
}

export interface User {
  id: string
  mobile_phone: string
  mobile_phone_is_verified: boolean
  email?: string
  email_is_verified: boolean
  first_name: string
  last_name: string
  full_name: string
  gender: 'male' | 'female' | 'unknown' | 'both'
  avatar: string
  created_by_system: boolean
  balance: number
  accesses?: Access[]
}

export interface AccessEndpoint {
  tag: string
  path: string
  method: RoleEndpointMethodType
}

export interface AccessInfoEndpoint {
  key: string
  tag: string
  get: boolean | null
  post: boolean | null
  patch: boolean | null
  delete: boolean | null
}

export interface Access {
  id: string
  title: string
  description: string
  image: string
  color: string
  cannot_be_deleted: boolean
  has_full_access: boolean
  is_internal_user: boolean
  notification_order_created: boolean
  notification_payment_created: boolean
  notification_delivery_created: boolean
  endpoints: AccessEndpoint[]
  info_endpoints: AccessInfoEndpoint[]
  accounts: User[]
  created_at: Date
  updated_at: Date
}

export type AccountApiResponse = {
  total_pages: number
  items: Array<User>
}

export type AccessApiResponse = {
  total_pages: number
  items: Array<Access>
}

class AuthService {
  // User
  sendOtp(mobile_phone: string) {
    return api
      .post('/auth/auth/otp/mobile_phone', {
        mobile_phone
      })
      .then(response => {
        return response?.data?.hashed_code
      })
      .catch(e => {
        e
      })
  }

  confirmOtp(mobile_phone: string, confirmation_code: number, hashed_code: string): Promise<User> {
    return api
      .post('/auth/auth/otp/confirm/mobile_phone', {
        mobile_phone,
        confirmation_code,
        hashed_code
      })
      .then(response => {
        return response?.data
      })
  }

  confirmOtpAndSetPassword(
    mobile_phone: string,
    confirmation_code: number,
    hashed_code: string,
    password: string
  ): Promise<User> {
    return api
      .patch('/auth/auth/change-password', {
        mobile_phone,
        confirmation_code,
        hashed_code,
        password
      })
      .then(response => {
        return response?.data
      })
  }

  login(mobile_phone: string, password: string): Promise<User> {
    return api
      .post('/auth/auth/login', {
        mobile_phone,
        password
      })
      .then(response => {
        return response?.data
      })
  }

  logout() {
    return api.post('/auth/auth/logout', {})
  }

  getInfo() {
    return api.get('/auth/auth/info').then(response => {
      return response?.data
    })
  }

  saveInfo(account: User): Promise<User> {
    return api.patch('/auth/auth/info', account).then(response => {
      return response?.data
    })
  }

  getAllUser(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<User>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/auth/users', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  saveUserInfo(id: number, account: User): Promise<User> {
    return api.patch(`/auth/users/${id}`, account).then(response => {
      return response?.data
    })
  }

  saveUserAccess(id: number, account: { access_ids: Array<number> }): Promise<User> {
    return api.patch(`/auth/users/${id}/access`, account).then(response => {
      return response?.data
    })
  }

  createCustomerUser(user: User): Promise<User> {
    return api.post(`/auth/users`, user).then(response => {
      return response?.data
    })
  }

  // Access
  getAllAccess(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<Access>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/auth/accesses', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  createAccess(access: Partial<Access>): Promise<Access> {
    return api.post('/auth/accesses', access).then(response => {
      return response?.data
    })
  }

  getAccess(id: number): Promise<Access> {
    return api.get(`/auth/accesses/${id}`).then(response => {
      return response?.data
    })
  }

  editAccess(id: number, access: Partial<Access>): Promise<Access> {
    return api.patch(`/auth/accesses/${id}`, access).then(response => {
      return response?.data
    })
  }

  deleteAccess(id: number): Promise<unknown> {
    return api.delete(`/auth/accesses/${id}`).then(response => {
      return response?.data
    })
  }
}

export default new AuthService()
