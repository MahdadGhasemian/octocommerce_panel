// ** React Imports
import { ReactNode } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'

// ** Layout Import
import BlankLayout from '@/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustration'

// ** Components Imports
import LoginWithPhone from '@/components/LoginWithPhone'
import Notification from '@/components/Notification'

const LoginPage = () => {
  return (
    <Box className='content-center'>
      <LoginWithPhone />
      <FooterIllustrationsV1 />
    </Box>
  )
}

LoginPage.getLayout = (page: ReactNode) => (
  <BlankLayout>
    {page}
    <Notification />
  </BlankLayout>
)

export default LoginPage
