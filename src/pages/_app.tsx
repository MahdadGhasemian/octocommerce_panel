// ** Next Imports
import Head from 'next/head'
import { Router } from 'next/router'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'

// ** Redux Import
import { persistor, store } from '@/redux/store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

// ** Services
import SetupInterceptor from '@/services/interceptors'

// ** Loader Import
import NProgress from 'nprogress'

// ** Emotion Imports
import { CacheProvider } from '@emotion/react'
import type { EmotionCache } from '@emotion/cache'

// ** Config Imports
import themeConfig from 'src/configs/themeConfig'

// ** Component Imports
import ProtectedRoute from '@/components/ProtectedRoute'
import UserLayout from 'src/layouts/UserLayout'
import ThemeComponent from '@/theme/ThemeComponent'
import Notification from '@/components/Notification'

// ** Contexts
import { SettingsConsumer, SettingsProvider } from '@/context/settingsContext'
import { ConfirmationProvider } from '@/context/confirmationContext'

// ** Utils Imports
import { createEmotionCache } from '@/utils/create-emotion-cache'

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css'

// ** Global css styles
import '../styles/globals.css'

// ** Extend App Props with Emotion
type ExtendedAppProps = AppProps & {
  Component: NextPage
  emotionCache: EmotionCache
}

// Date Imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFnsJalali } from '@mui/x-date-pickers/AdapterDateFnsJalali'
import { faIR } from '@mui/x-date-pickers/locales'

const persianLocale = faIR.components.MuiLocalizationProvider.defaultProps.localeText

const clientSideEmotionCache = createEmotionCache()

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

// ** Configure JSS & ClassName
const App = (props: ExtendedAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  // Variables
  const getLayout =
    Component.getLayout ??
    (page => (
      <ProtectedRoute>
        <UserLayout>
          <ConfirmationProvider>
            <LocalizationProvider dateAdapter={AdapterDateFnsJalali} localeText={persianLocale}>
              {page}
            </LocalizationProvider>
            <Notification />
          </ConfirmationProvider>
        </UserLayout>
      </ProtectedRoute>
    ))

  SetupInterceptor.getInstance(store)

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <CacheProvider value={emotionCache}>
          <Head>
            <title>{`${themeConfig.templateName}`}</title>
            <meta name='description' content='پنل فروش اُکتو کامرس' />
            <meta name='keywords' content='اُکتو کامرس' />
            <meta name='viewport' content='initial-scale=1, width=device-width' />
            <meta name='theme-color' content='#1C326E' />
            <meta name='google' content='notranslate' key='notranslate' />
            <link rel='canonical' href={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}`} />
          </Head>

          <SettingsProvider>
            <SettingsConsumer>
              {({ settings }) => {
                return <ThemeComponent settings={settings}>{getLayout(<Component {...pageProps} />)}</ThemeComponent>
              }}
            </SettingsConsumer>
          </SettingsProvider>
        </CacheProvider>
      </PersistGate>
    </Provider>
  )
}

export default App
