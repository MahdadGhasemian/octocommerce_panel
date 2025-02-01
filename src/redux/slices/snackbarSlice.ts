import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState, store } from '../store'

const DURATION = 5000

function generateRandomString(length: number) {
  return Math.random().toString(36).slice(-length)
}

export interface INotification {
  id: string
  show: boolean
  message: string
  type: 'error' | 'warning' | 'info' | 'success'
  duration: number
}

export interface SnackbarState {
  notifications: INotification[]
}

const initialState: SnackbarState = {
  notifications: []
}

const createMessage = (payload: string, type: 'error' | 'warning' | 'info' | 'success') => {
  const id = generateRandomString(5)

  return {
    id,
    message: payload,
    type,
    show: true,
    duration: DURATION
  }
}

const pushMessage = (state: SnackbarState, message: INotification) => {
  state.notifications.push(message)

  setTimeout(() => {
    store.dispatch(close(message))
  }, DURATION)
}

export const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    toastError: (state, action: PayloadAction<string>) => {
      pushMessage(state, createMessage(action.payload, 'error'))
    },
    toastInfo: (state, action: PayloadAction<string>) => {
      pushMessage(state, createMessage(action.payload, 'info'))
    },
    toastWarning: (state, action: PayloadAction<string>) => {
      pushMessage(state, createMessage(action.payload, 'warning'))
    },
    toastSuccess: (state, action: PayloadAction<string>) => {
      pushMessage(state, createMessage(action.payload, 'success'))
    },
    close: (state, action: PayloadAction<INotification>) => {
      const index = state?.notifications?.findIndex(message => message.id === action?.payload?.id)

      if (index >= 0) state?.notifications?.splice(index, 1)
    }
  }
})

export const { toastError, toastInfo, toastWarning, toastSuccess, close } = snackbarSlice.actions

export const selectNotifications = (state: RootState) => state.snackbar?.notifications
export const selectLastNotifications = (state: RootState) => state.snackbar?.notifications?.slice(0)?.slice(-5)

export default snackbarSlice.reducer
