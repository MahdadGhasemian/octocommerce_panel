import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { User } from '@/services/auth.service'

export interface AuthState extends User {
  full_name: string
}

const initialState: AuthState = {
  id: '',
  mobile_phone: '',
  mobile_phone_is_verified: false,
  email: '',
  email_is_verified: false,
  accesses: [],
  first_name: '',
  last_name: '',
  full_name: '',
  gender: 'unknown',
  avatar: '',
  created_by_system: false,
  balance: 0
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<AuthState>) => {
      action.payload.full_name = getFullName(action.payload)

      Object.assign(state, action.payload)
    },
    clearAuth: state => {
      Object.assign(state, initialState)
    },
    updateAccount: (state, action: PayloadAction<AuthState>) => {
      action.payload.full_name = getFullName(action.payload)

      Object.assign(state, action.payload)
    }
  }
})

export const { setAuth, clearAuth, updateAccount } = authSlice.actions

export const selectAuthentication = (state: RootState) => state.auth
export const selectIsLogin = (state: RootState) => !!state.auth
export const selectAccount = (state: RootState) => state.auth
export const isInternalUser = (state: RootState) =>
  !!state.auth?.accesses?.find((item: { is_internal_user?: boolean }) => item.is_internal_user)
export const isCustomerUser = (state: RootState) =>
  !state.auth?.accesses?.find((item: { is_internal_user?: boolean }) => item.is_internal_user)

const getFullName = (user: User): string => {
  const { first_name, last_name } = user

  return [first_name || '', last_name || ''].join(' ')
}

export default authSlice.reducer
