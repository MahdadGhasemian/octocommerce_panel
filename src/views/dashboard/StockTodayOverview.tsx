// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import { Card, CardHeader, IconButton, CardContent } from '@mui/material'
import { Theme, useTheme } from '@mui/material/styles'

// ** Icons Imports
import DotsVertical from 'mdi-material-ui/DotsVertical'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Imports
import ReactApexcharts from '@/components/react-apexcharts'
import { ProductsWithStockInfoModel } from '@/services/basic.service'
import { useMediaQuery } from '@mui/material'

const getDefultOptions = (theme: Theme): ApexOptions => {
  return {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        distributed: true,
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
        top: -1,
        right: 0,
        left: -12,
        bottom: 5
      }
    },
    dataLabels: { enabled: true },
    colors: [theme.palette.primary.main, theme.palette.primary.main],
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
      labels: { show: true },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      show: true,
      tickAmount: 4,
      labels: {
        offsetX: -20,
        formatter: value => `${value}   `
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

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const getChartData = (data: ProductsWithStockInfoModel[]) => {
    const dataArray = [...data]

    return [
      { data: dataArray?.map(item => item.quantitySold) },
      { data: dataArray?.map(item => item.quantityInStock) },
      { data: dataArray?.map(item => item.quantityNonAssigned) }
    ]
  }

  useEffect(() => {
    setOptions(prev => {
      return {
        ...prev,
        xaxis: {
          ...prev.xaxis,
          categories: stockInfo?.map(info => info.title),
          labels: { show: !isSmallScreen }
        },
        colors: stockInfo?.map(info =>
          info.quantityInStock > info.quantityNonAssigned
            ? theme.palette.success.main
            : info.quantityInStock === info.quantityNonAssigned
            ? theme.palette.info.main
            : theme.palette.error.main
        )
      }
    })
  }, [stockInfo])

  if (!stockInfo) return <></>

  return (
    <Card>
      <CardHeader
        title='فروش امروز'
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
        <ReactApexcharts type='bar' height={205} options={options} series={getChartData(stockInfo)} />
      </CardContent>
    </Card>
  )
}

export default StockTodayOverview
