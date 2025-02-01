import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { fetchCount } from './counterAPI'

export interface MahdadState {
  age: number
  english: 'A' | 'B' | 'C'
}

const initialState: MahdadState = {
  age: 36,
  english: 'A'
}

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const incrementAsync = createAsyncThunk('mahdad/fetchAge', async (amount: number) => {
  const response = await fetchCount(amount)

  // The value we return becomes the `fulfilled` action payload
  return response.data
})

export const mahdadSlice = createSlice({
  name: 'mahdad',
  initialState,
  reducers: {
    incrementAge: state => {
      state.age += 1
    },
    decrementAge: state => {
      state.age -= 1
    }
  },

  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: builder => {
    builder
      .addCase(incrementAsync.pending, state => {
        state.english = 'B'
      })
      .addCase(incrementAsync.fulfilled, (state, action) => {
        state.english = 'A'
        state.age += action.payload
      })
      .addCase(incrementAsync.rejected, state => {
        state.english = 'C'
      })
  }
})

export const { incrementAge, decrementAge } = mahdadSlice.actions

export const selectAge = (state: RootState) => state.mahdad.age
export const selectEnglish = (state: RootState) => state.mahdad.english

export default mahdadSlice.reducer
