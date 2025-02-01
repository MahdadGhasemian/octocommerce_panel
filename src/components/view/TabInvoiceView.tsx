// ** React Imports
import { useEffect, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** MUI Imports
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  TypographyProps
} from '@mui/material'
import { styled } from '@mui/material/styles'
import Box, { BoxProps } from '@mui/material/Box'

// ** Date Picker Import
import { DatePicker } from '@mui/x-date-pickers'

// ** Redux Imports
import { useSelector } from 'react-redux'
import { resetCart } from '@/redux/slices/cartSlice'
import { store } from '@/redux/store'
import { isInternalUser, isCustomerUser } from '@/redux/slices/authSlice'
import { selectSetting } from '@/redux/slices/settingSlice'
import { toastError, toastInfo, toastSuccess } from '@/redux/slices/snackbarSlice'

// ** Services Import
import BasicService, { CategoryTree, Order, OrderItem, OrderStatus } from '@/services/basic.service'

// ** Moment Import
import moment from 'moment-jalaali'

import SetStatus from '@/components/SetStatus'
import OrderSelectView from '@/components/OrderSelectView'

// ** Styled components
const BoxStyledRight = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    textAlign: 'right'
  }
}))

const BoxStyledLeft = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    textAlign: 'left'
  }
}))

const SubtotalText = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontWeight: 600,
  overflow: 'hidden',
  fontSize: '0.875rem',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  marginBottom: theme.spacing(0.75),
  border: 1,
  borderColor: 'primary.main'
}))

export type Props = {
  order: Order
  categoriesTree: Array<CategoryTree>
  isSmallScreen: boolean
}

const TabInvoiceView = (props: Props) => {
  // ** Props
  const { order: inputOrder, categoriesTree, isSmallScreen } = props

  // ** Hook
  const router = useRouter()

  // ** State
  const [order, setOrder] = useState<Order>()
  const [changedItems, setChangedItems] = useState<OrderItem[]>([])

  const [rejectedNote, setRejectNote] = useState<string>()

  // ** Global State
  const isAccess = useSelector(isInternalUser)
  const isUser = useSelector(isCustomerUser)
  const setting = useSelector(selectSetting)

  const { dispatch } = store

  const orderIsPending = (order: Order) => {
    return order.order_status === OrderStatus.Pending
  }

  const activeInvoice = (order: Order) => {
    return order.order_status !== OrderStatus.Pending && order.order_status !== OrderStatus.Rejected
  }

  const handleEditItem = (item: OrderItem) => {
    if (order && item) {
      const index = order?.order_items.findIndex(_ => _.id === item.id)
      order.order_items[index] = item

      setOrder(order)

      setChangedItems(prevItems => {
        const itemIndex = prevItems.findIndex(prevItem => prevItem.id === item.id)

        if (itemIndex === -1) {
          return [...(prevItems || []), item]
        } else {
          const newItems = [...(prevItems || [])]
          newItems[itemIndex] = item

          return newItems
        }
      })

      calculatePrices(order.discount_percentage)
    }
  }

  const handleRemoveItem = () => {
    //
  }

  const handleSaveChanges = async () => {
    try {
      if (!order) return

      const data: {
        delivery_date?: string
        note?: string
      } = {
        delivery_date: order.delivery_date,
        note: order.note
      }

      const { id } = order
      await BasicService.editOrder(id, data)

      if (changedItems) {
        for (const item of changedItems) {
          const updateItemData = {
            sale_price: item.sale_price
          }

          await BasicService.editOrderItem(id, item.id, updateItemData)
        }
      }

      dispatch(toastInfo('تغییرات با موفقیت ذخیره شد.'))
    } catch (error) {}
  }

  const handleConfirmOrRejectOrder = async (status: OrderStatus.Confirmed | OrderStatus.Rejected) => {
    try {
      await handleSaveChanges()

      if (!isUser && order?.id && order?.order_status === OrderStatus.Pending) {
        if (status === OrderStatus.Confirmed) {
          if (!order.delivery_date) {
            return dispatch(toastError('لطفا تاریخ تحویل را مشخص نمایید.'))
          }

          await BasicService.confirmOrder(Number(order.id))

          dispatch(toastSuccess('پیش فاکتور با موفقیت تایید گردید.'))
        } else {
          await BasicService.rejectOrder(Number(order.id), rejectedNote)

          dispatch(toastSuccess('پیش فاکتور رد شد.'))
        }

        dispatch(resetCart())
        router.push('/invoice/list')
      }
    } catch (error) {}
  }

  const handleReturnToList = () => {
    router.push('/invoice/list')
  }

  const handleRegenerateInvoice = async () => {
    try {
      if (order?.id) {
        await BasicService.regenerateOrderInvoice(order.id)
        dispatch(toastSuccess('پیش فاکتور مجددا تولید شد.'))
      }
    } catch (error) {
      dispatch(toastError('مشکلی در تولید مجدد پیش فاکتور ایجاد شده است'))
    }
  }

  const calculatePrices = (discount_percentage: number) => {
    if (order) {
      const { tax_rate_default } = setting

      // subtotal
      const subtotal = order.order_items.reduce((acc, item) => acc + (item?.sale_price || 0) * (item.quantity || 0), 0)

      // discount
      const taxRate = parseFloat((1 + tax_rate_default / 100).toFixed(2))
      const subtotalWithTax = subtotal * taxRate
      const discount = parseFloat(
        (
          (subtotalWithTax -
            Math.floor((subtotalWithTax - (subtotalWithTax * discount_percentage) / 100) / 1000) * 1000) /
          taxRate
        ).toFixed(0)
      )

      // tax
      let tax = Math.ceil(((subtotal - discount) * tax_rate_default) / 100)
      const virtulization__tax_amount = Math.ceil(((subtotal - discount) * tax_rate_default) / 100)
      const virtualization__total_real = Number(subtotal) - Number(discount) + Number(virtulization__tax_amount)
      const virtualization__total = Math.ceil(virtualization__total_real / 1000) * 1000
      const virtualization__round_amount = virtualization__total - virtualization__total_real
      tax += virtualization__round_amount ? -1 : 0

      // total
      const total = Number(subtotal) - Number(discount) + Number(tax)

      // rounding
      const round_amount = 0

      setOrder({
        ...order,
        subtotal,
        discount_percentage,
        discount_amount: discount,
        tax_amount: tax,
        round_amount,
        total
      })
    }
  }

  useEffect(() => {
    if (inputOrder) {
      setOrder(inputOrder)
      calculatePrices(inputOrder.discount_percentage)
    }
  }, [inputOrder])

  if (!order) {
    return <div></div>
  }

  return (
    <CardContent sx={{ padding: isSmallScreen ? 1 : 5 }}>
      <Card sx={{ paddingBottom: 10, paddingTop: 5 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='کاربر'
                value={`${order.user?.first_name || ''} ${order.user?.last_name || ''}`}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label='آدرس حمل'
                value={order.contact?.title || order.contact?.name}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label='آدرس صورتحساب'
                value={order.billing_contact?.title || order.billing_contact?.name}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              {!isUser && orderIsPending(order) && (
                <DatePicker
                  sx={{ width: '100%' }}
                  label='تاریخ تحویل'
                  value={order.delivery_date ? new Date(order.delivery_date) : null}
                  onChange={value => setOrder({ ...order, delivery_date: value?.toISOString() ?? '' })}
                  minDate={new Date()}
                  slotProps={{
                    actionBar: { actions: ['today'] }
                  }}
                />
              )}

              {!orderIsPending(order) && (
                <TextField
                  fullWidth
                  label='تاریخ تحویل'
                  value={moment(order.delivery_date).format('jYYYY/jMM/jDD')}
                  InputProps={{ readOnly: true }}
                />
              )}
            </Grid>
          </Grid>
          <Divider sx={{ marginTop: 5, marginBottom: 5 }} />
          <Box sx={{ margin: 0 }}>
            {order.order_items?.map((item, index) => (
              <OrderSelectView
                key={index}
                item={item}
                categoriesTree={categoriesTree}
                editItem={handleEditItem}
                removeItem={handleRemoveItem}
                priceEditable={isAccess && orderIsPending(order)}
              />
            ))}
          </Box>
          {/* <DividerStyled /> */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Box sx={{ marginY: 5, marginX: 5 }}></Box>
            </Grid>
            <Grid item xs={6} md={1.6}>
              <Box sx={{ paddingRight: 4 }}>
                <Stack>
                  <BoxStyledRight>
                    <SubtotalText>جمع کل:</SubtotalText>
                  </BoxStyledRight>
                  <BoxStyledRight>
                    <SubtotalText>بسته بندی:</SubtotalText>
                  </BoxStyledRight>
                  <BoxStyledRight>
                    <SubtotalText>هزینه حمل:</SubtotalText>
                  </BoxStyledRight>
                  <BoxStyledRight>
                    <SubtotalText>تخفیف:</SubtotalText>
                  </BoxStyledRight>
                  <BoxStyledRight>
                    <SubtotalText>ارزش افزوده:</SubtotalText>
                  </BoxStyledRight>
                  <BoxStyledRight>
                    <SubtotalText>مبلغ رندینگ:</SubtotalText>
                  </BoxStyledRight>
                  <BoxStyledRight>
                    <SubtotalText>مبلغ قابل پرداخت:</SubtotalText>
                  </BoxStyledRight>
                  {/* {order.order_status !== OrderStatus.Pending && (
                    <BoxStyledRight>
                      <SubtotalText color='primary'>شناسه واریز:</SubtotalText>
                    </BoxStyledRight>
                  )} */}
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={6} md={1.6}>
              <Box sx={{ paddingLeft: 3 }}>
                <Stack>
                  <BoxStyledLeft>
                    <SubtotalText>{Number(order.subtotal).toLocaleString()}</SubtotalText>
                  </BoxStyledLeft>
                  <BoxStyledLeft>
                    <SubtotalText>{Number(order.packaging_cost).toLocaleString()}</SubtotalText>
                  </BoxStyledLeft>
                  <BoxStyledLeft>
                    <SubtotalText>{Number(order.delivery_cost).toLocaleString()}</SubtotalText>
                  </BoxStyledLeft>
                  <BoxStyledLeft>
                    <SubtotalText>{Number(order.discount_amount).toLocaleString()}</SubtotalText>
                  </BoxStyledLeft>
                  <BoxStyledLeft>
                    <SubtotalText>{Number(order.tax_amount).toLocaleString()}</SubtotalText>
                  </BoxStyledLeft>
                  <BoxStyledLeft>
                    <SubtotalText>{Number(order.round_amount).toLocaleString()}</SubtotalText>
                  </BoxStyledLeft>
                  <BoxStyledLeft>
                    <SubtotalText>{Number(order.total).toLocaleString()}</SubtotalText>
                  </BoxStyledLeft>
                  {/* {order.order_status !== OrderStatus.Pending && (
                    <BoxStyledLeft>
                      <SubtotalText color='primary'>{order.order_bank_identifier_code}</SubtotalText>
                    </BoxStyledLeft>
                  )} */}
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12}>
              {isUser ? (
                <TextField
                  fullWidth
                  type='text'
                  label='یادداشت'
                  multiline
                  rows={2}
                  value={order?.note || ''}
                  InputProps={{ readOnly: true }}
                />
              ) : (
                <TextField
                  fullWidth
                  type='text'
                  label='یادداشت'
                  multiline
                  rows={2}
                  value={order?.note || ''}
                  onChange={e => setOrder({ ...order, note: e.target.value })}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              {!isUser ? (
                <Stack direction='row' spacing={2}>
                  <Typography variant='body2'>
                    {order.order_status === OrderStatus.Confirmed ? 'تایید شده توسط:' : 'رد شده توسط:'}
                  </Typography>
                  <Typography variant='body2'>
                    {order.confirmed_rejected_by?.first_name || ''} {order.confirmed_rejected_by?.last_name || ''}
                  </Typography>
                </Stack>
              ) : (
                <></>
              )}

              {order.rejected_note && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: { xs: 'center', md: 'start' },
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 0, sm: 2 }
                  }}
                >
                  <Typography variant='body2' color={'error'}>
                    درخواست به علت:
                  </Typography>
                  <Typography variant='body2' color={'error'} sx={{ fontWeight: 600 }}>
                    {order.rejected_note}
                  </Typography>
                  <Typography variant='body2' color={'error'}>
                    تایید نگردید.
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>

        <CardActions>
          <Grid container spacing={4} sx={{ marginTop: 10 }}>
            {isAccess && orderIsPending(order) && (
              <Grid item xs={12} md={4}>
                <SetStatus
                  confirmedValue={OrderStatus.Confirmed}
                  rejectedValue={OrderStatus.Rejected}
                  handleConfirmOrReject={handleConfirmOrRejectOrder}
                  setRejectNote={setRejectNote}
                  confirmButtonText={'ذخیره و تایید'}
                />
              </Grid>
            )}

            {activeInvoice(order) ? (
              <Grid item xs={12} md={2}>
                <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' gap={4}>
                  <Button variant='contained' color='info' fullWidth>
                    <a
                      href={order.pdf_file_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      پرینت پیش فاکتور
                    </a>
                  </Button>
                  <Button variant='outlined' color='warning' fullWidth onClick={handleRegenerateInvoice}>
                    تولید مجدد پیش فاکتور
                  </Button>
                </Box>
              </Grid>
            ) : (
              <></>
            )}

            <Grid item xs={12} md={2}>
              <Button type='reset' variant='outlined' color='secondary' fullWidth onClick={handleReturnToList}>
                بازگشت به لیست
              </Button>
            </Grid>
          </Grid>
        </CardActions>
      </Card>
    </CardContent>
  )
}

export default TabInvoiceView
