import {
  DeliveryChargeType,
  DeliveryPricingType,
  DeliveryType,
  InventoryType,
  MaterialUnit,
  OperatorType,
  PaymentType
} from '@/services/basic.service'

export const DeliveryTypeMap = new Map<DeliveryType, string>([
  [DeliveryType.POST_NORAMAL, 'پست عادی'],
  [DeliveryType.POST_FAST, 'پست پیشتاز'],
  [DeliveryType.TIPAX, 'تی پاکس'],
  [DeliveryType.RIDER, 'پیک'],
  [DeliveryType.SELF_PICKUP, 'تحویل حضوری']
])

export const DeliveryChargeTypeMap = new Map<DeliveryChargeType, string>([
  [DeliveryChargeType.PREPAID, 'پیش کرایه'],
  [DeliveryChargeType.COD, 'پس کرایه']
])

export const DeliveryPricingTypeMap = new Map<DeliveryPricingType, string>([
  [DeliveryPricingType.FIXED, 'ثابت'],
  [DeliveryPricingType.SELECTED_AREA, 'انتخاب منطقه'],
  [DeliveryPricingType.PER_KILOMETER, 'براساس کیلومتر']
])

export const PaymentTypeMap = new Map<PaymentType, string>([
  [PaymentType.RECEIPT, 'واریز به حساب'],
  [PaymentType.ONLINE, 'آنلاین']
])

export const MaterialUnitMap = new Map<MaterialUnit, string>([
  [MaterialUnit.Number, 'عدد'],
  [MaterialUnit.Kilogram, 'کیلوگرم'],
  [MaterialUnit.Meter, 'متر'],
  [MaterialUnit.Box, 'باکس'],
  [MaterialUnit.Roll, 'رول'],
  [MaterialUnit.Device, 'دستگاه']
])

export const OperatorTypeMap = new Map<OperatorType, string>([
  [OperatorType.Negative, 'خروج'],
  [OperatorType.Positive, 'ورود']
])

export const InventoryTypeMap = new Map<InventoryType, string>([
  [InventoryType.Input, 'رسید'],
  [InventoryType.Output, 'حواله']
])
