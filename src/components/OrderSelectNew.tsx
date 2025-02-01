// ** React Imports
import { forwardRef, useEffect, useState } from 'react'

// ** MUI Imports
import { Autocomplete, Box, Button, CircularProgress, Grid, InputAdornment, TextField, Typography } from '@mui/material'

// ** Component Imports
import { NumericFormat, NumericFormatProps } from 'react-number-format'

// ** Icons Imports
import { CurrencyRial, TrashCanOutline } from 'mdi-material-ui'

// ** Services Import
import basicService, { Product } from '@/services/basic.service'

interface NumericFormatCustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void
  name: string
}

const NumericFormatCustom = forwardRef<NumericFormatProps, NumericFormatCustomProps>(function NumericFormatCustom(
  props,
  ref
) {
  const { onChange, ...other } = props

  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      onValueChange={values => {
        onChange({
          target: {
            name: props.name,
            value: values.value
          }
        })
      }}
      thousandSeparator
      valueIsNumericString
      prefix=''
    />
  )
})

// ** Redux Imports
import { editItemCart, OrderItemType, removeItemFromCart } from '../redux/slices/cartSlice'
import { store } from '@/redux/store'

export type OrderItemProps = {
  viewMode?: boolean
  item: OrderItemType
}

const OrderItem = (props: OrderItemProps) => {
  // ** Props
  const { viewMode = false, item } = props

  // ** Store
  const { dispatch } = store

  // ** States
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [options, setOptions] = useState<Product[]>([])

  const handleProduct = async (value: Product | null) => {
    setProduct(value)

    dispatch(
      editItemCart({
        ...item,
        product: value,
        sale_price: value?.sale_price || 0
      })
    )
  }

  const handleCount = (value: number | string) => {
    const count = Number(value || 1)

    dispatch(
      editItemCart({
        ...item,
        quantity: count
      })
    )
  }

  const handleRemoveItem = () => {
    dispatch(
      removeItemFromCart({
        ...item
      })
    )
  }

  // Fetch products when the inputValue changes
  useEffect(() => {
    const fetchData = async () => {
      const productFilters = [{ id: 'is_active', value: true, operator: '$eq' }]

      setLoading(true)
      const response = await basicService.getAllProduct(10, 1, inputValue, productFilters)
      setOptions(response.data || [])
      setLoading(false)
    }

    fetchData()
  }, [inputValue])

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
      <Grid container spacing={2}>
        {!viewMode ? (
          <>
            <Grid item xs={12} md={7}>
              <Autocomplete
                id='product'
                value={product}
                options={options}
                getOptionLabel={product => `${product.name}`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText={'هیچ آیتمی موجود نیست'}
                loadingText='در حال بارگذاری...'
                renderOption={(props, product) => (
                  <Box
                    component='li'
                    {...props}
                    key={product.id}
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: theme => theme.palette.divider
                      }
                    }}
                    gap={1}
                  >
                    <>
                      <Typography>{product.name}</Typography>
                      <Typography>{`(${product.product_code})`}</Typography>
                    </>
                  </Box>
                )}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='نام کالا'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loading ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
                onInputChange={(_, value) => setInputValue(value)}
                onChange={(_, value) => handleProduct(value)}
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <TextField
                fullWidth
                type='number'
                label='تعداد'
                defaultValue={item.quantity}
                InputLabelProps={{
                  shrink: true
                }}
                InputProps={{
                  inputProps: { min: 0 }
                }}
                onChange={e => handleCount(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label='مبلغ'
                value={item?.sale_price}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <CurrencyRial />
                    </InputAdornment>
                  ),
                  inputComponent: NumericFormatCustom as any,
                  readOnly: true
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label='مبلغ کل'
                value={item?.total}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <CurrencyRial />
                    </InputAdornment>
                  ),
                  inputComponent: NumericFormatCustom as any,
                  readOnly: true
                }}
              />
            </Grid>
            <Grid item xs={12} md={0.5}>
              <Button color='error' variant='text' onClick={() => handleRemoveItem()}>
                حذف
                <TrashCanOutline />
              </Button>
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} md={7}>
              <TextField fullWidth label='نام کالا' value={`${item.product?.name}`} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={1}>
              <TextField fullWidth label='تعداد' value={item.quantity} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label='مبلغ'
                value={item.sale_price}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <CurrencyRial />
                    </InputAdornment>
                  ),
                  inputComponent: NumericFormatCustom as any,
                  readOnly: true
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label='مبلغ کل'
                value={(item?.sale_price || 0) * (item?.quantity || 0)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <CurrencyRial />
                    </InputAdornment>
                  ),
                  inputComponent: NumericFormatCustom as any,
                  readOnly: true
                }}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  )
}

export default OrderItem
