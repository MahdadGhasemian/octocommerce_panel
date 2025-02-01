// ** React Imports
import { ChangeEvent, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { styled } from '@mui/material/styles'
import MuiCard, { CardProps } from '@mui/material/Card'

// ** Util Import
import { validateMobileNumber, validateMobileNumberFull } from '@/utils/mobile-phone-validation'

// **
import MobilePhoneInput from './MobilePhone'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Components Imports
import { MuiOtpInput } from 'mui-one-time-password-input'

interface State {
  otpSent: boolean
  phoneNumber: string
  otpCode: string
  hashedCode: string
  showPassword: boolean
  password: string
  loginMethod: 'otp' | 'password'
  customerWarning: boolean
}

// ** Styled Components
const Card = styled(MuiCard)<CardProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '28rem' }
}))

const Img = styled('img')(({ theme }) => ({
  // marginBottom: theme.spacing(10),
  [theme.breakpoints.down('lg')]: {
    // height: 276,
    // marginTop: theme.spacing(10)
  },
  [theme.breakpoints.down('md')]: {
    // height: 400
  },
  [theme.breakpoints.up('lg')]: {
    // marginTop: theme.spacing(13)
  }
}))

// ** Services Import
import AuthService, { User } from '@/services/auth.service'

// ** Redux Imports
import { store } from '@/redux/store'
import { toastError } from '@/redux/slices/snackbarSlice'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { EyeOffOutline, EyeOutline } from 'mdi-material-ui'

// ** Component Imports
import CountDownTimer from '@/components/CountDownTimer'
import { fixedMobileNumber, persianToLatinDigits } from '@/utils/number'

const LoginWithPhone = () => {
  // ** State
  const [values, setValues] = useState<State>({
    otpSent: false,
    phoneNumber: '',
    otpCode: '',
    hashedCode: '',
    password: '',
    showPassword: false,
    loginMethod: 'otp',
    customerWarning: false
  })

  // ** Hook
  const router = useRouter()

  // ** Store
  const { dispatch } = store

  const handleTimerComplete = () => {
    setValues({
      ...values,
      otpSent: false,
      phoneNumber: '',
      loginMethod: 'otp',
      customerWarning: false
    })
  }

  const handleLoginMethodChange = (method: 'otp' | 'password') => {
    setValues({ ...values, loginMethod: method, otpSent: false })
  }

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword })
  }

  const handleChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
    if (prop === 'phoneNumber' && !validateMobileNumber(event.target.value)) {
      return
    }

    setValues({ ...values, [prop]: event.target.value })
  }

  const handleOtpChange = (input: string) => {
    setValues({ ...values, otpCode: input })

    if (input.length === 5) confirmOtp(values.phoneNumber, parseInt(input), values.hashedCode)
  }

  const handleLogin = async () => {
    const phoneNumber = values.phoneNumber
    if (validateMobileNumberFull(phoneNumber)) {
      if (values.loginMethod === 'otp') {
        if (!values.otpSent) {
          try {
            setValues({ ...values, otpSent: true })
            const hashedCode = await AuthService.sendOtp(fixedMobileNumber(values.phoneNumber))
            setValues({ ...values, hashedCode, otpSent: true })
          } catch (e) {}
        } else {
          confirmOtp(values.phoneNumber, parseInt(values.otpCode), values.hashedCode)
        }
      } else {
        loginWithPassword(values.phoneNumber, values.password)
      }
    }
  }

  const confirmOtp = async (phoneNumber: string, code: number, hashedCode: string) => {
    try {
      const user = await AuthService.confirmOtp(fixedMobileNumber(phoneNumber), persianToLatinDigits(code), hashedCode)

      checkAccessAndRedirect(user)
    } catch (e) {
      dispatch(toastError('کد ورود صحیح نیست.'))
    }
  }

  const loginWithPassword = async (phoneNumber: string, password: string) => {
    try {
      const user = await AuthService.login(fixedMobileNumber(phoneNumber), password)

      checkAccessAndRedirect(user)
    } catch (e) {
      dispatch(toastError('اطلاعات ورود صحیح نیستند.'))
    }
  }

  const checkAccessAndRedirect = (user: User) => {
    const is_internal_user = user.accesses?.some(access => access.is_internal_user)

    if (is_internal_user) {
      router.push('/')
    } else {
      setValues({
        ...values,
        otpSent: false,
        phoneNumber: '',
        otpCode: '',
        hashedCode: '',
        password: '',
        showPassword: false,
        customerWarning: true
      })
    }
  }

  return (
    <Card sx={{ zIndex: 1 }}>
      <CardContent sx={{ padding: theme => `${theme.spacing(12, 9, 7)} !important` }}>
        <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Img
            alt='لوگو اُکتو کامرس'
            src='/images/octo-commerce.svg'
            sx={{
              width: '15%',
              height: 'auto'
            }}
          />
          <Typography
            variant='h6'
            sx={{
              ml: 3,
              lineHeight: 1,
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '1.5rem !important'
            }}
          >
            {themeConfig.templateName}
          </Typography>
        </Box>
        <Typography variant='h5' sx={{ mb: 8, fontWeight: 600, textAlign: 'center' }}>
          به پنل اُکتو کامرس خوش آمدید!
        </Typography>
        <Typography sx={{ mb: 4 }} variant='body2'>
          {/* لطفا جهت ورود شماره موبایل خود را وارد کنید. */}
        </Typography>
        <form
          noValidate
          autoComplete='off'
          onSubmit={e => {
            e.preventDefault(), handleLogin()
          }}
          dir='ltr'
        >
          <>
            {!values.otpSent && (
              <MobilePhoneInput
                autoFocus
                fullWidth
                type='number'
                label='شماره موبایل'
                onChange={handleChange('phoneNumber')}
                value={values.phoneNumber}
              />
            )}

            {values.loginMethod === 'password' && (
              <TextField
                type={values.showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={handleChange('password')}
                label='رمز عبور'
                fullWidth
                sx={{ marginTop: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <IconButton
                        edge='start'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                        sx={{ paddingRight: 0 }}
                      >
                        {values.showPassword ? <EyeOutline /> : <EyeOffOutline />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}

            {values.otpSent && (
              <MuiOtpInput
                length={5}
                gap={1}
                autoFocus
                value={values.otpCode}
                onChange={handleOtpChange}
                TextFieldsProps={{ type: 'number' }}
                sx={{
                  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                    display: 'none'
                  },
                  '& input[type=number]': {
                    MozAppearance: 'textfield'
                  }
                }}
              />
            )}
          </>

          {values.customerWarning && (
            <a
              href={`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}`}
              target='_blank'
              rel='noopener noreferrer'
              style={{ textDecoration: 'none', width: '100%' }}
            >
              <Button
                color='info'
                variant='outlined'
                fullWidth
                sx={{
                  padding: '16px',
                  margin: '8px 0',
                  fontSize: '1rem',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    borderColor: 'info.main'
                  }
                }}
              >
                <Box display='flex' flexDirection='column' gap={2} justifyContent='center' alignItems='center'>
                  <span dir='rtl' style={{ textAlign: 'center', fontSize: '1.1rem', lineHeight: '1.5' }}>
                    کاربر گرامی، این پنل مخصوص مدیریت و ارسال سفارش ها به مشتریان عزیز می باشد. لطفا جهت مشاهده کالاها و
                    سفارش گذاری با کلیک بر روی لینک ذیل به وب سایت اُکتو کامرس مراجعه نمایید.
                  </span>
                  <span style={{ color: '#1976d2', fontWeight: 'bold', fontSize: '1.2rem' }}>لینک وب سایت فروش</span>
                </Box>
              </Button>
            </a>
          )}

          <Button
            type='submit'
            fullWidth
            size='large'
            variant='contained'
            sx={{ marginBottom: 7, marginTop: 8 }}
            disabled={values.loginMethod === 'otp' && values.otpSent}
          >
            {values.loginMethod === 'otp' ? (
              !values.otpSent ? (
                'ارسال کد'
              ) : (
                <CountDownTimer seconds={119} onComplete={handleTimerComplete} />
              )
            ) : (
              'ورود'
            )}
          </Button>
        </form>
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant='text'
            color='primary'
            fullWidth
            onClick={() => handleLoginMethodChange(values.loginMethod === 'otp' ? 'password' : 'otp')}
          >
            {values.loginMethod === 'otp'
              ? values.otpSent
                ? 'اصلاح شماره یا ورود با رمز'
                : 'ورود با رمز عبور'
              : 'ورود با کد'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default LoginWithPhone
