// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import { Autocomplete, Box, Button, Grid, TextField, Typography } from '@mui/material'

// ** Component Imports

// ** Icons Imports
import { TrashCanOutline } from 'mdi-material-ui'

// ** Services Import
import { InventoryItem, Product } from '@/services/basic.service'

export type InventoryItemType = Partial<InventoryItem> & {
  random: string
}

type Props = {
  item: InventoryItemType
  productList: Array<Product>
  handleChangeItem: (values: InventoryItemType) => void
  handleRemoveItem: (item: InventoryItemType) => void
}

const ProductSelect = (props: Props) => {
  // ** Props
  const { item, productList, handleChangeItem, handleRemoveItem } = props

  // ** States
  const [values, setValues] = useState<InventoryItemType>({
    ...item,
    quantity: 1
  })
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(values.product || null)

  useEffect(() => {
    handleChangeItem(values)
  }, [values])

  const handleProductChange = (product: Product | null) => {
    setSelectedProduct(product)
    setValues({ ...values, product: product || undefined })
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
      <Grid container spacing={2}>
        <Grid item xs={12} md={11}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Autocomplete
                id='product_code'
                value={selectedProduct}
                options={productList}
                getOptionLabel={product => `${product.product_code}`}
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
                  >
                    {product.product_code}
                  </Box>
                )}
                renderInput={params => <TextField {...params} label='کد کالا' />}
                onChange={(_, value) => handleProductChange(value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                id='product_name'
                value={selectedProduct}
                options={productList}
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
                onChange={(_, value) => handleProductChange(value)}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <TextField
                fullWidth
                type='number'
                label='تعداد'
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

export default ProductSelect
