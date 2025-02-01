import {
  Category,
  CategoryTree,
  Contact,
  DeliveryMethod,
  DeliveryMethodAreaRule,
  DeliveryPricingType,
  OrderStatus,
  Payment,
  Product,
  Setting
} from '@/services/basic.service'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'
import moment from 'moment-jalaali'
import { User } from '@/services/auth.service'
import { WritableDraft } from 'immer'
import { calculateCostPerDistance } from '@/utils/location'

export interface PackagingCostItem {
  id: number
  title?: string
  cost: number
  shared_packaging: boolean
}

export interface OrderItemType {
  random_id?: number
  voltage?: CategoryTree | null
  type?: Category | null
  product?: Product | null
  sale_price: number
  quantity?: number
  total?: number
  packaging_cost?: PackagingCostItem
}

export interface CartState {
  deliveryContact: Contact | null
  billingContact: Contact | null
  items: Array<OrderItemType>
  payments: Array<Payment>
  subtotal: number
  packaging_cost: number
  delivery_cost: number
  discount_percentage: number
  discount_amount: number
  tax_amount: number
  round_amount: number
  total: number
  order_bank_identifier_code: number
  order_invoice_number: number
  order_status: OrderStatus
  note: string
  delivery_date: string
  confirmed_rejected_by: User | null
  deliveryMethod?: DeliveryMethod | null
  deliveryMethodAreaRule?: DeliveryMethodAreaRule
  setting?: Setting
  created_at: string
  due_date: string
}

const getRandomInt = () => {
  return Number(Math.floor(Math.random() * 90000 + 10000))
}

const initialState: CartState = {
  deliveryContact: null,
  billingContact: null,
  items: [
    {
      random_id: getRandomInt(),
      sale_price: 1,
      quantity: 1
    }
  ],
  payments: [],
  subtotal: 0,
  packaging_cost: 0,
  delivery_cost: 0,
  discount_percentage: 0,
  discount_amount: 0,
  tax_amount: 0,
  round_amount: 0,
  total: 0,
  order_bank_identifier_code: 0,
  order_invoice_number: 0,
  order_status: OrderStatus.Pending,
  note: '',
  delivery_date: new Date().toISOString(),
  confirmed_rejected_by: null,
  deliveryMethod: null,
  created_at: new Date().toISOString(),
  due_date: new Date().toISOString()
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<OrderItemType>) => {
      const index = state.items.findIndex(a => a.product?.id === action.payload.product?.id)

      if (index >= 0) {
        state.items[index].quantity = (state.items[index].quantity || 0) + (action.payload.quantity || 0)
      } else {
        state.items.push({ ...action.payload, random_id: getRandomInt(), quantity: 1 })
      }

      generateFinalState(state)
    },
    removeItemFromCart: (state, action: PayloadAction<OrderItemType>) => {
      state.items = state.items.filter(item => item.random_id !== action.payload.random_id)

      generateFinalState(state)
    },
    editItemCart: (state, action: PayloadAction<OrderItemType>) => {
      const index = state.items.findIndex(a => a.random_id === action.payload.random_id)
      state.items[index] = action.payload

      generateFinalState(state)
    },

    setDeliveryContact: (state, action: PayloadAction<Contact>) => {
      state.deliveryContact = action.payload

      generateFinalState(state)
    },
    setBillingContact: (state, action: PayloadAction<Contact>) => {
      state.billingContact = action.payload
    },
    addPayment: (state, action: PayloadAction<Payment>) => {
      state.payments.push({ ...action.payload })
    },
    setNote: (state, action: PayloadAction<string>) => {
      state.note = action.payload
    },

    setDiscountPercentage: (state, action: PayloadAction<number>) => {
      state.discount_percentage = action.payload

      generateFinalState(state)
    },
    setDeliveryDate: (state, action: PayloadAction<string>) => {
      state.delivery_date = action.payload
    },
    setDeliveryMethodSelected: (state, action: PayloadAction<DeliveryMethod>) => {
      const deliveryMethod = action.payload

      state.deliveryMethod = deliveryMethod

      generateFinalState(state)
    },
    setDeliveryMethodAreaRuleSelected: (state, action: PayloadAction<DeliveryMethodAreaRule>) => {
      const deliveryMethodAreaRule = action.payload

      state.deliveryMethodAreaRule = deliveryMethodAreaRule

      generateFinalState(state)
    },
    setCartSetting: (state, action: PayloadAction<Setting>) => {
      state.setting = action.payload
    },
    resetCart: state => {
      Object.assign(state, { ...initialState, setting: state.setting })
    }
  }
})

const generateFinalState = (state: WritableDraft<CartState>) => {
  const tax_rate_default = state.setting?.tax_rate_default || 0

  state.items.forEach(item => (item.total = (item?.sale_price || 0) * (item.quantity || 0)))

  const { subtotal, discount_amount, packaging_cost, delivery_cost, tax_amount, round_amount, total } = calculatePrices(
    tax_rate_default,
    state.items?.map(item => {
      return {
        ...item,
        packaging_cost: item.product?.packaging_cost
      }
    }),
    state.deliveryMethod,
    state.deliveryMethodAreaRule,
    state.setting?.delivery_center_latitude,
    state.setting?.delivery_center_longitude,
    state.deliveryContact?.latitude,
    state.deliveryContact?.longitude
  )

  state.subtotal = subtotal
  state.discount_amount = discount_amount
  state.packaging_cost = packaging_cost
  state.delivery_cost = delivery_cost
  state.tax_amount = tax_amount
  state.round_amount = round_amount
  state.total = total
}

const calculatePrices = (
  tax_rate: number,
  items: {
    sale_price: number
    quantity?: number
    packaging_cost?: { id: number; cost: number; shared_packaging: boolean }
  }[],
  deliveryMethod?: DeliveryMethod | null,
  deliveryMethodAreaRule?: DeliveryMethodAreaRule,
  delivery_center_latitude?: number,
  delivery_center_longitude?: number,
  delivery_contact_latitude?: number,
  delivery_contact_longitude?: number
): {
  discount_amount: number
  tax_amount: number
  round_amount: number
  packaging_cost: number
  delivery_cost: number
  subtotal: number
  total: number
} => {
  // Rounding Factor
  const rounding_factor = 1

  // subtotal
  const subtotal = +items.reduce((acc, item) => acc + (item?.sale_price || 0) * (item.quantity || 0), 0)

  // packaging cost
  const packaging_cost = calculateTotalPackagingCost(items)

  // delivery cost
  const delivery_cost = calculateDeliveryCost(
    deliveryMethod,
    deliveryMethodAreaRule,
    delivery_center_latitude,
    delivery_center_longitude,
    delivery_contact_latitude,
    delivery_contact_longitude
  )

  // tax amount
  const tax_amount = (subtotal + packaging_cost + delivery_cost) * (tax_rate / 100)

  // discount amount
  const discount_amount = 0

  // total with tax, packaging, and delivery costs
  let totalWithExtras = subtotal + packaging_cost + delivery_cost + tax_amount

  // Apply rounding
  const round_amount = rounding_factor > 0 ? rounding_factor - (totalWithExtras % rounding_factor) : 0
  totalWithExtras += Number(round_amount)

  return {
    discount_amount,
    tax_amount,
    round_amount,
    packaging_cost,
    delivery_cost,
    subtotal,
    total: totalWithExtras
  }
}

const calculateTotalPackagingCost = (
  items: {
    packaging_cost?: { id: number; cost: number; shared_packaging: boolean }
  }[]
): number => {
  let packaging_cost = 0
  const handledPackagingIds = new Set<number>()

  for (const item of items) {
    const costItem = item?.packaging_cost

    if (!costItem) continue

    // Skip if this packaging cost ID has already been handled
    if (handledPackagingIds.has(costItem.id)) continue

    // Add the cost to the total
    packaging_cost += Number(costItem?.cost || 0)

    // If shared_packaging is true, mark the ID as handled and stop processing further for this group
    if (costItem.shared_packaging) {
      handledPackagingIds.add(costItem.id)
    }
  }

  return packaging_cost
}

const calculateDeliveryCost = (
  deliveryMethod?: DeliveryMethod | null,
  deliveryMethodAreaRule?: DeliveryMethodAreaRule,
  delivery_center_latitude?: number,
  delivery_center_longitude?: number,
  delivery_contact_latitude?: number,
  delivery_contact_longitude?: number
) => {
  let delivery_cost = 0

  if (
    deliveryMethod?.delivery_pricing_type === DeliveryPricingType.SELECTED_AREA &&
    deliveryMethod.delivery_method_area_rules?.length
  ) {
    delivery_cost = Number(deliveryMethodAreaRule?.price || 0)
  } else if (deliveryMethod?.delivery_pricing_type === DeliveryPricingType.PER_KILOMETER) {
    delivery_cost = calculateCostPerDistance(deliveryMethod?.fixed_price || 0, deliveryMethod?.per_kilometer || 0, [
      {
        latitude: delivery_center_latitude,
        longitude: delivery_center_longitude
      },
      {
        latitude: delivery_contact_latitude,
        longitude: delivery_contact_longitude
      }
    ])
  } else {
    delivery_cost = Number(deliveryMethod?.fixed_price || 0)
  }

  return delivery_cost
}

export const {
  addItemToCart,
  addPayment,
  editItemCart,
  removeItemFromCart,
  setNote,
  setDiscountPercentage,
  setDeliveryDate,
  setDeliveryMethodSelected,
  setDeliveryMethodAreaRuleSelected,
  setCartSetting,
  resetCart,
  setDeliveryContact,
  setBillingContact
} = cartSlice.actions

export const selectDeliveryMethod = (state: RootState) => state.cart.deliveryMethod
export const selectDeliveryMethodAreaRule = (state: RootState) => state.cart.deliveryMethodAreaRule
export const selectDeliveryContact = (state: RootState) => state.cart.deliveryContact
export const selectBillingContact = (state: RootState) => state.cart.billingContact
export const selectItems = (state: RootState) => state.cart.items
export const selectPayments = (state: RootState) => state.cart.payments
export const selectNote = (state: RootState) => state.cart.note
export const selectConfirmedRejectedBy = (state: RootState) => state.cart.confirmed_rejected_by
export const selectDeliveryDate = (state: RootState) => moment(state.cart.delivery_date)
export const selectSubtotal = (state: RootState) => convertToCurrency(state.cart.subtotal)
export const selectPackagingCost = (state: RootState) => convertToCurrency(state.cart.packaging_cost)
export const selectDeliveryCost = (state: RootState) => convertToCurrency(state.cart.delivery_cost)
export const selectDiscountPercentage = (state: RootState) => convertToCurrency(state.cart.discount_percentage)
export const selectDiscountAmount = (state: RootState) => convertToCurrency(state.cart.discount_amount)
export const selectTaxAmount = (state: RootState) => convertToCurrency(state.cart.tax_amount)
export const selectRoundAmount = (state: RootState) => convertToCurrency(state.cart.round_amount)
export const selectTotal = (state: RootState) => convertToCurrency(state.cart.total)
export const selectOrderBankIdentifierCode = (state: RootState) => state.cart.order_bank_identifier_code
export const selectOrderInvoiceNumber = (state: RootState) => state.cart.order_invoice_number
export const selectOrderCreatedAt = (state: RootState) => state.cart.created_at
export const selectOrderDueDate = (state: RootState) => state.cart.due_date
export const selectOrderStatus = (state: RootState) => state.cart.order_status
export const selectOrderIsPending = (state: RootState) => state.cart.order_status === OrderStatus.Pending
export const selectOrderIsConfirmed = (state: RootState) => state.cart.order_status === OrderStatus.Confirmed

const convertToCurrency = (amount: number): string => {
  return new Intl.NumberFormat().format(amount)
}

export default cartSlice.reducer
