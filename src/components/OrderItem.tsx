// ** React Imports
import { forwardRef, useState } from 'react'

// ** MUI Imports
import { Autocomplete, Box, Button, Grid, InputAdornment, TextField, Typography } from '@mui/material'

// ** Component Imports
import { NumericFormat, NumericFormatProps } from 'react-number-format'

// ** Icons Imports
import { CurrencyRial, TrashCanOutline } from 'mdi-material-ui'

// ** Services Import
import { CategoryTree, Product } from '@/services/basic.service'

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
  categoriesTree?: Array<CategoryTree>
  productList?: Array<Product>
}

const OrderItem = (props: OrderItemProps) => {
  // ** Props
  // const { item, categoriesTree, productList } = props
  const { viewMode = false, item, productList } = props

  // ** Store
  const { dispatch } = store

  // ** States
  // const [types, setTypes] = useState<Category[]>([])
  // const [products, setProducts] = useState<Product[]>([])
  // const [voltage, setVoltage] = useState<CategoryTree | null>(item.voltage || null)
  // const [type, setType] = useState<Category | null>(item.type || null)
  const [product, setProduct] = useState<Product | null>(item.product || null)

  // const voltages = categoriesTree[0].children
  //   .filter((item: CategoryTree) => item.children?.length)
  //   .sort((a: CategoryTree, b: CategoryTree) => a.ordering - b.ordering)

  // useEffect(() => {
  //   if (item?.voltage) {
  //     handleVoltage(item.voltage)
  //   }

  //   if (item?.type) {
  //     handleType(item.type)
  //   }
  // }, [])

  // const handleVoltage = (value: CategoryTree | null) => {
  //   if (value?.children) {
  //     setVoltage(value)

  //     const children = [...value.children]

  //     const typeValue = children?.sort((a: CategoryTree, b: CategoryTree) => a.ordering - b.ordering)

  //     setTypes(typeValue ? typeValue : [])
  //   }
  // }

  // const handleType = async (value: Category | null) => {
  //   setType(value)

  //   const products = productList?.filter(product => product.category.id === value?.id)

  //   if (products) setProducts(products)
  // }

  const handleProduct = async (value: Product | null) => {
    setProduct(value)

    dispatch(
      editItemCart({
        ...item,
        product: value,
        sale_price: value?.sale_price || 0
      })
    )

    // dispatch(
    //   editItemCart({
    //     ...item,
    //     product: value,
    //     voltage,
    //     type,
    //     sale_price: value?.sale_price,
    //     total: (value?.sale_price || 0) * (item?.quantity || 1)
    //   })
    // )
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
            <Grid item xs={12} md={6}>
              <Autocomplete
                id='product'
                value={product}
                options={productList || []}
                getOptionLabel={product => `${product.name}`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText={'هیچ آیتمی موجود نیست'}
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
                renderInput={params => <TextField {...params} label='نام کالا' />}
                onChange={(_, value) => handleProduct(value)}
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
            <Grid item xs={12} md={1}>
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
