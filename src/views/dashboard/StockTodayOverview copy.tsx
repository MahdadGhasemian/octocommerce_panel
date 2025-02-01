// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import { Theme, useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Icons Imports
import DotsVertical from 'mdi-material-ui/DotsVertical'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Imports
import ReactApexcharts from '@/components/react-apexcharts'
import { ProductsWithStockInfoModel } from '@/services/basic.service'

const getDefultOptions = (theme: Theme): ApexOptions => {
  return {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 9,
        distributed: true,
        columnWidth: '40%',
        endingShape: 'rounded',
        startingShape: 'rounded'
      }
    },
    stroke: {
      width: 2,
      colors: [theme.palette.background.paper]
    },
    legend: { show: false },
    grid: {
      strokeDashArray: 7,
      padding: {
        top: 1,
        right: 0,
        left: 12,
        bottom: 5
      }
    },
    dataLabels: { enabled: true },
    colors: [theme.palette.background.default, theme.palette.primary.main],
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    xaxis: {
      categories: [''],
      tickPlacement: 'on',
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      show: true,
      tickAmount: 4,
      labels: {
        offsetX: -17,
        formatter: value => `${value}`
      }
    }
  }
}

type Props = {
  stockInfo?: Array<ProductsWithStockInfoModel>
}

const StockTodayOverview = (props: Props) => {
  // ** Props
  const { stockInfo } = props

  // ** Hook
  const theme = useTheme()

  // ** States
  const [options, setOptions] = useState<ApexOptions>(getDefultOptions(theme))

  const getChartData = (data: ProductsWithStockInfoModel[]) => {
    return data.map(item => item.quantitySold)
  }

  useEffect(() => {
    setOptions(prev => {
      return {
        ...prev,
        xaxis: {
          ...prev.xaxis,
          categories: stockInfo?.map(info => info.title)
        }
      }
    })
  }, [stockInfo])

  if (!stockInfo) return <></>

  return (
    <Card>
      <CardHeader
        title='بازدید هفتگی'
        titleTypographyProps={{
          sx: { lineHeight: '2rem !important', letterSpacing: '0.15px !important' }
        }}
        action={
          <IconButton size='small' aria-label='settings' className='card-more-options' sx={{ color: 'text.secondary' }}>
            <DotsVertical />
          </IconButton>
        }
      />
      <CardContent sx={{ '& .apexcharts-xcrosshairs.apexcharts-active': { opacity: 0 } }}>
        <ReactApexcharts type='bar' height={205} options={options} series={[{ data: getChartData(stockInfo) }]} />
        <Box sx={{ mb: 7, display: 'flex', alignItems: 'center' }}>
          <Typography variant='h5' sx={{ mr: 4 }}>
            45%
          </Typography>
          <Typography variant='body2'>بازدهی ماهانه شما در مقایسه با ماه قبل 45٪ 😎 بهتر است.</Typography>
        </Box>
        <Button fullWidth variant='contained'>
          جزییات
        </Button>
      </CardContent>
    </Card>
  )
}

export default StockTodayOverview
