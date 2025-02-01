// ** React Imports
import { ElementType, useEffect, useState } from 'react'

// ** MUI Imports
import { Button, ButtonProps, Card, CardActions, CardContent, Grid } from '@mui/material'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

// ** Components Imports
import PaymentItem from '@/components/PaymentItem'

// ** Services Import
import { Order, Payment, PaymentStatus } from '@/services/basic.service'
import Empty from '../Empty'

// ** Styled components
const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

export type Props = {
  order: Order
  isSmallScreen: boolean
  needToBeRefreshed?: () => void
}

const TabPayment = (props: Props) => {
  // ** Props
  const { order, isSmallScreen, needToBeRefreshed } = props

  // ** State
  const [payments, setPayments] = useState<Array<Payment>>([])

  // ** Vars
  const thereIsPayments: boolean = payments?.length ? true : false
  const paidAmount =
    (order?.total || 0) -
    (order?.payments
      ?.filter(item => item.payment_status === PaymentStatus.Confirmed)
      .reduce((acc, item) => Number(acc) + Number(item?.amount), 0) || 0)

  const handleAddPayment = async () => {
    setPayments(payments.concat({} as Payment))
  }

  useEffect(() => {
    if (order) {
      if (order && order?.payments) {
        setPayments(order.payments)
      }
    }
  }, [order])

  if (!payments) {
    return <div></div>
  }

  return (
    <CardContent sx={{ padding: isSmallScreen ? 1 : 5 }}>
      <Card sx={{ paddingBottom: 10, paddingTop: 5 }}>
        <CardContent>
          <Box>
            {thereIsPayments && paidAmount > 0 && (
              <ButtonStyled variant='contained' size='large' sx={{ mb: 4 }} onClick={handleAddPayment}>
                ثبت پرداخت جدید
              </ButtonStyled>
            )}
            {!thereIsPayments && (
              <Empty
                message='هنوز پرداختی برای این سفارش ثبت نشده است.'
                buttonText='ثبت پرداخت جدید'
                buttonHandler={handleAddPayment}
              />
            )}
            {payments ? (
              <Grid container spacing={6}>
                {payments
                  ?.slice()
                  ?.sort((a: Payment, b: Payment) => {
                    if (a === null || !a?.id) {
                      return 1
                    }

                    if (b === null || !b?.id) {
                      return -1
                    }

                    if (a?.id === b?.id) {
                      return 0
                    }

                    return a?.id < b?.id ? -1 : 1
                  })
                  ?.map((item, index) => {
                    return (
                      <Grid item xs={12} md={4} key={index}>
                        <PaymentItem
                          order_id={Number(order.id)}
                          item={item as Payment}
                          user_id={Number(order.user?.id)}
                          onCreated={() => (needToBeRefreshed ? needToBeRefreshed() : undefined)}
                          onConfirmOrRejectPayment={() => (needToBeRefreshed ? needToBeRefreshed() : undefined)}
                        />
                      </Grid>
                    )
                  })}
              </Grid>
            ) : (
              <></>
            )}
          </Box>
        </CardContent>

        <CardActions></CardActions>
      </Card>
    </CardContent>
  )
}

export default TabPayment
