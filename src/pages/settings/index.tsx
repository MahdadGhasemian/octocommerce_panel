// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import { Grid, TextField, CardContent, Button, Box, Card } from '@mui/material'

// ** Redux Imports
import { toastError, toastSuccess } from '@/redux/slices/snackbarSlice'
import { store } from '@/redux/store'

// ** Services Import
import BasicService, { Setting } from '@/services/basic.service'

// ** Comnfirmation Import
import { useConfirmation } from '@/context/confirmationContext'

const Settings = () => {
  // ** State
  const [setting, setSetting] = useState<Setting>({
    invoice_number_pre_part: 1,
    invoice_number_multiple: 1,
    tax_rate_default: 0,
    base_price_scale_amount: 0,
    delivery_center_latitude: 35.7172,
    delivery_center_longitude: 51.3995,
    product_code_prefix: ''
  })

  // ** Confirm
  const { confirm } = useConfirmation()

  const { dispatch } = store

  const handleSaveAccount = async (event: { preventDefault: () => void }) => {
    event.preventDefault()

    try {
      if (setting) {
        const result = await BasicService.editSetting({
          invoice_number_pre_part: Number(setting?.invoice_number_pre_part || 1),
          invoice_number_multiple: Number(setting?.invoice_number_multiple || 1),
          tax_rate_default: Number(setting?.tax_rate_default || 0),
          base_price_scale_amount: Number(setting?.base_price_scale_amount || 0),
          delivery_center_latitude: Number(setting?.delivery_center_latitude || 0),
          delivery_center_longitude: Number(setting?.delivery_center_longitude || 0),
          product_code_prefix: setting?.product_code_prefix
        })
        setSetting(result)

        dispatch(toastSuccess('تغییرات با موفقیت ذخیره شد.'))
      }
    } catch (error) {
      dispatch(toastError('مشکل در ذخیره تغییرات به وجود آمده!'))
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const setting = await BasicService.getAllSetting()
      setSetting(setting)
    }

    fetchData()
  }, [])

  const handleUpdateProductSalePrice = useCallback(async (base_price_scale_amount: number) => {
    confirm({
      isGeneral: true,
      title: 'تایید بروزرسانی قیمت ها',
      text: 'با تایید این پیغام، قیمت تمام محصولات براساس قیمت یوان چین که در تنظیمات تنظیم شده است و ضریب قیمت که در محصولات تعریف شده اند بروزرسانی خواهند شد.',
      rejectButtonText: `بله اطلاع دارم که پس از تغییر امکان بازگشت قیمت ها نخواهد بود. همچنین قیمت یوان چین مقدار ${base_price_scale_amount} تومان تنظیم شده است`
    })
      .then(async () => {
        try {
          const result = await BasicService.updateAllProductsPricewithScale()

          dispatch(toastSuccess(`با موفقیت تعداد ${result?.affected} کالا بروزرسانی شدند.`))
        } catch (error) {
          dispatch(toastError('مشکلی در بروزرسانی قیمت تمام محصولات ایجاد شد!'))
        }
      })
      .catch()
  }, [])

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'start', flexDirection: { xs: 'column', md: 'row' }, gap: 8 }}>
          <form>
            <Box justifyContent={'center'} marginX={'auto'}>
              <Grid container spacing={7}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='پیشوند سال شماره سفارش'
                    placeholder=''
                    defaultValue={setting?.invoice_number_pre_part}
                    value={setting?.invoice_number_pre_part}
                    onChange={e => {
                      setSetting({ ...setting, invoice_number_pre_part: Number(e.target.value) })
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='مرتبه سال شماره سفارش'
                    placeholder=''
                    defaultValue={setting?.invoice_number_multiple}
                    value={setting?.invoice_number_multiple}
                    onChange={e => {
                      setSetting({ ...setting, invoice_number_multiple: Number(e.target.value) })
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='نرخ مالیات'
                    placeholder=''
                    defaultValue={setting?.tax_rate_default}
                    value={setting?.tax_rate_default}
                    onChange={e => {
                      setSetting({ ...setting, tax_rate_default: Number(e.target.value) })
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='قیمت یوان چین به تومان'
                    placeholder=''
                    defaultValue={setting?.base_price_scale_amount}
                    value={setting?.base_price_scale_amount}
                    onChange={e => {
                      setSetting({ ...setting, base_price_scale_amount: Number(e.target.value) })
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='عرض جغرافیای مرکز تحویل (Latitude)'
                    placeholder=''
                    defaultValue={setting?.delivery_center_latitude}
                    value={setting?.delivery_center_latitude}
                    onChange={e => {
                      setSetting({ ...setting, delivery_center_latitude: Number(e.target.value) })
                    }}
                    InputLabelProps={{
                      shrink: true
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='طول جغرافیای مرکز تحویل (Longitude)'
                    placeholder=''
                    defaultValue={setting?.delivery_center_longitude}
                    value={setting?.delivery_center_longitude}
                    onChange={e => {
                      setSetting({ ...setting, delivery_center_longitude: Number(e.target.value) })
                    }}
                    InputLabelProps={{
                      shrink: true
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='پیشوند کد کالا'
                    placeholder=''
                    defaultValue={setting?.product_code_prefix}
                    value={setting?.product_code_prefix}
                    onChange={e => {
                      setSetting({ ...setting, product_code_prefix: e.target.value })
                    }}
                    dir='ltr'
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant='contained' fullWidth onClick={handleSaveAccount}>
                    ذخیره
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </form>
          <Button
            color='error'
            variant='outlined'
            fullWidth
            onClick={() => handleUpdateProductSalePrice(setting.base_price_scale_amount)}
          >
            بروزرسانی قیمت تمام کالا ها بر اساس قیمت یوان چین
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default Settings
