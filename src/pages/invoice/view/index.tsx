// ** React Imports
import { SyntheticEvent, useEffect, useState } from 'react'

// ** MUI Imports
import { Box, Card, CardContent, useMediaQuery, Chip, Stack } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import MuiTab, { TabProps } from '@mui/material/Tab'

// ** Next Imports
import { useRouter } from 'next/router'
import Head from 'next/head'

// ** Icons Imports
import { CreditCardOutline, ReceiptTextCheckOutline, TruckDeliveryOutline, Warehouse } from 'mdi-material-ui'

// ** Tabs Imports
import TabInvoiceView from '@/components/view/TabInvoiceView'
import TabPayment from '@/components/view/TabPayment'
import TabDelivery from '@/components/view/TabDelivery'
import TabProduct from '@/components/view/TabProduct'

// ** Redux Imports
import { useSelector } from 'react-redux'
import { selectSetting, setSetting } from '@/redux/slices/settingSlice'
import { store } from '@/redux/store'
import { isCustomerUser } from '@/redux/slices/authSlice'

// ** Services Import
import BasicService, { CategoryTree, Order, OrderStatus, PaymentStatus } from '@/services/basic.service'

const Tab = styled(MuiTab)<TabProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    minWidth: 100
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 67
  }
}))

const TabName = styled('span')(({ theme }) => ({
  lineHeight: 1.71,
  fontSize: '0.875rem',
  marginLeft: theme.spacing(2.4),
  [theme.breakpoints.down('md')]: {
    display: 'none'
  }
}))

const Invoice = (props: { categoriesTree: Array<CategoryTree> }) => {
  // ** Props
  const { categoriesTree } = props

  // ** Hook
  const router = useRouter()
  const theme = useTheme()

  // ** State
  const [value, setValue] = useState<string>('invoice')
  const [order, setOrder] = useState<Order | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // ** Global State
  const setting = useSelector(selectSetting)
  const isUser = useSelector(isCustomerUser)

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const paidAmount =
    (order?.total || 0) -
    (order?.payments
      ?.filter(item => item.payment_status === PaymentStatus.Confirmed)
      .reduce((acc, item) => Number(acc) + Number(item?.amount), 0) || 0)

  const { dispatch } = store

  const { id, order_invoice_number } = router.query

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  const needToBeRefreshed = () => {
    setRefreshKey(key => key + 1)
  }

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        setOrder(null)

        if (!setting || setting.tax_rate_default === 0) {
          const setting = await BasicService.getSetting()
          dispatch(setSetting(setting))
        }

        const order = await BasicService.getOrder(Number(id))
        setOrder(order)
      }

      fetchData()
    }
  }, [id, refreshKey])

  if (!order)
    return (
      <div>
        <Card sx={{ paddingY: 10 }}>
          <CardContent>
            <p>در حال آماده سازی اطلاعات ...</p>
          </CardContent>
        </Card>
      </div>
    )

  return (
    <>
      <Head>
        <title>{`پیش فاکتور ${order_invoice_number}`}</title>
      </Head>
      <Card>
        <TabContext value={value}>
          <TabList onChange={handleChange} sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
            <Tab
              value='invoice'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ReceiptTextCheckOutline />
                  <TabName>
                    <span>1-</span>
                    <span>پیش فاکتور</span>
                  </TabName>
                </Box>
              }
            />
            <Tab
              value='payment'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CreditCardOutline />
                  <TabName>
                    <span>2-</span>
                    <span>پرداخت ها</span>
                  </TabName>
                </Box>
              }
              disabled={order?.order_status === OrderStatus.Pending || order?.order_status === OrderStatus.Rejected}
            />
            <Tab
              value='delivery'
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TruckDeliveryOutline />
                  <TabName>
                    <span>3-</span>
                    <span>اطلاعات حمل و نقل</span>
                  </TabName>
                </Box>
              }
              disabled={order?.order_status === OrderStatus.Pending || order?.order_status === OrderStatus.Rejected}
            />
            {!isUser && (
              <Tab
                value='product'
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Warehouse />
                    <TabName>
                      <span>4-</span>
                      <span>کالا</span>
                    </TabName>
                  </Box>
                }
                disabled={order?.order_status === OrderStatus.Pending || order?.order_status === OrderStatus.Rejected}
              />
            )}
            <Stack
              direction='row'
              justifyContent='flex-end'
              alignItems='center'
              spacing={2}
              sx={{ width: '100%', paddingX: 2 }}
            >
              {!isSmallScreen && (
                <div>
                  {paidAmount <= 0 ? (
                    <Chip label={'پرداخت شده'} color='success' />
                  ) : (
                    <Chip label={`مبلغ باقی مانده  ${Number(paidAmount).toLocaleString()} ریال`} color='error' />
                  )}
                </div>
              )}
              <div>
                {order.order_status === OrderStatus.Pending ? (
                  <Chip label={order.order_invoice_number} color='secondary' />
                ) : order.order_status === OrderStatus.Confirmed ? (
                  <Chip label={order.order_invoice_number} color='info' />
                ) : order.order_status === OrderStatus.Rejected ? (
                  <Chip label={order.order_invoice_number} color='error' />
                ) : (
                  <></>
                )}
              </div>
            </Stack>
          </TabList>

          <TabPanel sx={{ p: 0 }} value='invoice'>
            <TabInvoiceView order={order} categoriesTree={categoriesTree} isSmallScreen={isSmallScreen} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='payment'>
            <TabPayment order={order} isSmallScreen={isSmallScreen} needToBeRefreshed={() => needToBeRefreshed()} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='delivery'>
            <TabDelivery order={order} isSmallScreen={isSmallScreen} />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value='product'>
            <TabProduct order={order} isSmallScreen={isSmallScreen} />
          </TabPanel>
        </TabContext>
      </Card>
    </>
  )
}

export async function getServerSideProps() {
  const categoriesTree = await BasicService.getAllTree()

  return {
    props: {
      categoriesTree
    }
  }
}

export default Invoice
