// ** React Imports
import { ElementType, useEffect, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import { styled } from '@mui/material/styles'
import {
  Button,
  ButtonProps,
  CardActions,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
  TypographyProps
} from '@mui/material'
import Box, { BoxProps } from '@mui/material/Box'

// ** Components Imports
import OrderSelectNew from '@/components/OrderSelectNew'

// ** Icons Imports
import { Plus } from 'mdi-material-ui'

// ** Redux Imports
import { useSelector } from 'react-redux'
import {
  addItemToCart,
  selectItems,
  selectNote,
  selectSubtotal,
  selectTaxAmount,
  selectTotal,
  setCartSetting,
  setNote,
  selectDiscountPercentage,
  selectOrderIsPending,
  selectConfirmedRejectedBy,
  resetCart,
  selectDeliveryContact,
  setDeliveryContact,
  selectPackagingCost,
  selectDeliveryCost,
  selectRoundAmount,
  selectBillingContact,
  setBillingContact,
  selectDeliveryMethod,
  selectDeliveryMethodAreaRule
} from '@/redux/slices/cartSlice'
import { store } from '@/redux/store'
import { isCustomerUser } from '@/redux/slices/authSlice'
import { toastError, toastInfo } from '@/redux/slices/snackbarSlice'

// ** Services Import
import BasicService, { Contact, DeliveryPricingType } from '@/services/basic.service'
import UserSelect from '@/components/UserSelect'
import OrderInvoice from '@/components/OrderInvoice'
import { User } from '@/services/auth.service'
import DeliveryMethodSelect from '@/components/DeliveryMethodSelect'

// ** Styled components
const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

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

const Invoice = () => {
  // ** Hook
  const router = useRouter()

  // ** Global State
  const isUser = useSelector(isCustomerUser)
  const items = useSelector(selectItems)
  const subtotal = useSelector(selectSubtotal)
  const packagingCost = useSelector(selectPackagingCost)
  const deliveryCost = useSelector(selectDeliveryCost)
  const discount_percentage = useSelector(selectDiscountPercentage)
  const taxAmount = useSelector(selectTaxAmount)
  const roundAmount = useSelector(selectRoundAmount)
  const total = useSelector(selectTotal)
  const orderIsPending = useSelector(selectOrderIsPending)
  const note = useSelector(selectNote)
  const confirmed_rejected_by = useSelector(selectConfirmedRejectedBy)
  const deliveryContact = useSelector(selectDeliveryContact)
  const billingContact = useSelector(selectBillingContact)
  const deliveryMethod = useSelector(selectDeliveryMethod)
  const deliveryMethodAreaRule = useSelector(selectDeliveryMethodAreaRule)

  // ** States
  const [user, setUser] = useState<User | null>(null)

  const { dispatch } = store

  const handleSendInvoice = async () => {
    if (!items?.filter(item => item.product?.id && item.quantity)?.length) {
      return dispatch(toastError('لطفا حداقل یک کالا را انتخاب نمایید.'))
    }

    if (!deliveryMethod) {
      return dispatch(toastError('لطفا روش ارسال را انتخاب نمایید.'))
    }

    if (!deliveryContact) {
      return dispatch(toastError('لطفا آدرس ارسال را انتخاب نمایید.'))
    }

    if (!billingContact) {
      return dispatch(toastError('لطفا آدرس صورتحساب را انتخاب نمایید.'))
    }

    const ordeData = {
      delivery_method_id: deliveryMethod.id,
      delivery_method_area_rule_area_name:
        deliveryMethod.delivery_pricing_type === DeliveryPricingType.SELECTED_AREA
          ? deliveryMethodAreaRule?.area_name
          : undefined,
      contact_id: deliveryContact.id,
      billing_contact_id: billingContact.id,

      order_items: items
        .filter(item => item.product?.id && item.quantity)
        .map(item => {
          return {
            product_id: item.product?.id,
            quantity: item.quantity
          }
        }),
      discount_percentage: Number(discount_percentage || 0),
      note
    }

    if (ordeData.order_items?.length) {
      try {
        if (isUser) {
          await BasicService.createOrder(ordeData)
        } else {
          if (user) await BasicService.createOrderForOtherUser({ ...ordeData, user_id: +user.id })
        }

        dispatch(resetCart())

        dispatch(toastInfo(' سفارش شما با موفقیت ثبت شد. لطفا تایید پیش فاکتور خود را از طریق همین پنل پیگیری نمایید.'))

        router.push('/invoice/list')
      } catch (error) {}
    }
  }

  const handleNoteChange = (value: string) => {
    dispatch(setNote(value))
  }

  const handleReturnToList = () => {
    dispatch(resetCart())
    router.push('/invoice/list')
  }

  const handleOnSelectDeliveryContact = async (contact: Contact) => {
    dispatch(setDeliveryContact(contact))
  }

  const handleOnSelectBillingContact = async (contact: Contact) => {
    dispatch(setBillingContact(contact))
  }

  const handleUserSelect = (user: User | null) => {
    setUser(user)
  }

  useEffect(() => {
    const fetchData = async () => {
      const setting = await BasicService.getSetting()
      dispatch(setCartSetting(setting))
    }

    fetchData()
  }, [])

  return (
    <div>
      <Card sx={{ paddingY: 10 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DeliveryMethodSelect />
            </Grid>
          </Grid>

          <Divider sx={{ marginTop: 5, marginBottom: 5 }} />

          <Grid container spacing={2}>
            {!isUser && (
              <Grid item xs={12} md={4}>
                <UserSelect onChange={user => handleUserSelect(user)} />
              </Grid>
            )}
            <Grid item xs={12} md={4}>
              <OrderInvoice
                contact={deliveryContact}
                onSelectContact={handleOnSelectDeliveryContact}
                user={user}
                label='آدرس حمل'
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <OrderInvoice
                contact={billingContact}
                onSelectContact={handleOnSelectBillingContact}
                user={user}
                label='آدرس صورتحساب'
              />
            </Grid>
          </Grid>

          <Divider sx={{ marginTop: 5, marginBottom: 5 }} />

          <Box sx={{ margin: 0 }}>
            {items?.map((item, index) => (
              <OrderSelectNew key={index} item={item} />
            ))}
          </Box>
          {/* <DividerStyled /> */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Box sx={{ marginY: 5, marginX: 5 }}>
                {orderIsPending ? (
                  <ButtonStyled
                    variant='outlined'
                    color='success'
                    onClick={() => dispatch(addItemToCart({ sale_price: 1 }))}
                  >
                    جدید
                    <Plus />
                  </ButtonStyled>
                ) : (
                  <></>
                )}
              </Box>
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
                    <SubtotalText>ارزش افزوده:</SubtotalText>
                  </BoxStyledRight>
                  <BoxStyledRight>
                    <SubtotalText>مبلغ رندینگ:</SubtotalText>
                  </BoxStyledRight>
                  <BoxStyledRight>
                    <SubtotalText>مبلغ قابل پرداخت:</SubtotalText>
                  </BoxStyledRight>
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={6} md={1.6}>
              <Box sx={{ paddingLeft: 10 }}>
                <Stack>
                  <BoxStyledLeft>
                    <SubtotalText>{subtotal.toLocaleString()}</SubtotalText>
                  </BoxStyledLeft>
                  <BoxStyledLeft>
                    <SubtotalText>{packagingCost.toLocaleString()}</SubtotalText>
                  </BoxStyledLeft>
                  <BoxStyledLeft>
                    <SubtotalText>{deliveryCost.toLocaleString()}</SubtotalText>
                  </BoxStyledLeft>
                  <BoxStyledLeft>
                    <SubtotalText>{taxAmount.toLocaleString()}</SubtotalText>
                  </BoxStyledLeft>
                  <BoxStyledLeft>
                    <SubtotalText>{roundAmount.toLocaleString()}</SubtotalText>
                  </BoxStyledLeft>
                  <BoxStyledLeft>
                    <SubtotalText>{total.toLocaleString()}</SubtotalText>
                  </BoxStyledLeft>
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type='text'
                label='در صورتی که مطلبی در مورد سفارشتان دارید همین جا وارد کنید.'
                placeholder='یادداشت'
                multiline
                rows={2}
                defaultValue={note || ''}
                onChange={e => handleNoteChange(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              {!isUser ? (
                <Stack direction='row' spacing={2}>
                  <Typography variant='body2'>تایید شده توسط: </Typography>
                  <Typography variant='body2'>
                    {confirmed_rejected_by?.first_name || ''} {confirmed_rejected_by?.last_name || ''}
                  </Typography>
                </Stack>
              ) : (
                <></>
              )}
            </Grid>
          </Grid>
        </CardContent>

        <CardActions>
          <Grid container spacing={4} sx={{ marginTop: 10 }}>
            <Grid item xs={12} md={2}>
              <Button variant='contained' fullWidth onClick={handleSendInvoice}>
                ثبت پیش فاکتور
              </Button>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button type='reset' variant='outlined' color='secondary' fullWidth onClick={handleReturnToList}>
                بازگشت به لیست
              </Button>
            </Grid>
          </Grid>
        </CardActions>
      </Card>
    </div>
  )
}

export default Invoice
