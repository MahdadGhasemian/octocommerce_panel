import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

export enum MessageType {
  Default = 'default',
  NewOrder = 'new_order',
  NewPayment = 'new_payment',
  NewDelivery = 'new_delivery',
  NewBoard = 'new_board',
  EditBoard = 'edit_board',
  NewReview = 'new_review',
  NewQuestion = 'new_question'
}

export enum MessageGroupType {
  Default = 'default',
  Board = 'board'
}

export interface IMessage {
  id: number
  is_viewed: boolean
  type: MessageType
  group_type: MessageGroupType
  title: string
  body: string
  data: string | any
  created_at: Date
  updated_at: Date
}

export interface MessageState {
  messages: IMessage[]
  default_unread: number
  baord_unread: number
}

const initialState: MessageState = {
  messages: [],
  default_unread: 0,
  baord_unread: 0
}

export const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setDefaultCount: (state, action: PayloadAction<number>) => {
      state.default_unread = action.payload
    },

    setBoardCount: (state, action: PayloadAction<number>) => {
      state.baord_unread = action.payload
    },

    setMessages: (state, action: PayloadAction<Array<IMessage>>) => {
      state.messages = action.payload
    },

    addMessage: (state, action: PayloadAction<IMessage>) => {
      state.messages.unshift(action.payload)
      if (action.payload.group_type === MessageGroupType.Default) state.default_unread += 1
      else state.baord_unread += 1
    },

    removeMessage: (state, action: PayloadAction<IMessage>) => {
      state.messages = state.messages.filter(message => message.id !== action.payload.id)
      if (action.payload.group_type === MessageGroupType.Default) state.default_unread -= 1
      else state.baord_unread -= 1
    },

    clearMessages: state => {
      Object.assign(state.messages, [])
    }
  }
})

export const { setDefaultCount, setBoardCount, setMessages, addMessage, removeMessage, clearMessages } =
  messageSlice.actions

export const selectMessages = (state: RootState) => state.message?.messages
export const selectDefaultUnreadCount = (state: RootState) => state.message?.default_unread
export const selectBoardUnreadCount = (state: RootState) => state.message?.baord_unread
export const selectDefaultMessages = (state: RootState) =>
  state.message?.messages?.filter(message => message.group_type === MessageGroupType.Default)
export const selectBoardMessages = (state: RootState) =>
  state.message?.messages?.filter(message => message.group_type === MessageGroupType.Board)

export default messageSlice.reducer
