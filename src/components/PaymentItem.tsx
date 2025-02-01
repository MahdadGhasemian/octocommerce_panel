// ** React Imports
import { ChangeEvent, forwardRef, useState } from 'react'

// ** MUI Imports
import {
  Box,
  Button,
  ButtonProps,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CardProps,
  Chip,
  FormControlLabel,
  Grid,
  InputAdornment,
  Link,
  Radio,
  RadioGroup,
  TextField,
  styled,
  useMediaQuery,
  useTheme
} from '@mui/material'

// ** Icons Imports
import {  PlusThick } from 'mdi-material-ui'

// ** Services Import
import BasicService, { Payment, PaymentType } from '@/services/basic.service'
import { toastError, toastSuccess } from '@/redux/slices/snackbarSlice'

// ** Redux Imports
import { useSelector } from 'react-redux'
import { store } from '@/redux/store'
import { PaymentStatus } from '@/services/basic.service'
import { isCustomerUser } from '@/redux/slices/authSlice'

// ** Services Import
import StorageService from '@/services/storage.service'
import { hexToRGBA } from '@/utils/hex-to-rgba'

// ** Component Imports
import SetStatus from './SetStatus'
import { NumericFormat, NumericFormatProps } from 'react-number-format'

// ** Map Types Imports
import { PaymentTypeMap } from '@/map-types'

const ButtonStyled = styled(Button)<ButtonProps & { htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const RadioStyled = styled(Radio)(({ theme }) => ({
  '&.Mui-disabled': {
    color: theme.palette.text.primary
  }
}))

interface CardStyledProps {
  payment_status: PaymentStatus
}
const CardStyled = styled(Card)<CardProps & CardStyledProps>(({ theme, payment_status }) => ({
  boxShadow: `0 0 0 3px ${hexToRGBA(
    payment_status === PaymentStatus.Confirmed
      ? theme.palette.info.main
      : payment_status === PaymentStatus.Rejected
      ? theme.palette.error.main
      : theme.palette.secondary.main,

    0.12
  )}`
}))

const paymentTypeValues = Object.values(PaymentType)

const checkIsImageType = (url?: string): boolean => {
  const match = url?.match(/\.([a-zA-Z0-9]+)(\?.*)?$/)

  if (match && match[1]) {
    if (['png', 'jpeg', 'jpg'].includes(match[1])) return true
  }

  return false
}

export type Props = {
  order_id: number
  user_id: number
  item: Payment
  onCreated?: (payment: Payment) => void
  onConfirmOrRejectPayment?: (status: PaymentStatus) => void
}

interface NumericFormatCustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void
  name: string
}

const NumericFormatCustom = forwardRef<NumericFormatProps, NumericFormatCustomProps>(function NumericFormatCustom(
  props,
  ref
) {
  const { onChange, ...other } = props

  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      onValueChange={values => {
        onChange({
          target: {
            name: props.name,
            value: values.value
          }
        })
      }}
      thousandSeparator
      valueIsNumericString
      prefix=''
    />
  )
})

const PaymentItem = (props: Props) => {
  // ** Props
  const { order_id, item, user_id, onCreated, onConfirmOrRejectPayment } = props

  // ** Hook
  const theme = useTheme()

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  // ** Global State
  const isUser = useSelector(isCustomerUser)

  // ** States
  const [amount, setAmount] = useState<number | string>(item?.amount || 0)
  const [paymentType, setPaymentType] = useState(item?.payment_type || PaymentType.RECEIPT)
  const [paymentStatus, setPaymentStatus] = useState(item?.payment_status || PaymentStatus.Pending)
  const [attachUrl, setAttachUrl] = useState<string>(item?.attach_url || '')
  const [isImageType, setIsImageType] = useState<boolean>(checkIsImageType(item?.attach_url))
  const [description, setDescription] = useState<string>(item?.description || '')
  const [isCreated, setIsCreated] = useState<boolean>(false)
  const [rejectedNote, setRejectNote] = useState<string>()

  // const attachType = attachUrl

  const { dispatch } = store

  const handleSendItem = async () => {
    try {
      if (!attachUrl) {
        return dispatch(toastError('لطفا فایل رسید پرداخت را ابتدا ارسال کنید'))
      }

      const paymentData = {
        order_id,
        amount: Number(amount),
        payment_type: paymentType,
        description,
        attach_url: attachUrl
      }
      const payment = await BasicService.createPaymentForOtherUser({ ...paymentData, user_id })

      setIsCreated(true)
      if (onCreated) onCreated(payment)

      dispatch(toastSuccess('رسید پرداخت برای این سفارش ثبت گردید.'))
    } catch (error) {}
  }

  const handleConfirmOrRejectPayment = async (status: PaymentStatus.Confirmed | PaymentStatus.Rejected) => {
    try {
      if (!isUser && item?.id && paymentStatus === PaymentStatus.Pending) {
        if (status === PaymentStatus.Confirmed) {
          await BasicService.confrimPayment(item.id)
          dispatch(toastSuccess('رسید پرداخت با موفقیت تایید گردید.'))
        } else {
          await BasicService.rejectPayment(item.id, rejectedNote)
          dispatch(toastSuccess('رسید پرداخت رد شد.'))
        }
        setPaymentStatus(status)
        if (onConfirmOrRejectPayment) onConfirmOrRejectPayment(status)
      }
    } catch (error) {}
  }

  const handleImageOnChange = async (file: ChangeEvent) => {
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      const file = files[0]

      if (file) {
        try {
          const result = await StorageService.accessUploadFile(file)
          const url = result.url

          setIsImageType(checkIsImageType(url))
          setAttachUrl(url)
        } catch (error) {}
      }
    }
  }

  const handlePaymentTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const paymentType = event.target.value as PaymentType
    setPaymentType(paymentType)
  }

  const paymentTypeRadioGroup = paymentTypeValues.map(value => (
    <FormControlLabel
      key={value}
      value={value}
      control={<RadioStyled disabled={!!item?.id || !!isCreated} />}
      label={PaymentTypeMap.get(value)}
      disabled={value === PaymentType.ONLINE}
    />
  ))

  return (
    <CardStyled payment_status={paymentStatus}>
      {isImageType &&
        (attachUrl ? (
          <Link href={attachUrl}>
            <CardMedia
              sx={{ height: '10.5625rem' }}
              component='img'
              image={`${attachUrl}?width=320`}
              crossOrigin='use-credentials'
            />
          </Link>
        ) : (
          <CardMedia
            sx={{ height: '10.5625rem' }}
            component='img'
            image={`${attachUrl}?width=320`}
            crossOrigin='use-credentials'
          />
        ))}

      {!isImageType && attachUrl && (
        <Box display='flex' alignItems='center' justifyContent='center' sx={{ height: '10.5625rem' }}>
          <a href={attachUrl} target='_blank' rel='noopener noreferrer'>
            فایل
          </a>
        </Box>
      )}

      <CardContent sx={{ marginTop: 2, padding: 2 }}>
        {!item.id && !isCreated && (
          <ButtonStyled
            sx={{ marginTop: 4, marginBottom: 6 }}
            component='label'
            variant='outlined'
            color='info'
            fullWidth
          >
            ارسال رسید پرداخت
            <input
              hidden
              type='file'
              onChange={handleImageOnChange}
              accept='image/png, image/jpeg, image/jpg, application/pdf, .doc, .docx'
            />
          </ButtonStyled>
        )}

        <TextField
          fullWidth
          label='مبلغ'
          defaultValue={item.amount}
          InputLabelProps={{
            shrink: true
          }}
          InputProps={{
            inputProps: { min: 0 },
            startAdornment: (
              <InputAdornment position='start'>
                {/* <CurrencyRial /> */}
                {'تومان'}
              </InputAdornment>
            ),
            readOnly: !!item?.id || !!isCreated,
            inputComponent: NumericFormatCustom as any
          }}
          onChange={e => setAmount(e.target.value)}
        />

        <TextField
          fullWidth
          label='توضیح'
          defaultValue={item.description}
          InputLabelProps={{
            shrink: true
          }}
          InputProps={{
            inputProps: { min: 0 },
            readOnly: !!item?.id || !!isCreated
          }}
          onChange={e => setDescription(e.target.value)}
          sx={{ marginTop: 4 }}
        />

        <RadioGroup row value={paymentType} onChange={handlePaymentTypeChange}>
          {paymentTypeRadioGroup}
        </RadioGroup>
      </CardContent>

      <CardActions sx={{ marginTop: 1, padding: 2 }}>
        {item.id || isCreated ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {/*  */}
              {paymentStatus === PaymentStatus.Confirmed && (
                <Chip
                  label={
                    isUser || isSmallScreen || !item.confirmed_rejected_by ? (
                      <span>تایید شد </span>
                    ) : (
                      <>
                        <span>تایید شده توسط :</span>
                        {item.confirmed_rejected_by?.first_name}
                      </>
                    )
                  }
                  color='info'
                />
              )}

              {/*  */}
              {paymentStatus === PaymentStatus.Rejected && (
                <Chip
                  label={
                    !item?.rejected_note ? (
                      <span>رد شد</span>
                    ) : (
                      <>
                        <span>علت عدم تایید :</span>
                        {item?.rejected_note}
                      </>
                    )
                  }
                  color='error'
                />
              )}

              {/*  */}
              {isUser && paymentStatus === PaymentStatus.Pending && <Chip label='در انتظار تایید' color='secondary' />}

              {/*  */}
              {!isUser && paymentStatus === PaymentStatus.Pending && (
                <SetStatus
                  confirmedValue={PaymentStatus.Confirmed}
                  rejectedValue={PaymentStatus.Rejected}
                  handleConfirmOrReject={handleConfirmOrRejectPayment}
                  setRejectNote={setRejectNote}
                />
              )}
            </Grid>
          </Grid>
        ) : (
          <Button color='success' variant='contained' fullWidth onClick={() => handleSendItem()}>
            {!isSmallScreen ? <span>ارسال و ثبت</span> : <></>}
            <PlusThick />
          </Button>
        )}
      </CardActions>
    </CardStyled>
  )
}

export default PaymentItem
