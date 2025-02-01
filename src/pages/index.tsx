// ** React Imports
import { useEffect, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** MUI Imports
import { Grid } from '@mui/material'

// ** Icons Imports
import HelpCircleOutline from 'mdi-material-ui/HelpCircleOutline'

// ** Custom Components Imports
import CardStatisticsVerticalComponent from '@/components/card-statistics/card-stats-vertical'

// ** Styled Component Import
import ApexChartWrapper from '@/styles/libs/react-apexcharts'

// ** Components Imports
import Table from '@/views/dashboard/Table'
import StatisticsCard from '@/views/dashboard/StatisticsCard'
import StockTodayOverview from '@/views/dashboard/StockTodayOverview'

// ** Redux Imports
import { useSelector } from 'react-redux'
import { isInternalUser, isCustomerUser, selectIsLogin } from '@/redux/slices/authSlice'

// ** Services Import
import BasicService, { Stats } from '@/services/basic.service'
import { Box } from 'mdi-material-ui'

const Dashboard = () => {
  // ** Hook
  const router = useRouter()

  // ** States
  const [statsData, setStatsData] = useState<Stats>()

  // ** Global State
  const isAccess = useSelector(isInternalUser)
  const isUser = useSelector(isCustomerUser)
  const isLogin = useSelector(selectIsLogin)

  useEffect(() => {
    if (!isAccess && isLogin) {
      router.push('/invoice/list')
    }
  }, [isAccess])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isUser) {
          const statsData = await BasicService.getStats()
          setStatsData(statsData)
        }
      } catch (error) {}
    }

    fetchData()
  }, [])

  if (!statsData) return <Box></Box>

  return (
    <ApexChartWrapper>
      <Grid container spacing={6}>
        {isAccess ? (
          <>
            <Grid item xs={12} md={8}>
              <StatisticsCard statsData={statsData} />
            </Grid>
            <Grid item xs={12} md={4}>
              <CardStatisticsVerticalComponent
                stats={statsData?.order?.new?.value?.toString() || ''}
                color='warning'
                trend={
                  statsData?.order?.new?.percentageChangeOneWeek && statsData.order.new.percentageChangeOneWeek >= 0
                    ? 'positive'
                    : 'negative'
                }
                trendNumber={`${statsData?.order.new?.percentageChangeOneWeek}%`}
                subtitle='هفته قبل'
                title='درخواست های فروش'
                icon={<HelpCircleOutline />}
              />
            </Grid>
            <Grid item xs={12}>
              <StockTodayOverview stockInfo={statsData?.stockInfo} />
            </Grid>
          </>
        ) : (
          <></>
        )}
        <Grid item xs={12}>
          <Table />
        </Grid>
      </Grid>
    </ApexChartWrapper>
  )
}

export default Dashboard
