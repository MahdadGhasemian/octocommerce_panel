// ** React Imports
import { ChangeEvent, useEffect, useState } from 'react'

// ** MUI Imports
import { Radio, CardContent, Grid, RadioGroup, TextField, Card } from '@mui/material'
import MuiFormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel'

// ** MUI Imports
import { styled } from '@mui/material/styles'

// ** Services Import
import { Delivery, DeliveryType, Order } from '@/services/basic.service'

// ** Import Component
import Empty from '../Empty'
import MapLink from '../map/MapLink'

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

export type Props = {
  order: Order
  isSmallScreen: boolean
}

const TabDelivery = (props: Props) => {
  // ** Props
  const { order, isSmallScreen } = props

  // ** State
  const [delivery, setDelivery] = useState<Partial<Delivery>>()

  // ** Vars
  const thereIsDeliveryData: boolean = delivery?.id ? true : false

  const deliveryTypeRadioGroup = deliveryTypeValues.map(value => (
    <FormControlLabel key={value} value={value} control={<RadioStyled disabled />} label={DeliveryTypeMap.get(value)} />
  ))

  const handleChange = (prop: keyof Delivery) => (event: ChangeEvent<HTMLInputElement>) => {
    setDelivery({ ...delivery, [prop]: event.target.value })
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
              <Grid container spacing={4}>
                <Grid item xs={12} sm={12}>
                  <RadioGroup row value={delivery?.delivery_type} onChange={handleChange('delivery_type')}>
                    {deliveryTypeRadioGroup}
                  </RadioGroup>
                </Grid>
                {/* City */}
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label='شهر' value={delivery?.delivery_city} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} sm={9}></Grid>
                {/* Address */}
                <Grid item xs={12} sm={9}>
                  <TextField
                    fullWidth
                    label='نشانی تحویل'
                    value={delivery?.delivery_address}
                    InputProps={{ readOnly: true }}
                    multiline
                  />
                </Grid>
                {/* Postal Code */}
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label='کد پستی'
                    value={delivery?.delivery_postal_code}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                {/* Recipient Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='نام تحویل گیرنده'
                    value={delivery?.recipient_name}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                {/* Recipient National Id */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='کد ملی تحویل گیرنده'
                    value={delivery?.recipient_national_id}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                {/* Recipient Phone Number */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='شماره موبایل تحویل گیرنده'
                    value={delivery?.recipient_mobile_phone_number}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                {/* Recipient Phone Number */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='شماره تلفن تحویل گیرنده'
                    value={delivery.recipient_phone_number}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                {/* License Plate */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='نام راننده'
                    value={delivery?.driver_name}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                {/* License Plate */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='شماره موبایل راننده'
                    value={delivery?.driver_phone_number}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                {/* License Plate */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='شماره پلاک خودرو'
                    value={delivery?.car_license_plate}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                {/* Note */}
                <Grid item xs={12}>
                  <TextField fullWidth label='یادداشت' InputProps={{ readOnly: true }} />
                </Grid>

                {/* Map */}
                {delivery?.delivery_latitude && delivery.delivery_longitude && (
                  <Grid item xs={12}>
                    <MapLink lat={delivery.delivery_latitude} lng={delivery.delivery_longitude} />
                  </Grid>
                )}
              </Grid>
            </form>
          ) : (
            <Empty message='هنوز اطلاعات حمل و نقل بارگذاری نشده است.' />
          )}
        </CardContent>
      </Card>
    </CardContent>
  )
}

export default TabDelivery
