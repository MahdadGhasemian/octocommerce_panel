// ** React Imports
import { FC, Fragment, useState } from 'react'

// ** MUI Components
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useTheme
} from '@mui/material'

// ** Icons Imports
import { BasketFill, Close } from 'mdi-material-ui'
import basicService, { Product } from '@/services/basic.service'

// ** Redux Imports
import { store } from '@/redux/store'
import { toastError } from '@/redux/slices/snackbarSlice'

interface Props {
  product_id: number
}

const ExternalSellers: FC<Props> = (props: Props) => {
  // ** Props
  const { product_id } = props

  // ** Hook
  const theme = useTheme()

  // ** States
  const [open, setOpen] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  // ** Store
  const { dispatch } = store

  const handleClickOpen = () => {
    setOpen(true)
    readProductDetail()
  }

  const handleClose = () => {
    setOpen(false)
  }

  const readProductDetail = async () => {
    try {
      setLoading(true)
      const product = await basicService.getProductAdmin(product_id)
      setProduct(product)
    } catch (error) {
      dispatch(toastError('خطایی رخ داده است!'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Fragment>
      <Button
        variant='outlined'
        color='success'
        onClick={() => handleClickOpen()}
        sx={{
          height: '56px'
        }}
      >
        <BasketFill />
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle>
          <Stack direction='row' justifyContent='space-between' alignItems='cetner'>
            <Typography variant='h6'>لیست منابع تامین و سفارش گذاری</Typography>
            <IconButton
              aria-label='close'
              onClick={handleClose}
              sx={theme => ({
                color: theme.palette.grey[500]
              })}
            >
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box display='flex' justifyContent='center' alignItems='center' py={2}>
              <CircularProgress size={20} />
            </Box>
          ) : product?.external_sellers?.length ? (
            product.external_sellers.map(seller => (
              <Box
                key={seller.id}
                sx={{
                  m: 4,
                  py: 2,
                  px: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: 1,
                  borderColor: theme.palette.info.main,
                  borderRadius: 1
                }}
              >
                <Typography variant='body1' fontWeight='bold'>
                  {seller.store_name}
                </Typography>

                <Button
                  variant='outlined'
                  color='primary'
                  size='small'
                  onClick={() => window.open(seller.store_product_url, '_blank', 'noopener,noreferrer')}
                >
                  مشاهده محصول
                </Button>
              </Box>
            ))
          ) : (
            <Typography variant='body2' color='textSecondary'>
              هیچ منبع تامینی موجود نیست.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Fragment>
  )
}

export default ExternalSellers
