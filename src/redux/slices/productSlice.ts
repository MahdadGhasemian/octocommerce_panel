import { Product } from '@/services/basic.service'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

export interface ProductState {
  total_pages: number
  items: Array<Product>
}

const initialState: ProductState = {
  total_pages: 0,
  items: []
}

export const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<ProductState>) => {
      Object.assign(state, action.payload)
    }
  }
})

export const { setProducts } = productSlice.actions

export const selectProducts = (state: RootState) => state.product.items

export default productSlice.reducer
