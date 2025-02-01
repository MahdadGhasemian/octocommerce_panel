import axiosInstance from './api'
import { AxiosError, AxiosRequestConfig } from 'axios'

// ** Redux Imports
import { setAuth, clearAuth } from '@/redux/slices/authSlice'
import { toastError } from '@/redux/slices/snackbarSlice'

class SetupInterceptor {
  static instance: SetupInterceptor

  constructor(store: any) {
    axiosInstance.interceptors.request.use(async (config: any | AxiosRequestConfig) => {
      if (config?.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data'
      }

      return config
    }, this.handleError)

    const { dispatch } = store

    // axiosInstance.interceptors.response.use(response => response, this.handleError)
    axiosInstance.interceptors.response.use(
      res => {
        const url = res?.config?.url
        const data = res?.data

        if ((url === '/auth/auth/otp/confirm/mobile_phone' || url === '/auth/auth/login') && data) {
          dispatch(setAuth(data))
        } else if (url === '/auth/auth/logout') {
          dispatch(clearAuth())
        }

        return res
      },
      async err => {
        const originalConfig = err.config
        const url = originalConfig?.url

        if (url === '/auth/auth/logout') {
          dispatch(clearAuth())
        } else if (url === '/auth/auth/refresh') {
          dispatch(clearAuth())
        } else if (url !== '/auth/auth/otp/confirm/mobile_phone' && err.response) {
          // Access Token was expired
          if (err.response.status === 401 && !originalConfig._retry) {
            originalConfig._retry = true

            dispatch(clearAuth())

            return Promise.reject(err)

            // try {
            //   // const rs = await axiosInstance.post('/auth/auth/refresh', {
            //   //   refresh_token: store.getState().auth['X-Refresh-Token']
            //   // })

            //   // const data = rs.data

            //   // dispatch(setAuth(data))

            //   return axiosInstance(originalConfig)
            // } catch (_error) {
            //   dispatch(clearAuth())

            //   return Promise.reject(_error)
            // }
          } else {
            // dispatch(toastError(err.message))
            dispatch(toastError(String(err?.response?.data?.message)))
          }
        }

        return Promise.reject(err)
      }
    )
  }

  handleError = async (error: AxiosError) => {
    return Promise.reject(error)
  }

  /**
   *
   */
  static getInstance(store: any): SetupInterceptor {
    if (!SetupInterceptor.instance) {
      SetupInterceptor.instance = new SetupInterceptor(store)
    }

    return SetupInterceptor.instance
  }
}

export default SetupInterceptor
