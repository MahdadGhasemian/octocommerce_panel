// ** React Imports
import { useState, ChangeEvent, SyntheticEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Alert from '@mui/material/Alert'
import Select from '@mui/material/Select'
import { styled, useTheme } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import AlertTitle from '@mui/material/AlertTitle'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Button, { ButtonProps } from '@mui/material/Button'

// ** Icons Imports
import Close from 'mdi-material-ui/Close'

// ** Redux Imports
import { useDispatch, useSelector } from 'react-redux'
import { selectAccount, updateAccount } from '@/redux/slices/authSlice'
import { toastError, toastSuccess } from '@/redux/slices/snackbarSlice'

// ** Services Import
import StorageService from '@/services/storage.service'
import AuthService, { User } from '@/services/auth.service'
import { AppDispatch } from '@/redux/store'
import { CircularProgress, useMediaQuery } from '@mui/material'

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius
}))

const ButtonStyled = styled(Button)<ButtonProps & { htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const ResetButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(4.5),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4)
  }
}))

const TabAccount = () => {
  // ** Hook
  const theme = useTheme()

  // ** Stores
  const account = useSelector(selectAccount)

  // ** State
  const [openAlert, setOpenAlert] = useState<boolean>(false)
  const [info, setInfo] = useState<User>(account)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageChanged, setImageChanged] = useState(false)

  // ** Mobile view
  const mdDown = useMediaQuery(theme.breakpoints.down('md'))

  const dispatch = useDispatch<AppDispatch>()

  const onChange = async (file: ChangeEvent) => {
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      const file = files[0]

      if (file) {
        try {
          setImageLoading(true)
          StorageService.accessUploadFile(file)
            .then(response => {
              setInfo({ ...info, avatar: response?.url })
              setImageChanged(true)
            })
            .catch(e => {
              e
            })
            .finally(() => {
              setImageLoading(false)
            })
        } catch (error) {}
      }
    }
  }

  const handleSaveAccount = async () => {
    setImageChanged(false)
    try {
      const result = await AuthService.saveInfo(info)
      dispatch(updateAccount(result))
      dispatch(toastSuccess('تغییرات با موفقیت ذخیره شد.'))
    } catch (error) {
      dispatch(toastError('مشکل در ذخیره تغییرات به وجود آمده!'))
    }
  }

  const handleClearChanges = async () => {
    setImageChanged(false)
    setInfo({ ...account })
  }

  return (
    <CardContent>
      <form>
        <Grid container spacing={7}>
          <Grid item xs={12} sx={{ marginTop: 4.8, marginBottom: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: { xs: 'column', md: 'row' } }}>
              <Box position='relative' width={120} height={120}>
                {/* Box 1 */}

                <ImgStyled
                  src={`${info.avatar}?width=120`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  alt='تصویر پروفایل'
                  crossOrigin='use-credentials'
                />
                {imageLoading && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                  >
                    <CircularProgress color='primary' />
                  </Box>
                )}
              </Box>
              <Box sx={{ marginLeft: { xs: 0, md: 2 }, marginTop: { xs: 2, md: 0 } }}>
                {/* Box 2 */}

                <ButtonStyled
                  component='label'
                  variant='contained'
                  htmlFor='account-settings-upload-image'
                  disabled={imageLoading}
                >
                  تغییر عکس
                  <input
                    hidden
                    type='file'
                    onChange={onChange}
                    accept='image/png, image/jpeg'
                    id='account-settings-upload-image'
                  />
                </ButtonStyled>
                <ResetButtonStyled
                  color='error'
                  variant='outlined'
                  onClick={() => setInfo({ ...info, avatar: account.avatar })}
                >
                  پاک کردن
                </ResetButtonStyled>
                <Typography variant='body2' sx={{ marginTop: 5 }}>
                  فقط عکس با فرمت PNG و یا JPEG با حجم حداکثر 5M مجاز می باشد.
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='شماره موبایل' defaultValue={account.mobile_phone} disabled />
          </Grid>
          {/* <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>نوع کاربر</InputLabel>
              <Select
                label='نوع کاربر'
                // defaultValue={account.role}
                value={info.role}
                onChange={e => {
                  setInfo({ ...info, role: e.target.value as Role })
                }}
                disabled={true}
              >
                {Array.from(RoleMap).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid> */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='نام'
              placeholder=''
              defaultValue={account.first_name}
              value={info.first_name}
              onChange={e => {
                setInfo({ ...info, first_name: e.target.value })
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='نام خانوادگی'
              placeholder=''
              defaultValue={account.last_name}
              value={info.last_name}
              onChange={e => {
                setInfo({ ...info, last_name: e.target.value })
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='email'
              label='آدرس ایمیل'
              placeholder=''
              defaultValue={account.email}
              value={info.email}
              onChange={e => {
                setInfo({ ...info, email: e.target.value })
              }}
              disabled={true}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>وضعیت کاربر</InputLabel>
              <Select label='وضعیت کاربر' defaultValue='active' disabled={true}>
                <MenuItem value='active'>فعال</MenuItem>
                <MenuItem value='inactive'>غیر فعال</MenuItem>
                <MenuItem value='pending'>در انتضار تایید</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {openAlert ? (
            <Grid item xs={12} sx={{ mb: 3 }}>
              <Alert
                severity='warning'
                sx={{ '& a': { fontWeight: 400 } }}
                action={
                  <IconButton size='small' color='inherit' aria-label='close' onClick={() => setOpenAlert(false)}>
                    <Close fontSize='inherit' />
                  </IconButton>
                }
              >
                <AlertTitle>Your email is not confirmed. Please check your inbox.</AlertTitle>
                <Link href='/' onClick={(e: SyntheticEvent) => e.preventDefault()}>
                  Resend Confirmation
                </Link>
              </Alert>
            </Grid>
          ) : null}
        </Grid>
        <Box sx={{ my: 10 }}>
          <Button variant='contained' fullWidth={mdDown} onClick={() => handleSaveAccount()} disabled={imageLoading}>
            ذخیره تغییرات
          </Button>
          <Button
            type='reset'
            fullWidth={mdDown}
            variant='outlined'
            color='secondary'
            onClick={() => handleClearChanges()}
            sx={{ marginTop: { xs: 2, md: 0 }, marginLeft: { xs: 0, md: 2 } }}
          >
            پاک کردن تغییرات
          </Button>
          {imageChanged && (
            <Typography sx={{ mt: 4 }} color='warning'>
              توجه: جهت ذخیره شدن عکس، پس از تغییر آن لطفا دکمه ذخیره تغییرات را فشار دهید.
            </Typography>
          )}
        </Box>
      </form>
    </CardContent>
  )
}

export default TabAccount
