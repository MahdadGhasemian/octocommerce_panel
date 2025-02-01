// ** MUI Imports
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material'

export type Props = {
  message: string
  buttonText?: string
  buttonHandler?: any
}

const Empty = (props: Props) => {
  // ** Props
  const { message, buttonText, buttonHandler } = props

  // ** Hook
  const theme = useTheme()

  // ** Mobile view
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Box display='flex' alignItems='center' justifyContent='center' sx={{ marginTop: 64 }}>
      <Box display='flex' alignItems='center'>
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          textAlign='center'
          width={!isMobile ? 'auto' : '100%'}
        >
          <Typography variant='h5' align='center' gutterBottom>
            {message}
          </Typography>
          {buttonText && buttonHandler && (
            <Button
              variant='contained'
              color='primary'
              size={isMobile ? 'medium' : 'large'}
              fullWidth
              sx={{ marginTop: 4 }}
              onClick={buttonHandler}
            >
              {buttonText}
            </Button>
          )}
        </Box>
        {!isMobile && <img src='/images/pages/pose-m-1.png' alt='new user image' />}
      </Box>
    </Box>
  )
}

export default Empty
