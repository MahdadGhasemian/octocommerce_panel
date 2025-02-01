// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import { Autocomplete, Box, Button, Grid, TextField, useTheme } from '@mui/material'

// ** Redux Imports
import { store } from '@/redux/store'
import { toastError, toastSuccess } from '@/redux/slices/snackbarSlice'

// ** Date Picker Import
import { DatePicker } from '@mui/x-date-pickers'

// ** Component Imports

// ** Services Import
import BasicService, {
  Inventory,
  InventoryItem,
  InventoryType,
  MaterialUnit,
  OrderItem,
  Product,
  StockInfo,
  Warehouse
} from '@/services/basic.service'

export type OrderStockSelectDataType = {
  random: string
  orderItem: OrderItem
  product: Partial<Product>
  selectedStockInfo?: Partial<StockInfo>
  description?: string
  inventory_date: Date | string | undefined
  warehouse: Warehouse | undefined | null
  isAlreadyDone: boolean
}

type Props = {
  warehouseList: Array<Warehouse>
  item: OrderStockSelectDataType
}

const OrderStockSelect = (props: Props) => {
  // ** Props
  const { warehouseList, item } = props
  const isAlreadyDone = item.isAlreadyDone

  // ** Hook
  const theme = useTheme()

  // ** Store
  const { dispatch } = store

  // ** States
  const [stockInfoList, setStockInfoList] = useState<Array<StockInfo>>([])
  const [data, setData] = useState<Partial<OrderStockSelectDataType>>(item)

  useEffect(() => {
    const fetchData = async () => {
      fetchStockInfoData()
    }

    fetchData()
  }, [data.warehouse])

  const fetchStockInfoData = async (input?: string) => {
    input

    const filters = [{ id: 'quantity', value: '0', operator: '$gt' }]
    if (data?.warehouse?.id) {
      filters.push({ id: 'warehouse_id', value: String(data?.warehouse?.id), operator: '$eq' })
    }

    const stockInfo = await BasicService.getInventoryStockInfo(1000, 1, undefined, filters)
    setStockInfoList(stockInfo.data)
  }

  const handleStockInfoChange = (stockInfo: Partial<StockInfo> | null) => {
    if (stockInfo) setData({ ...data, selectedStockInfo: stockInfo })
  }

  const handleStockInfoInputChange = async (input: string) => {
    fetchStockInfoData(input)
  }

  const handleSaveInventory = async () => {
    const selectedStockInfo = data?.selectedStockInfo
    const warehouse_from_id = selectedStockInfo?.warehouse_id
    const product = selectedStockInfo?.product
    if (!warehouse_from_id) {
      return dispatch(toastError('لطفا انبار را انتخاب نمایید.'))
    }
    if (!selectedStockInfo || !product || product.id !== data.orderItem?.product?.id) {
      return dispatch(toastError('لطفا کالای متناظر با سفارش انتخاب شود.'))
    }
    const inventoryData: Partial<Inventory> = {
      inventory_date: data.inventory_date,
      inventory_type: InventoryType.Output,
      warehouse_from_id,
      inventory_items: [
        {
          product_id: product.id,
          unit: product.unit || MaterialUnit.Device,
          quantity: 1,
          description: data?.description || '',
          order_item_id: data.orderItem.id
        } as InventoryItem
      ]
    }
    try {
      await BasicService.createInventory(inventoryData)

      setData({
        ...data,
        isAlreadyDone: true
      })
      dispatch(toastSuccess('حواله با موفقیت ذخیره شد.'))
    } catch (error) {}
  }

  return (
    <Box
      sx={{
        mb: 5,
        p: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: Number(`${isAlreadyDone ? 3 : 1}`),
        borderRadius: 1,
        borderColor: `${isAlreadyDone ? theme.palette.success.main : theme.palette.primary.main}`
      }}
    >
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            type='text'
            label='کالا سفارش داده شده'
            value={`${data.orderItem?.product?.name} - ${data.orderItem?.product?.product_code}`}
            disabled
            InputLabelProps={{
              shrink: true
            }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <DatePicker
            sx={{ width: '100%' }}
            label='تاریخ حواله'
            value={data?.inventory_date ? new Date(data?.inventory_date) : null}
            onChange={value => setData({ ...data, inventory_date: value?.toISOString() ?? '' })}
            disabled={!!isAlreadyDone}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Autocomplete
            id='warehouse'
            value={data?.warehouse}
            options={warehouseList}
            getOptionLabel={warehouse => `${warehouse.title}`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText={'هیچ آیتمی موجود نیست'}
            renderOption={(props, warehouse) => (
              <Box
                component='li'
                {...props}
                key={warehouse.id}
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: theme => theme.palette.divider
                  }
                }}
              >
                {warehouse.title}
              </Box>
            )}
            renderInput={params => <TextField {...params} label='انبار' />}
            onChange={(_, value) => setData({ ...data, warehouse: value })}
            disabled={!!isAlreadyDone}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <Autocomplete
            id='product_title'
            value={data?.selectedStockInfo}
            options={stockInfoList}
            getOptionLabel={stock => `${stock?.product?.name} - ${stock?.product?.product_code}`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText={'هیچ آیتمی موجود نیست'}
            renderOption={(props, stock) => (
              <Box
                component='li'
                {...props}
                key={stock.product?.id}
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: theme => theme.palette.divider
                  }
                }}
              >
                {`${stock?.product?.name} - ${stock?.product?.product_code}`}
              </Box>
            )}
            renderInput={params => (
              <TextField
                {...params}
                label='نام و کد کالا'
                placeholder='برای جستجو می توانید نام و یا کد دستگاه را وارد کنید.'
              />
            )}
            onChange={(_, value) => handleStockInfoChange(value)}
            onInputChange={(_, value) => handleStockInfoInputChange(value)}
            filterOptions={x => x}
            disabled={!!isAlreadyDone}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type='text'
            label='یادداشت'
            defaultValue={data?.description || ''}
            onChange={e => setData({ ...data, description: e.target.value })}
            disabled={!!isAlreadyDone}
          />
        </Grid>
        {!isAlreadyDone && (
          <Grid item xs={12}>
            <Button variant='outlined' color='info' fullWidth onClick={handleSaveInventory}>
              ذخیره حواله
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default OrderStockSelect
