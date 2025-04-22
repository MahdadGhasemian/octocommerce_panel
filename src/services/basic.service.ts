import api, { ApiListResponse } from './api'
import { User } from './auth.service'
import { createParams, InputColumnFiltersModel, InputSortingModel } from './param'

export enum MaterialUnit {
  Number = 'number',
  Kilogram = 'kg',
  Meter = 'm',
  Box = 'box',
  Roll = 'roll',
  Device = 'device'
}

export enum ProductType {
  Unknown = 'unknown',
  Original = 'original',
  Copy = 'copy',
  Renew = 'renew'
}

export enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Rejected = 'rejected'
}

export enum PaymentStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Rejected = 'rejected'
}

export enum PaymentType {
  RECEIPT = 'receipt',
  ONLINE = 'online'
}

export enum DeliveryType {
  POST_NORAMAL = 'post_normal',
  POST_FAST = 'post_fast',
  TIPAX = 'tipax',
  RIDER = 'rider',
  SELF_PICKUP = 'self_pickup'
}

export enum DeliveryChargeType {
  PREPAID = 'prepaid',
  COD = 'cod'
}

export enum DeliveryPricingType {
  FIXED = 'fixed',
  SELECTED_AREA = 'selected_area',
  PER_KILOMETER = 'per_kilometer'
}

export enum DeliveryStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Rejected = 'rejected',
  InTransit = 'in_transit',
  Delivered = 'delivered'
}

export enum InventoryType {
  Input = 'input',
  Output = 'output',
  Transfer = 'transfer'
}

export enum OperatorType {
  Positive = 'positive',
  Negative = 'negative'
}

export enum TransactionType {
  Credit = 'credit',
  Debit = 'debit'
}

export enum TransactionNote {
  DiscountProfit = 'discount_profit'
}

export enum RecommendationType {
  UNKNOWN = 'unknown',
  RECOMMENDED = 'recommended',
  NOT_RECOMMENDED = 'not_recommended',
  NOT_SURE = 'not_sure'
}

export enum SmsTitleType {
  CODE_ACCOUNT_1 = 'code_account_1',
  CODE_ACCOUNT_2 = 'code_account_2',
  CODE_ACCOUNT_3 = 'code_account_3',
  CODE_ACCOUNT_4 = 'code_account_4',
  CODE_ACCOUNT_5 = 'code_account_5',
  CODE_ORDER_1 = 'code_order_1',
  CODE_ORDER_2 = 'code_order_2',
  CODE_ORDER_3 = 'code_order_3',
  CODE_ORDER_4 = 'code_order_4',
  CODE_ORDER_5 = 'code_order_5',
  CODE_ORDER_6 = 'code_order_6',
  CODE_PAYMENT_1 = 'code_payment_1',
  CODE_PAYMENT_2 = 'code_payment_2',
  CODE_PAYMENT_3 = 'code_payment_3',
  CODE_PAYMENT_4 = 'code_payment_4',
  CODE_PAYMENT_5 = 'code_payment_5',
  CODE_PAYMENT_6 = 'code_payment_6',
  CODE_DELIVERY_1 = 'code_delivery_1',
  CODE_DELIVERY_2 = 'code_delivery_2',
  CODE_DELIVERY_3 = 'code_delivery_3',
  CODE_DELIVERY_4 = 'code_delivery_4',
  CODE_DELIVERY_5 = 'code_delivery_5',
  CODE_PROMOTION_1 = 'code_promotion_1',
  CODE_PROMOTION_2 = 'code_promotion_2',
  CODE_SUPPORT_1 = 'code_support_1',
  CODE_SUPPORT_2 = 'code_support_2',
  CODE_SUPPORT_3 = 'code_support_3',
  CODE_INTERNAL_1 = 'code_internal_1',
  CODE_INTERNAL_2 = 'code_internal_2',
  CODE_INTERNAL_3 = 'code_internal_3'
}

export type Setting = {
  invoice_number_pre_part: number
  invoice_number_multiple: number
  tax_rate_default: number
  base_price_scale_amount: number
  delivery_center_latitude: number
  delivery_center_longitude: number
  product_code_prefix?: string
}

export type StockInfoModel = {
  id: number
  warehouse_id: number
  product_id: number
  product_code: string
  product_title: string
}

export type NotAssignedSalesModel = {
  order_item_id: number
  order_item_quantity: number
  inventory_items_count: number
  inventory_items: Array<number>
  product_id: number
  product_title: string
  product_code: string
}

export type ProductsWithStockInfoModel = {
  id: number
  title: string
  product_code: string
  quantitySold: number
  quantityInStock: number
  quantityNonAssigned: number
  stockInfo: StockInfoModel
}

type DataModel = {
  total?: number
  new?: {
    value?: number
    until?: Date
    percentageChangeOneWeek?: number
    percentageChangeOneMonth?: number
  }
}

export type Stats = {
  sale: DataModel
  user: DataModel
  product: DataModel
  order: DataModel
  income: DataModel
  stockInfo: Array<ProductsWithStockInfoModel>
}

export type ExternalCategorySeller = {
  store_name?: string
  store_category_url: string
  store_category_english_name: string
  store_category_persian_name: string
}

export type Category = {
  id: number
  name: string
  description: string
  image: string
  parent_id: number
  external_category_sellers?: ExternalCategorySeller[]
}

export type CategoryTree = {
  length: any
  id: number
  name: string
  description: string
  image: string
  children: CategoryTree[]
}

export type Specification = {
  key: string
  value: string
  key_2?: string
  value_2?: string
}

export type ExternalSeller = {
  id?: number
  store_name?: string
  store_product_url: string
}

export type PackagingCost = {
  id: number
  title?: string
  cost: number
  shared_packaging: boolean
  product_packaging_costs: Product[]
  created_at: Date
  updated_at: Date
}

export type DeliveryMethodAreaRule = {
  area_name: string
  price: number
}

export type DeliveryMethod = {
  id: number
  delivery_type: DeliveryType
  delivery_charge_type: DeliveryChargeType
  delivery_pricing_type: DeliveryPricingType
  fixed_price?: number
  per_kilometer?: number
  delivery_method_area_rules?: DeliveryMethodAreaRule[]
  is_enabled: boolean
  description?: string
  created_at: Date
  updated_at: Date
}

export type Product = {
  id: number
  product_code: string
  name: string
  description: string
  category_id: number
  category: Category
  image: string
  images: string[]
  datasheet: string
  part_number: string
  product_type: ProductType
  keywords: string[]
  sale_price: number
  discount_percentage: number
  discount_amount: number
  price_scale_value: number
  is_scalable_price: boolean
  unit: MaterialUnit
  is_active: boolean
  is_online_payment_allowed: boolean
  specifications: Specification[]
  external_sellers?: ExternalSeller[]
  packaging_cost_id: number
  packaging_cost: PackagingCost
  created_at: Date
  updated_at: Date
}

export type OrderItem = {
  id: number
  sale_price: number
  quantity: number
  order_id: number
  product: Product
  inventory_items?: Array<InventoryItem>
  created_at: Date
  updated_at: Date
}

export type Order = {
  id: number
  order_status: OrderStatus
  order_invoice_number: number
  order_bank_identifier_code: number
  note: string
  delivery_date: string
  created_at: Date
  updated_at: Date
  user: User
  contact_id: number
  contact: Contact
  billing_contact_id: number
  billing_contact: Contact
  order_items: Array<OrderItem>
  subtotal: number
  packaging_cost: number
  delivery_cost: number
  discount_percentage: number
  discount_amount: number
  tax_rate_percentage: number
  tax_amount: number
  round_amount: number
  total: number
  confirmed_rejected_by_account_id: number
  confirmed_rejected_by: User
  rejected_note: string
  payments: Array<Payment>
  due_date: Date
  share_code: string
  pdf_file_name: string
  pdf_file_url: string
  delivery: Delivery
}

export type AddOrder = {
  order_items: Array<{
    product_id?: number
    quantity?: number
  }>
  discount_percentage: number
  note?: string
}

export type Contact = {
  id: number
  account_id: number
  user: User
  title: string
  name: string
  phone: string
  mobile_phone: string
  address: string
  city: string
  postal_code: string
  national_code: string
  economic_code: string
  latitude: number
  longitude: number
  created_at: Date
  updated_at: Date
}

export type Payment = {
  id: number
  account_id: number
  order_id: number
  amount: number
  description: string
  attach_url: string
  confirmed_rejected_by_account_id: number
  rejected_note: string
  payment_status: PaymentStatus
  payment_type: PaymentType
  order: Order
  user: User
  confirmed_rejected_by: User
  created_at: Date
  updated_at: Date
}

export type Delivery = {
  id: number
  account_id: number
  user: User
  order: Order
  delivery_type: DeliveryType
  delivery_started_date: Date
  delivery_delivered_date: Date
  delivery_address: string
  delivery_city: string
  delivery_postal_code: string
  delivery_note: string
  delivery_latitude: number
  delivery_longitude: number
  driver_name: string
  driver_phone_number: string
  car_license_plate: string
  recipient_name: string
  recipient_national_id: string
  recipient_phone_number: string
  recipient_mobile_phone_number: string
  delivery_status: DeliveryStatus
  confirmed: boolean
  confirmation_date: Date
  confirmed_rejected_by_account_id: number
  confirmed_rejected_by: User
  rejected_note: string
  created_at: Date
  updated_at: Date
}

export type Warehouse = {
  id: number
  title: string
  is_virtualy: boolean
  address: string
  image: string
  description: string
  created_at: Date
  updated_at: Date
}

export type WarehouseInfo = {
  id: number
  title: string
  is_virtualy: boolean
  image: string
  description: string
}

export type Inventory = {
  id: number
  inventory_number?: number
  inventory_date: Date | string
  inventory_type: InventoryType
  warehouse_from_id: number
  warehouse_to_id: number
  inventory_items: InventoryItem[]
  inventory_description?: string
  created_by_account_id: number
  created_by: User
  updated_by_account_id: number
  updated_by: User
  created_at: Date
  updated_at: Date
}

export type InventoryItem = {
  id: number
  inventory_id: number
  inventory: Inventory
  operator_type: OperatorType
  warehouse_id: number
  warehouse: Warehouse
  warehouse_from_id: number
  warehouse_from: Warehouse
  warehouse_to_id: number
  warehouse_to: Warehouse
  product_id: number
  product: Product
  unit: MaterialUnit
  quantity: number
  description: string
  order_item_id: number
  order_item: OrderItem
  created_at: Date
  updated_at: Date
}

export type Stock = {
  quantity: number
  warehouse_id: number
  warehouse: Warehouse
  product_id: number
  product: Product
  inventory_item_id: number
  inventory_item: InventoryItem
}

export type StockData = {
  warehouse_id: number
  product_id: number
  product_name: string
  product_code: string
  warehouse_title: string
  total_quantity: number
}

export type StockInfo = {
  id: number
  warehouse_id: number
  warehouse: WarehouseInfo
  product_id: number
  product: Product
  inventory_item_id: number
  inventory_item: InventoryItem
  created_at: Date
  updated_at: Date
}

export type Review = {
  id: number
  title?: string
  content: string
  rating?: number
  pros?: string[]
  cons?: string[]
  images?: { url: string; description?: string }[]
  videos?: { url: string; description?: string }[]
  recommended?: RecommendationType
  is_anonymous: boolean
  user_has_bought_product: boolean
  user_id?: number
  user?: User
  product_id?: number
  product?: Product
  created_at: Date
  updated_at: Date
}

export type ReviewGist = {
  count: number
  average_rating: number
}

export type Answer = {
  id: number
  answer_text: string
  user_id?: number
  user?: User
  question_id?: number
  question?: Question
  created_at: Date
  updated_at: Date
}

export type Question = {
  id: number
  question_text: string
  user_has_bought_product: boolean
  answers?: Answer[]
  user_id?: number
  user?: User
  product_id?: number
  product?: Product
  created_at: Date
  updated_at: Date
}

export type ShortMessage = {
  id: number
  mobile_phone: string
  title_type: SmsTitleType
  text_list: string[]
  is_sent_by_system: boolean
  user_id: number
  user: User
  created_at: Date
  updated_at: Date
}

export type ShortMessageSend = {
  mobile_phone: string
  title_type: SmsTitleType
  text_list: string[]
}

class BasicService {
  // Setting
  getSetting(): Promise<Setting> {
    return api.get(`/store/settings`).then(response => {
      return response?.data
    })
  }

  getAllSetting(): Promise<Setting> {
    return api.get(`/store/settings/all`).then(response => {
      return response?.data
    })
  }

  editSetting(setting: Partial<Setting>): Promise<Setting> {
    return api.patch(`/store/settings`, setting).then(response => {
      return response?.data
    })
  }

  // Stats
  getStats(): Promise<Stats> {
    return api.get(`/store/analytics/stats`).then(response => {
      return response?.data
    })
  }

  // Category
  getAllTree(): Promise<Array<CategoryTree>> {
    return api.get(`/store/categories/get/tree`).then(response => {
      return response?.data
    })
  }

  getAllFlat(): Promise<Array<Category>> {
    return api.get(`/store/categories/get/flat`).then(response => {
      return response?.data
    })
  }

  getAllCategory(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<Category>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/store/categories', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  createCategory(category: Partial<Category>): Promise<Category> {
    return api.post('/store/categories', category).then(response => {
      return response?.data
    })
  }

  editCategory(id: number, category: Partial<Category>): Promise<Category> {
    return api.patch(`/store/categories/${id}`, category).then(response => {
      return response?.data
    })
  }

  deleteCategory(id: number): Promise<unknown> {
    return api.delete(`/store/categories/${id}`).then(response => {
      return response?.data
    })
  }

  getAllCategoryAdmin(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<Category>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/store/categories/list/admin', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  // Product
  getAllProduct(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<Product>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get(`/store/products`, {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  createProduct(product: Partial<Product>): Promise<Product> {
    return api.post('/store/products', product).then(response => {
      return response?.data
    })
  }

  getProduct(id: number): Promise<Product> {
    return api.get(`/store/products/${id}`).then(response => {
      return response?.data
    })
  }

  editProduct(id: number, product: Partial<Product>): Promise<Product> {
    return api.patch(`/store/products/${id}`, product).then(response => {
      return response?.data
    })
  }

  deleteProduct(id: number): Promise<unknown> {
    return api.delete(`/store/products/${id}`).then(response => {
      return response?.data
    })
  }

  getAllProductAdmin(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<Product>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get(`/store/products/list/admin`, {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  getProductAdmin(id: number): Promise<Product> {
    return api.get(`/store/products/${id}/admin`).then(response => {
      return response?.data
    })
  }

  updateAllProductsPricewithScale(): Promise<{ affected: number }> {
    return api.patch(`/store/products/mass/update/price-scale`, {}).then(response => {
      return response?.data
    })
  }

  // Order
  getAllOrder(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<Order>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/store/orders', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  createOrder(orderData: AddOrder): Promise<Order> {
    return api.post('/store/orders', orderData).then(response => {
      return response?.data
    })
  }

  createOrderForOtherUser(orderData: AddOrder & { user_id: number }): Promise<Order> {
    return api.post('/store/orders/other/user', orderData).then(response => {
      return response?.data
    })
  }

  getOrder(id: number): Promise<Order> {
    return api.get(`/store/orders/${id}`).then(response => {
      return response?.data
    })
  }

  editOrder(id: number, order: Partial<Order>): Promise<Order> {
    return api.patch(`/store/orders/${id}`, order).then(response => {
      return response?.data
    })
  }

  editBillingContactOrder(id: number, order: Partial<Order>): Promise<Order> {
    return api.patch(`/store/orders/${id}/billing`, order).then(response => {
      return response?.data
    })
  }

  confirmOrder(id: number): Promise<unknown> {
    return api.patch(`/store/orders/${id}/status/confirm`, {}).then(response => {
      return response?.data
    })
  }

  rejectOrder(id: number, rejected_note?: string): Promise<unknown> {
    return api.patch(`/store/orders/${id}/status/reject`, { rejected_note }).then(response => {
      return response?.data
    })
  }

  deleteOrder(id: number): Promise<unknown> {
    return api.delete(`/store/orders/${id}`).then(response => {
      return response?.data
    })
  }

  getOrderByShareCode(share_code: string): Promise<Order> {
    return api.get(`/store/orders/share/${share_code}`).then(response => {
      return response?.data
    })
  }

  editOrderItem(order_id: number, item_id: number, order_item: Partial<OrderItem>): Promise<Order> {
    return api.patch(`/store/orders/${order_id}/item/${item_id}`, order_item).then(response => {
      return response?.data
    })
  }

  createDelivery(order_id: number, delivery: Delivery): Promise<Delivery> {
    return api.post(`/store/orders/${order_id}/delivery`, delivery).then(response => {
      return response?.data
    })
  }

  getDelivery(order_id: number, delivery_id: number): Promise<Order> {
    return api.get(`/store/orders/${order_id}/delivery/${delivery_id}`).then(response => {
      return response?.data
    })
  }

  editDelivery(order_id: number, delivery_id: number, delivery: Partial<Delivery>): Promise<Order> {
    return api.patch(`/store/orders/${order_id}/delivery/${delivery_id}`, delivery).then(response => {
      return response?.data
    })
  }

  confirmDelivery(order_id: number, delivery_id: number): Promise<Delivery> {
    return api.patch(`/store/orders/${order_id}/delivery/${delivery_id}/status/confirm`, {}).then(response => {
      return response?.data
    })
  }

  rejectDelivery(order_id: number, delivery_id: number, rejected_note?: string): Promise<Delivery> {
    return api
      .patch(`/store/orders/${order_id}/delivery/${delivery_id}/status/reject`, { rejected_note })
      .then(response => {
        return response?.data
      })
  }

  regenerateOrderInvoice(order_id: number): Promise<Order> {
    return api.get(`/store/orders/${order_id}/regenerate/order/invoice`).then(response => {
      return response?.data
    })
  }

  // Contact
  getAllContact(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<Contact>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/store/contacts', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  createContact(contact: Partial<Contact>): Promise<Contact> {
    return api.post('/store/contacts', contact).then(response => {
      return response?.data
    })
  }

  getContact(id: number): Promise<Contact> {
    return api.get(`/store/contacts/${id}`).then(response => {
      return response?.data
    })
  }

  editContact(id: number, contact: Partial<Contact>): Promise<Contact> {
    return api.patch(`/store/contacts/${id}`, contact).then(response => {
      return response?.data
    })
  }

  deleteContact(id: number): Promise<unknown> {
    return api.delete(`/store/contacts/${id}`).then(response => {
      return response?.data
    })
  }

  createContactForOtherUser(contact: Partial<Contact & { user_id: number }>): Promise<Contact> {
    return api.post('/store/contacts/other/user', contact).then(response => {
      return response?.data
    })
  }

  // Payment
  getAllPayment(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<Payment>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/store/payments', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  createPayment(payment: Partial<Payment>): Promise<unknown> {
    return api.post('/store/payments', payment).then(response => {
      return response?.data
    })
  }

  createPaymentForOtherUser(payment: Partial<Payment> & { user_id: number }): Promise<Payment> {
    return api.post('/store/payments/other/user', payment).then(response => {
      return response?.data
    })
  }

  confrimPayment(id: number): Promise<unknown> {
    return api.patch(`/store/payments/${id}/status/confirm`, {}).then(response => {
      return response?.data
    })
  }

  rejectPayment(id: number, rejected_note?: string): Promise<unknown> {
    return api.patch(`/store/payments/${id}/status/confirm`, { rejected_note }).then(response => {
      return response?.data
    })
  }

  // Warehouse
  getAllWarehouse(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<Warehouse>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/store/warehouses', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  createWarehouse(warehouse: Partial<Warehouse>): Promise<Warehouse> {
    return api.post('/store/warehouses', warehouse).then(response => {
      return response?.data
    })
  }

  getWarehouse(id: number): Promise<Warehouse> {
    return api.get(`/store/warehouses/${id}`).then(response => {
      return response?.data
    })
  }

  editWarehouse(id: number, warehouse: Partial<Warehouse>): Promise<Warehouse> {
    return api.patch(`/store/warehouses/${id}`, warehouse).then(response => {
      return response?.data
    })
  }

  deleteWarehouse(id: number): Promise<unknown> {
    return api.delete(`/store/warehouses/${id}`).then(response => {
      return response?.data
    })
  }

  // Inventory
  getAllInventory(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<Inventory>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/store/inventories/', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  createInventory(inventory: Partial<Inventory>): Promise<Inventory> {
    return api.post('/store/inventories', inventory).then(response => {
      return response?.data
    })
  }

  getInventory(id: number): Promise<Inventory> {
    return api.get(`/store/inventories/${id}`).then(response => {
      return response?.data
    })
  }

  editInventory(id: number, inventory: Partial<Inventory>): Promise<Inventory> {
    return api.patch(`/store/inventories/${id}`, inventory).then(response => {
      return response?.data
    })
  }

  deleteInventory(id: number): Promise<unknown> {
    return api.delete(`/store/inventories/${id}`).then(response => {
      return response?.data
    })
  }

  editInventoryItem(id: number, inventoryItem: Partial<InventoryItem>): Promise<InventoryItem> {
    return api.patch(`/store/inventories/${id}/item`, inventoryItem).then(response => {
      return response?.data
    })
  }

  deleteInventoryItem(id: number): Promise<unknown> {
    return api.delete(`/store/inventories/${id}/item`).then(response => {
      return response?.data
    })
  }

  getAllInventoryItem(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[],
    inventory_type: string | InventoryType = InventoryType.Input
  ): Promise<ApiListResponse<InventoryItem>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get(`/store/inventories/items/items/${inventory_type}`, {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  getInventoryStock(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<StockData>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/store/inventories/items/stock/stock', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  getInventoryStockInfo(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<StockInfo>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/store/inventories/items/stock/stock/info', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  getInventoryStockVirtualy(productId: number): Promise<{ available_quantity: number }> {
    return api.get(`/store/inventories/stock/stock/product/${productId}/virtualy`).then(response => {
      return response?.data
    })
  }

  updateInventoryStockVirtualy(productId: number, available_quantity: number): Promise<{ available_quantity: number }> {
    return api
      .patch(`/store/inventories/stock/stock/product/${productId}/virtualy`, { available_quantity })
      .then(response => {
        return response?.data
      })
  }

  // Review
  getAllReview(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<Review>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/store/reviews', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  createReview(review: Partial<Review>): Promise<Review> {
    return api.post('/store/reviews', review).then(response => {
      return response?.data
    })
  }

  getReview(id: number): Promise<Review> {
    return api.get(`/store/reviews/${id}`).then(response => {
      return response?.data
    })
  }

  editReview(id: number, review: Partial<Review>): Promise<Review> {
    return api.patch(`/store/reviews/${id}`, review).then(response => {
      return response?.data
    })
  }

  deleteReview(id: number): Promise<unknown> {
    return api.delete(`/store/reviews/${id}`).then(response => {
      return response?.data
    })
  }

  // Question
  getAllQuestion(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<Question>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/store/questions', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  createQuestion(question: Partial<Question>): Promise<Question> {
    return api.post('/store/questions', question).then(response => {
      return response?.data
    })
  }

  getQuestion(id: number): Promise<Question> {
    return api.get(`/store/questions/${id}`).then(response => {
      return response?.data
    })
  }

  editQuestion(id: number, question: Partial<Question>): Promise<Question> {
    return api.patch(`/store/questions/${id}`, question).then(response => {
      return response?.data
    })
  }

  deleteQuestion(id: number): Promise<unknown> {
    return api.delete(`/store/questions/${id}`).then(response => {
      return response?.data
    })
  }

  // Support
  sendSupportShortMessage(data: ShortMessageSend): Promise<object> {
    return api.post('/store/supports/short-messages', data).then(response => {
      return response?.data
    })
  }

  getAllShortMessage(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<ShortMessage>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/store/supports/short-messages', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  // PackagingCost
  getAllPackagingCost(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<PackagingCost>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/store/packaging-costs', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  createPackagingCost(question: Partial<PackagingCost>): Promise<PackagingCost> {
    return api.post('/store/packaging-costs', question).then(response => {
      return response?.data
    })
  }

  getPackagingCost(id: number): Promise<PackagingCost> {
    return api.get(`/store/packaging-costs/${id}`).then(response => {
      return response?.data
    })
  }

  editPackagingCost(id: number, question: Partial<PackagingCost>): Promise<PackagingCost> {
    return api.patch(`/store/packaging-costs/${id}`, question).then(response => {
      return response?.data
    })
  }

  deletePackagingCost(id: number): Promise<unknown> {
    return api.delete(`/store/packaging-costs/${id}`).then(response => {
      return response?.data
    })
  }

  // DeliveryMethod
  getAllDeliveryMethod(
    limit?: number,
    page?: number,
    search?: string,
    columnFilters?: InputColumnFiltersModel[],
    sorting?: InputSortingModel[]
  ): Promise<ApiListResponse<DeliveryMethod>> {
    const params = createParams(limit, page, search, columnFilters, sorting)

    return api
      .get('/store/delivery-methods', {
        params
      })
      .then(response => {
        return response?.data
      })
  }

  createDeliveryMethod(question: Partial<DeliveryMethod>): Promise<DeliveryMethod> {
    return api.post('/store/delivery-methods', question).then(response => {
      return response?.data
    })
  }

  getDeliveryMethod(id: number): Promise<DeliveryMethod> {
    return api.get(`/store/delivery-methods/${id}`).then(response => {
      return response?.data
    })
  }

  editDeliveryMethod(id: number, question: Partial<DeliveryMethod>): Promise<DeliveryMethod> {
    return api.patch(`/store/delivery-methods/${id}`, question).then(response => {
      return response?.data
    })
  }

  deleteDeliveryMethod(id: number): Promise<unknown> {
    return api.delete(`/store/delivery-methods/${id}`).then(response => {
      return response?.data
    })
  }
}

export default new BasicService()
