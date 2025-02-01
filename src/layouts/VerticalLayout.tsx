// ** React Imports
import { useState } from 'react'

// ** Next Imports
import Head from 'next/head'
import { useRouter } from 'next/router'

// ** MUI Imports
import Fab from '@mui/material/Fab'
import { styled } from '@mui/material/styles'
import Box, { BoxProps } from '@mui/material/Box'

// ** Icons Imports
import ArrowUp from 'mdi-material-ui/ArrowUp'

// ** Theme Config Import
import themeConfig from 'src/configs/themeConfig'

// ** Type Import
import { LayoutProps } from '@/layouts/types'

// ** Components
import AppBar from './components/vertical/appBar'
import Navigation from '@/layouts/components/vertical/navigation'

// ** Header Imports
import Headers from 'src/headers'

// import Footer from '@/layouts/components/shared-components/footer'
import ScrollToTop from '@/components/scroll-to-top'

// ** Styled Component
import SocketConnection from '@/components/SocketConnection'

const VerticalLayoutWrapper = styled('div')({
  height: '100%',
  display: 'flex'
})

const MainContentWrapper = styled(Box)<BoxProps>({
  flexGrow: 1,
  minWidth: 0,
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column'
})

const ContentWrapper = styled('main')(({ theme }) => ({
  flexGrow: 1,
  width: '100%',
  padding: theme.spacing(6),
  transition: 'padding .25s ease-in-out',
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4)
  }
}))

const VerticalLayout = (props: LayoutProps) => {
  // ** Props
  const { settings, children, scrollToTop } = props

  // ** Hook
  const router = useRouter()

  // ** Vars
  const { contentWidth } = settings
  const navWidth = themeConfig.navigationSize

  // ** States
  const [navVisible, setNavVisible] = useState<boolean>(false)

  // ** Toggle Functions
  const toggleNavVisibility = () => setNavVisible(!navVisible)

  // ** Header Data
  const headerData = Headers(
    process.env.NEXT_PUBLIC_DOMAIN_NAME,
    process.env.NEXT_PUBLIC_TWITTER_ID,
    process.env.NEXT_PUBLIC_OG_TITLE,
    process.env.NEXT_PUBLIC_OG_DESCRIPTION,
    process.env.NEXT_PUBLIC_OG_IMAGE_URL
  ).routes.find(header => header.path === router.pathname)

  return (
    <>
      <SocketConnection />
      <VerticalLayoutWrapper className='layout-wrapper'>
        {/* Navigation Menu */}
        <Navigation
          navWidth={navWidth}
          navVisible={navVisible}
          setNavVisible={setNavVisible}
          toggleNavVisibility={toggleNavVisibility}
          {...props}
        />
        <MainContentWrapper className='layout-content-wrapper'>
          {/* AppBar Component */}
          <AppBar toggleNavVisibility={toggleNavVisibility} {...props} />

          {/* Content */}
          <ContentWrapper
            className='layout-page-content'
            sx={{
              ...(contentWidth === 'boxed' && {
                mx: 'auto',

                '@media (min-width:1440px)': { maxWidth: 1440 },
                '@media (min-width:1200px)': { maxWidth: '100%' }
              })
            }}
          >
            <>
              <Head>
                <title>{headerData?.title}</title>
                {headerData?.description && <meta name='description'>{headerData.description}</meta>}
              </Head>
              {children}
            </>
          </ContentWrapper>

          {/* Footer Component */}
          {/* <Footer {...props} /> */}
        </MainContentWrapper>
      </VerticalLayoutWrapper>

      {/* Scroll to top button */}
      {scrollToTop ? (
        scrollToTop(props)
      ) : (
        <ScrollToTop className='mui-fixed'>
          <Fab color='primary' size='small' aria-label='scroll back to top'>
            <ArrowUp />
          </Fab>
        </ScrollToTop>
      )}
    </>
  )
}

export default VerticalLayout
