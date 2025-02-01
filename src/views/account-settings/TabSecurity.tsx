// ** React Imports
import { ChangeEvent, MouseEvent, useState } from 'react'

// ** MUI Imports
import {
  Grid,
  Button,
  Divider,
  InputLabel,
  IconButton,
  CardContent,
  FormControl,
  OutlinedInput,
  InputAdornment,
  Box,
  BoxProps,
  styled
} from '@mui/material'

// ** Icons Imports
import { EyeOutline, EyeOffOutline, Close } from 'mdi-material-ui'

// ** Components Imports
import { MuiOtpInput } from 'mui-one-time-password-input'

// ** Redux Imports
import { store } from '@/redux/store'
import { useSelector } from 'react-redux'
import { selectAccount } from '@/redux/slices/authSlice'
import { toastError, toastSuccess } from '@/redux/slices/snackbarSlice'

// ** Services Import
import AuthService from '@/services/auth.service'
import { Alert, AlertTitle } from '@mui/material'

// ** Styled components
const BoxStyled = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    borderColor: theme.palette.secondary.main
  }
}))

interface State {
  newPassword: string
  showNewPassword: boolean
  confirmNewPassword: string
  showConfirmNewPassword: boolean
  otpCode: string
  hashedCode: string
  otpSent: boolean
  validationMessage: string | null
}

const TabSecurity = () => {
  // ** Stores
  const account = useSelector(selectAccount)

  // ** States
  const defaulValue = {
    newPassword: '',
    showNewPassword: false,
    confirmNewPassword: '',
    showConfirmNewPassword: false,
    otpCode: '',
    hashedCode: '',
    otpSent: false,
    validationMessage: null
  }
  const [values, setValues] = useState<State>(defaulValue)

  // ** Store
  const { dispatch } = store

  // Handle New Password
  const handleNewPasswordChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value, validationMessage: null })
  }
  const handleClickShowNewPassword = () => {
    setValues({ ...values, showNewPassword: !values.showNewPassword })
  }
  const handleMouseDownNewPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  // Handle Confirm New Password
  const handleConfirmNewPasswordChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value, validationMessage: null })
  }
  const handleClickShowConfirmNewPassword = () => {
    setValues({ ...values, showConfirmNewPassword: !values.showConfirmNewPassword })
  }
  const handleMouseDownConfirmNewPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const handleOtpChange = async (input: string) => {
    setValues({ ...values, otpCode: input })

    if (input.length === 5) {
      try {
        await AuthService.confirmOtpAndSetPassword(
          account.mobile_phone,
          parseInt(input),
          values.hashedCode,
          values.newPassword
        )
        setValues(defaulValue)

        dispatch(toastSuccess('رمز جدید با موفقیت تنظیم گردید.'))
      } catch (error) {
        dispatch(toastError('کد اعتباری را صحیح واردی نمایید.'))
      }
    }
  }

  const handleGetOtp = async (event: { preventDefault: () => void }) => {
    event.preventDefault()

    const validationMessage = compareTwoPasswordAndValidateThem(values.newPassword, values.confirmNewPassword)
    setValues({ ...values, validationMessage })

    if (validationMessage === null)
      try {
        const hashedCode = await AuthService.sendOtp(account.mobile_phone)
        setValues({ ...values, hashedCode, otpSent: true })
      } catch (error) {}
  }

  const compareTwoPasswordAndValidateThem = (newPassword: string, confirmNewPassword: string): string | null => {
    // Rule 0: Two Passwords is equal
    if (newPassword !== confirmNewPassword) {
      return 'رمز جدید با مقدار تایید آن برابر نیست'
    }

    // Rule 1: Password must be at least 8 characters long
    if (newPassword.length < 8) {
      return 'طول رمز انتخابی باید حداقل 8 کاراکتر باشد.'
    }

    // Rule 2: Password must contain at least one lowercase letter
    if (!/[a-z]/.test(newPassword)) {
      return 'رمز انتخابی باید حداقل یک کاراکتر کوچک انگلیسی داشته باشد'
    }

    // Rule 3: Password must contain at least one uppercase letter
    if (!/[A-Z]/.test(newPassword)) {
      return 'رمز انتخابی باید حداقل یک کاراکتر بزرگ انگلیسی داشته باشد'
    }

    // Rule 4: Password must contain at least one digit
    if (!/\d/.test(newPassword)) {
      return 'رمز انتخابی باید حداقل دارای یک عدد باشد.'
    }

    // Rule 5: Password must contain at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return 'رمز انتخابی باید حداقل دارای یک کاراکتر خاص باشد.'
    }

    // If the password satisfies all the rules, it is considered strong
    return null
  }

  return (
    <form>
      <CardContent sx={{ paddingBottom: 0 }}>
        <Grid container spacing={5}>
          <Grid item xs={12} sm={6}>
            <Grid container spacing={5}>
              <Grid item xs={12} sx={{ marginTop: 6 }}>
                <FormControl fullWidth>
                  <InputLabel htmlFor='account-settings-new-password'>رمز جدید</InputLabel>
                  <OutlinedInput
                    label='New Password'
                    value={values.newPassword}
                    id='account-settings-new-password'
                    onChange={handleNewPasswordChange('newPassword')}
                    type={values.showNewPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={handleClickShowNewPassword}
                          aria-label='toggle password visibility'
                          onMouseDown={handleMouseDownNewPassword}
                        >
                          {values.showNewPassword ? <EyeOutline /> : <EyeOffOutline />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel htmlFor='account-settings-confirm-new-password'>تایید رمز جدید</InputLabel>
                  <OutlinedInput
                    label='Confirm New Password'
                    value={values.confirmNewPassword}
                    id='account-settings-confirm-new-password'
                    type={values.showConfirmNewPassword ? 'text' : 'password'}
                    onChange={handleConfirmNewPasswordChange('confirmNewPassword')}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          aria-label='toggle password visibility'
                          onClick={handleClickShowConfirmNewPassword}
                          onMouseDown={handleMouseDownConfirmNewPassword}
                        >
                          {values.showConfirmNewPassword ? <EyeOutline /> : <EyeOffOutline />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                {values.validationMessage && (
                  <Alert
                    severity='warning'
                    sx={{ '& a': { fontWeight: 400 } }}
                    action={
                      <IconButton
                        size='small'
                        color='inherit'
                        aria-label='close'
                        onClick={() => setValues({ ...values, validationMessage: null })}
                      >
                        <Close fontSize='inherit' />
                      </IconButton>
                    }
                  >
                    <AlertTitle>{values.validationMessage}</AlertTitle>
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Button variant='contained' size='large' fullWidth sx={{ marginRight: 3.5 }} onClick={handleGetOtp}>
                  دریافت کد جهت تغییر رمز عبور
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                {values.otpSent && (
                  <BoxStyled sx={{ padding: 2, border: 1, borderRadius: 1 }}>
                    <MuiOtpInput
                      dir='ltr'
                      length={5}
                      gap={1}
                      autoFocus
                      value={values.otpCode}
                      onChange={handleOtpChange}
                    />
                  </BoxStyled>
                )}
              </Grid>
            </Grid>
          </Grid>

          <Grid
            item
            sm={6}
            xs={12}
            sx={{ display: 'flex', marginTop: [7.5, 2.5], alignItems: 'center', justifyContent: 'center' }}
          >
            <img width={183} alt='avatar' height={256} src='/images/pages/pose-m-1.png' />
          </Grid>
        </Grid>
      </CardContent>

      <Divider sx={{ margin: 0 }} />
    </form>
  )
}
export default TabSecurity
