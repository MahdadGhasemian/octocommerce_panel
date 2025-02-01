// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import { Autocomplete, Box, Button, Grid, TextField } from '@mui/material'

// ** Component Imports

// ** Icons Imports
import { TrashCanOutline } from 'mdi-material-ui'

// ** Services Import
import BasicService, { InventoryItem, StockInfo } from '@/services/basic.service'

export type InventoryItemType = Partial<InventoryItem> & {
  random: string
}

type Props = {
  warehouseId: number | undefined
  item: InventoryItemType
  handleChangeItem: (values: InventoryItemType) => void
  handleRemoveItem: (item: InventoryItemType) => void
}

const StockSelect = (props: Props) => {
  // ** Props
  const { warehouseId, item, handleChangeItem, handleRemoveItem } = props

  // ** States
  const [stockInfoList, setStockInfoList] = useState<Array<StockInfo>>([])
  const [values, setValues] = useState<InventoryItemType>({
    ...item,
    quantity: 1
  })
  const [selectedStockInfo, setSelectedStockInfo] = useState<StockInfo | null>(null)

  // ** Vars
  // const sorting = [{ id: 'created_at', desc: true }]

  useEffect(() => {
    handleChangeItem(values)
  }, [values])

  useEffect(() => {
    const fetchData = async () => {
      fetchStockInfoData()
    }

    fetchData()
  }, [warehouseId])

  const fetchStockInfoData = async (input?: string) => {
    input

    const filters = [{ id: 'quantity', value: '0', operator: '$gt' }]
    if (warehouseId) {
      filters.push({ id: 'warehouse_id', value: String(warehouseId), operator: '$eq' })
    }
    const stockInfo = await BasicService.getInventoryStockInfo(1000, 1, undefined, filters)

    setStockInfoList(stockInfo.data)
  }

  const handleStockInfoChange = (stockInfo: StockInfo | null) => {
    setSelectedStockInfo(stockInfo)

    setValues({
      ...values,
      product: stockInfo?.product || undefined
    })
  }

  const handleStockInfoInputChange = async (input: string) => {
    fetchStockInfoData(input)
  }

  const handleQuantityChange = (quantity: number | string) => {
    setValues({ ...values, quantity: Number(quantity || 0) })
  }

  return (
    <Box
      sx={{
        mb: 4,
        p: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 1,
        borderColor: 'action.disabled',
        borderRadius: 1
      }}
    >
      <Grid container spacing={4}>
        <Grid item xs={12} md={11}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={11}>
              <Autocomplete
                id='product_title'
                value={selectedStockInfo}
                options={stockInfoList}
                getOptionLabel={stock => `${stock.product.name} - ${stock.product.product_code}`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText={'هیچ آیتمی موجود نیست'}
                renderOption={(props, stock) => (
                  <Box
                    component='li'
                    {...props}
                    key={stock?.product?.id}
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: theme => theme.palette.divider
                      }
                    }}
                  >
                    {`${stock.product.name} - ${stock.product.product_code}`}
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
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <TextField
                fullWidth
                type='number'
                label='تعداد'
                disabled
                defaultValue={values.quantity}
                InputLabelProps={{
                  shrink: true
                }}
                InputProps={{
                  inputProps: { min: 0 }
                }}
                onChange={e => handleQuantityChange(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type='text'
                label='یادداشت'
                defaultValue={values.description}
                onChange={e => setValues({ ...values, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={1}>
          <Button color='error' variant='text' onClick={() => handleRemoveItem(values)}>
            حذف
            <TrashCanOutline />
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}

export default StockSelect
