import { Contact } from '@/services/basic.service'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

export interface ContactState {
  contacts: Array<Contact>
}

const initialState: ContactState = {
  contacts: []
}

export const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    setContacts: (state, action: PayloadAction<Array<Contact>>) => {
      // Object.assign(state.contacts, action.payload)
      state.contacts = action.payload
    }
  }
})

export const { setContacts } = contactSlice.actions

export const selectContacts = (state: RootState) => state.contact.contacts

export default contactSlice.reducer
