// ** React Imports
import { ChangeEvent, useEffect, useState } from 'react'

// ** MUI Imports
import { Radio, Button, CardContent, Grid, RadioGroup, TextField, Card } from '@mui/material'
import MuiFormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel'

// ** MUI Imports
import { styled } from '@mui/material/styles'

// ** Services Import
import BasicService, { Delivery, DeliveryStatus, DeliveryType, Order } from '@/services/basic.service'

// ** Redux Imports
import { useSelector } from 'react-redux'
import { store } from '@/redux/store'
import { PaymentStatus } from '@/services/basic.service'
import { isCustomerUser } from '@/redux/slices/authSlice'
import { toastInfo, toastSuccess } from '@/redux/slices/snackbarSlice'

// ** Import Component
import Empty from '@/components/Empty'
import SetStatus from '@/components/SetStatus'

// ** Map Types Imports
import { DeliveryTypeMap } from '@/map-types'

const RadioStyled = styled(Radio)(({ theme }) => ({
  '&.Mui-disabled': {
    color: theme.palette.text.primary
  }
}))

const FormControlLabel = styled(MuiFormControlLabel)<FormControlLabelProps>(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  marginBottom: theme.spacing(4),
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))

const deliveryTypeValues = Object.values(DeliveryType)

type DeliveryError<T> = {
  [K in keyof T]: boolean
}
type DeliveryErrorType = DeliveryError<Delivery>

export type Props = {
  order: Order
  isSmallScreen: boolean
}

const DeliveryManage = (props: Props) => {
  // ** Props
  const { order, isSmallScreen } = props

  // ** Global State
  const isUser = useSelector(isCustomerUser)

  // ** State
  const [delivery, setDelivery] = useState<Partial<Delivery>>()
  const [deliveryError, setDeliveryError] = useState<Partial<DeliveryErrorType>>()
  const [rejectedNote, setRejectNote] = useState<string>()

  // ** Vars
  const thereIsDeliveryData: boolean = delivery?.id ? true : false
  const deliveryIsPending = delivery?.delivery_status === DeliveryStatus.Pending
  const deliveryIsRejected = delivery?.delivery_status === DeliveryStatus.Rejected
  const readOnly = true

  const { dispatch } = store

  const deliveryTypeRadioGroup = deliveryTypeValues.map(value => (
    <FormControlLabel
      key={value}
      value={value}
      control={<RadioStyled disabled={readOnly} />}
      label={DeliveryTypeMap.get(value)}
    />
  ))

  const handleChange = (prop: keyof Delivery) => (event: ChangeEvent<HTMLInputElement>) => {
    setDelivery({ ...delivery, [prop]: event.target.value })
  }

  const handleConfirmOrRejectDelivery = async (status: DeliveryStatus.Confirmed | PaymentStatus.Rejected) => {
    try {
      if (!isUser && order?.id && deliveryIsPending) {
        if (status === DeliveryStatus.Confirmed) {
          const delivery_result = await BasicService.confirmDelivery(order.id, Number(delivery?.id))
          setDelivery(delivery_result)
          dispatch(toastSuccess('مشخصات حمل و نقل با موفقیت تایید گردید.'))
        } else {
          const delivery_result = await BasicService.rejectDelivery(order.id, Number(delivery?.id), rejectedNote)
          setDelivery(delivery_result)
          dispatch(toastSuccess('مشخصات حمل و نقل رد شد.'))
        }
      }
    } catch (error) {}
  }

  const checkFormErrors = (): boolean => {
    if (delivery?.delivery_type === DeliveryType.RIDER) {
      setDeliveryError({
        ...deliveryError,
        delivery_address: !delivery.delivery_address,
        delivery_postal_code: !delivery.delivery_postal_code,
        recipient_name: !delivery.recipient_name,
        recipient_national_id: !delivery.recipient_national_id,
        recipient_phone_number: !delivery.recipient_phone_number,
        recipient_mobile_phone_number: !delivery.recipient_mobile_phone_number
      })

      if (
        !delivery.delivery_address ||
        !delivery.delivery_postal_code ||
        !delivery.recipient_name ||
        !delivery.recipient_national_id ||
        !delivery.recipient_phone_number ||
        !delivery.recipient_mobile_phone_number
      )
        return true
    } else if (delivery?.delivery_type === DeliveryType.SELF_PICKUP) {
      setDeliveryError({
        ...deliveryError,
        recipient_name: !delivery.recipient_name,
        recipient_national_id: !delivery.recipient_national_id,
        recipient_mobile_phone_number: !delivery.recipient_mobile_phone_number,
        car_license_plate: !delivery?.car_license_plate
      })

      if (
        !delivery.recipient_name ||
        !delivery.recipient_national_id ||
        !delivery.recipient_mobile_phone_number ||
        !delivery.car_license_plate
      )
        return true
    }

    return false
  }

  const handleSave = async () => {
    const error = checkFormErrors()

    if (error) return

    if (!delivery) return

    try {
      const delivery_result = await BasicService.createDelivery(order.id, delivery as Delivery)

      setDelivery(delivery_result)

      dispatch(toastInfo('مشخصات حمل و نقل با موفقیت ذخیره شد.'))
    } catch (error) {}
  }

  const handleEdit = async () => {
    const error = checkFormErrors()

    if (error) return

    if (!delivery) return

    try {
      const delivery_result = await BasicService.editDelivery(order.id, Number(delivery?.id), delivery as Delivery)

      setDelivery(delivery_result)

      dispatch(toastInfo('مشخصات حمل و نقل با موفقیت ذخیره شد.'))
    } catch (error) {}
  }

  useEffect(() => {
    if (order && order?.delivery) {
      setDelivery({ ...order.delivery, delivery_type: order.delivery?.delivery_type || DeliveryType.RIDER })
    } else {
      setDelivery({ delivery_type: DeliveryType.RIDER })
    }
  }, [order])

  if (!delivery) {
    return <div></div>
  }

  return (
    <CardContent sx={{ padding: isSmallScreen ? 1 : 5 }}>
      <Card sx={{ paddingBottom: 10, paddingTop: 5 }}>
        <CardContent>
          {thereIsDeliveryData ? (
            <form>
              <Grid container spacing={7}>
                <Grid item xs={12} sm={12}>
                  <RadioGroup row value={delivery?.delivery_type} onChange={handleChange('delivery_type')}>
                    {deliveryTypeRadioGroup}
                  </RadioGroup>
                </Grid>
                {/* Address */}
                <Grid item xs={12} sm={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label='نشانی تحویل'
                    value={delivery.delivery_address}
                    onChange={handleChange('delivery_address')}
                    error={deliveryError?.delivery_address}
                    helperText={deliveryError?.delivery_address && 'این آیتم ضروری می باشد.'}
                    InputProps={{
                      readOnly: readOnly
                    }}
                  />
                </Grid>
                {/* Postal Code */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='کد پستی'
                    value={delivery.delivery_postal_code}
                    onChange={handleChange('delivery_postal_code')}
                    error={deliveryError?.delivery_postal_code}
                    helperText={deliveryError?.delivery_postal_code && 'این آیتم ضروری می باشد.'}
                    InputProps={{
                      readOnly: readOnly
                    }}
                  />
                </Grid>
                {/* Recipient Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='نام تحویل گیرنده'
                    value={delivery?.recipient_name}
                    onChange={handleChange('recipient_name')}
                    error={deliveryError?.recipient_name}
                    helperText={deliveryError?.recipient_name && 'این آیتم ضروری می باشد.'}
                    InputProps={{
                      readOnly: readOnly
                    }}
                  />
                </Grid>
                {/* Recipient National Id */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='کد ملی تحویل گیرنده'
                    value={delivery?.recipient_national_id}
                    onChange={handleChange('recipient_national_id')}
                    error={deliveryError?.recipient_national_id}
                    helperText={deliveryError?.recipient_national_id && 'این آیتم ضروری می باشد.'}
                    InputProps={{
                      readOnly: readOnly
                    }}
                  />
                </Grid>
                {/* Recipient Phone Number */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='شماره موبایل تحویل گیرنده'
                    value={delivery?.recipient_mobile_phone_number}
                    onChange={handleChange('recipient_mobile_phone_number')}
                    error={deliveryError?.recipient_mobile_phone_number}
                    helperText={deliveryError?.recipient_mobile_phone_number && 'این آیتم ضروری می باشد.'}
                    InputProps={{
                      readOnly: readOnly
                    }}
                  />
                </Grid>
                {/* License Plate */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='شماره پلاک'
                    value={delivery?.car_license_plate}
                    onChange={handleChange('car_license_plate')}
                    error={deliveryError?.car_license_plate}
                    helperText={deliveryError?.car_license_plate && 'این آیتم ضروری می باشد.'}
                    InputProps={{
                      readOnly: readOnly
                    }}
                  />
                </Grid>
                {/* Recipient Phone Number */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='شماره تلفن'
                    value={delivery.recipient_phone_number}
                    onChange={handleChange('recipient_phone_number')}
                    error={deliveryError?.recipient_phone_number}
                    helperText={deliveryError?.recipient_phone_number && 'این آیتم ضروری می باشد.'}
                    InputProps={{
                      readOnly: readOnly
                    }}
                  />
                </Grid>
                {/* Note */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='یادداشت'
                    multiline
                    minRows={2}
                    value={delivery?.delivery_note}
                    onChange={handleChange('delivery_note')}
                    InputProps={{
                      readOnly: readOnly
                    }}
                  />
                </Grid>

                {delivery?.rejected_note && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='علت عدم تایید'
                      value={delivery?.rejected_note}
                      InputProps={{
                        readOnly: true
                      }}
                      error
                    />
                  </Grid>
                )}
                {isUser && !readOnly && !deliveryIsRejected && (
                  <Grid item xs={2}>
                    <Button
                      fullWidth={isSmallScreen}
                      size='large'
                      variant='contained'
                      sx={{ marginRight: 3.5 }}
                      onClick={() => handleSave()}
                      disabled={delivery.delivery_type === DeliveryType.SELF_PICKUP}
                    >
                      ذخیره
                    </Button>
                  </Grid>
                )}
                {isUser && deliveryIsRejected && (
                  <Grid item xs={3}>
                    <Button
                      fullWidth={isSmallScreen}
                      size='large'
                      variant='contained'
                      sx={{ marginRight: 3.5 }}
                      onClick={() => handleEdit()}
                    >
                      اصلاح و ارسال مجدد
                    </Button>
                  </Grid>
                )}

                {!isUser && deliveryIsPending && (
                  <Grid item xs={4}>
                    <SetStatus
                      confirmedValue={PaymentStatus.Confirmed}
                      rejectedValue={PaymentStatus.Rejected}
                      handleConfirmOrReject={handleConfirmOrRejectDelivery}
                      setRejectNote={setRejectNote}
                    />
                  </Grid>
                )}
              </Grid>
            </form>
          ) : (
            <Empty message='کاربر هنوز اطلاعات حمل و نقل را بارگذاری نکرده است.' />
          )}
        </CardContent>
      </Card>
    </CardContent>
  )
}

export default DeliveryManage
