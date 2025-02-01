// ** React Imports
import { forwardRef } from 'react'

// ** MUI Imports
import { Box, Grid, InputAdornment, Stack, TextField } from '@mui/material'

// ** Component Imports
import { NumericFormat, NumericFormatProps } from 'react-number-format'
import ExternalSellers from './ExternalSellers'

// ** Services Import
import { CategoryTree, OrderItem } from '@/services/basic.service'

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

export type Props = {
  priceEditable?: boolean
  item: OrderItem
  categoriesTree: Array<CategoryTree>
  editItem: any
  removeItem: any
}

const OrderSelectView = (props: Props) => {
  // ** Props
  const { priceEditable = false, item, editItem } = props

  const handleChangePrice = (value: number | string) => {
    const sale_price = Number(value || 0)

    editItem({
      ...item,
      sale_price
    })
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
        <Grid item xs={12} md={7}>
          <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
            <ExternalSellers product_id={item.product.id} />

            <TextField fullWidth label='نام کالا' value={`${item.product?.name}`} InputProps={{ readOnly: true }} />
          </Stack>
        </Grid>
        <Grid item xs={12} md={1}>
          <TextField fullWidth label='تعداد' value={item.quantity} InputProps={{ readOnly: true }} />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label='مبلغ (تومان)'
            value={item.sale_price}
            InputProps={{
              startAdornment: <InputAdornment position='start'>{/* <CurrencyRial /> */}</InputAdornment>,
              inputComponent: NumericFormatCustom as any,
              readOnly: !priceEditable
            }}
            onChange={e => handleChangePrice(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label='مبلغ کل (تومان)'
            value={(item?.sale_price || 0) * (item?.quantity || 0)}
            InputProps={{
              startAdornment: <InputAdornment position='start'>{/* <CurrencyRial /> */}</InputAdornment>,
              inputComponent: NumericFormatCustom as any,
              readOnly: true
            }}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default OrderSelectView
