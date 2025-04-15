// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

// ** Types Imports
import { ThemeColor } from '@/layouts/types'

// ** Services Import
import BasicService, { Payment, PaymentStatus, PaymentType } from '@/services/basic.service'

// ** Import libraries
import moment from 'moment-jalaali'
import { CardHeader } from '@mui/material'

interface StatusObj {
  [key: string]: {
    color?: ThemeColor
    sxColor?: string
    text: string
  }
}

const statusObj: StatusObj = {
  [PaymentStatus.Pending]: { sxColor: 'grey.800', text: 'در انتظار تایید' },
  [PaymentStatus.Confirmed]: { color: 'info', text: 'تایید شد' },
  [PaymentStatus.Rejected]: { color: 'error', text: 'رد شد' }
}

const paymentTypeObj: StatusObj = {
  [PaymentType.RECEIPT]: { sxColor: 'grey.800', text: 'رسید بانکی' },
  [PaymentType.ONLINE]: { color: 'info', text: 'آنلاین' }
}

const DashboardTable = () => {
  // ** States
  const [data, setData] = useState<Payment[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const sorting = [
        {
          id: 'id',
          desc: true
        }
      ]

      try {
        const response = await BasicService.getAllPayment(10, 1, undefined, [], sorting)

        setData(response.data)
      } catch (error) { }
    }
    fetchData()
  }, [])

  if (!data) return <p>در حال آماده سازی اطلاعات ...</p>

  if (!data.length) return <></>

  return (
    <Card>
      <CardHeader
        title='آخرین رسید های پرداخت'
        titleTypographyProps={{ sx: { lineHeight: '1.6 !important', letterSpacing: '0.15px !important' } }}
      />

      <TableContainer>
        <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
          <TableHead>
            <TableRow>
              <TableCell>نام کاربر</TableCell>
              <TableCell>تاریخ</TableCell>
              <TableCell>مبلغ</TableCell>
              <TableCell>شماره سفارش</TableCell>
              <TableCell>نوع پرداخت</TableCell>
              <TableCell>وضعیت</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item: Payment) => (
              <TableRow hover key={item.id} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                <TableCell>
                  {item.user?.first_name || ''} {item.user?.last_name || ''}
                </TableCell>
                <TableCell>{moment(item.created_at).format('jYYYY/jM/jD')}</TableCell>
                <TableCell>{Number(item.amount).toLocaleString()}</TableCell>
                <TableCell>{item.order?.order_invoice_number}</TableCell>
                <TableCell>
                  <Chip
                    label={paymentTypeObj[item.payment_type]?.text}
                    color={paymentTypeObj[item.payment_type]?.color}
                    sx={{
                      height: 24,
                      fontSize: '0.75rem',
                      textTransform: 'capitalize',
                      '& .MuiChip-label': { fontWeight: 500 },
                      color: paymentTypeObj[item.payment_type].sxColor ? 'grey.800' : undefined
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={statusObj[item.payment_status]?.text}
                    color={statusObj[item.payment_status]?.color}
                    sx={{
                      height: 24,
                      fontSize: '0.75rem',
                      textTransform: 'capitalize',
                      '& .MuiChip-label': { fontWeight: 500 },
                      color: statusObj[item.payment_status].sxColor ? 'grey.800' : undefined
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}

export default DashboardTable
