import { Setting } from '@/services/basic.service'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

export type SettingState = Setting

const initialState: SettingState = {
  invoice_number_pre_part: 0,
  invoice_number_multiple: 0,
  tax_rate_default: 0,
  base_price_scale_amount: 0,
  delivery_center_latitude: 0,
  delivery_center_longitude: 0
}

export const settingSlice = createSlice({
  name: 'setting',
  initialState,
  reducers: {
    setSetting: (state, action: PayloadAction<Setting>) => {
      Object.assign(state, action.payload)
    }
  }
})

export const { setSetting } = settingSlice.actions

export const selectSetting = (state: RootState) => state.setting

export default settingSlice.reducer
