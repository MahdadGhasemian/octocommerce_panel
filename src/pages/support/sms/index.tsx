// ** React Imports
import { ElementType, useState } from 'react'

// ** MUI Imports
import UserSelectOrInput from '@/components/UserSelectOrInput'
import {
  Autocomplete,
  Box,
  Button,
  ButtonProps,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  styled,
  TextField,
  Typography,
  useTheme
} from '@mui/material'

import basicService, { SmsTitleType } from '@/services/basic.service'
import { toastError, toastSuccess } from '@/redux/slices/snackbarSlice'
import { store } from '@/redux/store'
import TableShortMessage from '@/components/tables/TableShortMessage'

// ** Styled components
const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

type SMS = {
  label: string
  title_type: SmsTitleType
  lines: {
    template: string
    templateLables?: string[]
  }[]
}

const SMS_List: SMS[] = [
  // Account =====================================================
  {
    label: 'کد تایید',
    title_type: SmsTitleType.CODE_ACCOUNT_1,
    lines: [
      {
        template: 'کاربر گرامی اُکتو کامرس،'
      },
      {
        template: 'کد تایید شما {0} می باشد.',
        templateLables: ['کد تایید']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'حساب کاربری جدید',
    title_type: SmsTitleType.CODE_ACCOUNT_2,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'یک حساب کاربری جدید با شماره {0} برای شما، در فروشگاه اُکتو کامرس ایجاد گردید.',
        templateLables: ['شماره کاربر']
      },
      {
        template: 'لطفا در صورت مغایرت با شماره {1} تماس حاصل نمایید.',
        templateLables: ['شماره پشتیبانی']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'بازنشانی رمزعبور',
    title_type: SmsTitleType.CODE_ACCOUNT_3,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'درخواست بازنشانی رمز عبور شما ثبت شد.'
      },
      {
        template: 'کد تایید: {0}',
        templateLables: ['کد تایید']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'رمز عبور تغییر داده شد',
    title_type: SmsTitleType.CODE_ACCOUNT_4,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'رمز عبور حساب شما با موفقیت تغییر یافت.'
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'خوش آمد گویی',
    title_type: SmsTitleType.CODE_ACCOUNT_5,
    lines: [
      {
        template: 'اُکتو کامرس:'
      },
      {
        template: 'کاربر گرامی'
      },
      {
        template: 'به اُکتو کامرس خوش آمدید.'
      },
      {
        template: 'شماره پشتیبانی: {0}',
        templateLables: ['شماره پشتیبانی']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },

  // Oreder ======================================================
  {
    label: 'سفارش ثبت شد',
    title_type: SmsTitleType.CODE_ORDER_1,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'سفارش شما با شماره {0} با موفقیت ثبت شد.',
        templateLables: ['شماره سفارش']
      },
      {
        template: 'مبلغ پرداختی: {1} تومان',
        templateLables: ['مبلغ پرداختی']
      },
      {
        template: 'وضعیت سفارش: {2}',
        templateLables: ['وضعیت سفارش']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'سفارش در حال پردازش است',
    title_type: SmsTitleType.CODE_ORDER_2,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'سفارش شما با شماره {0} در حال پردازش است.',
        templateLables: ['شماره سفارش']
      },
      {
        template: 'جهت پیگیری به حساب کاربری خود مراجعه کرده و یا از طریق لینک ذیل روند سفارش خود را مشاهده نمایید.'
      },
      {
        template: 'لینک سفارش: {1}',
        templateLables: ['لینک سفارش']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'سفارش لغو شد',
    title_type: SmsTitleType.CODE_ORDER_3,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'سفارش شما با شماره {0} لغو گردید.',
        templateLables: ['شماره سفارش']
      },
      {
        template: 'در صورت نیاز با پشتیبانی تماس حاصل فرمایید.'
      },
      {
        template: 'شماره پشتیبانی: {1}',
        templateLables: ['شماره پشتیبانی']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'سفارش تایید شد',
    title_type: SmsTitleType.CODE_ORDER_4,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template:
          'سفارش شما با شماره {0} تایید گردید. جهت قطعی نمودن سفارش از طریق لینک ذیل به قسمت سفارش های خود رفته و پرداخت سفارش را تکمیل نمایید.',
        templateLables: ['شماره سفارش']
      },
      {
        template: 'لینک سفارش: {1}',
        templateLables: ['لینک سفارش']
      },
      {
        template: 'در صورت نیاز با پشتیبانی تماس حاصل فرمایید.'
      },
      {
        template: 'شماره پشتیبانی: {2}',
        templateLables: ['شماره پشتیبانی']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'لینک دانلود پیش فاکتور',
    title_type: SmsTitleType.CODE_ORDER_5,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'پیش فاکتور مربوط به سفارش شماره {0} از طریق لینک ذیل، قابل دریافت می باشد.',
        templateLables: ['شماره سفارش']
      },
      {
        template: '{1}',
        templateLables: ['لینک دانلود']
      },
      {
        template: 'در صورت نیاز با پشتیبانی تماس حاصل فرمایید.'
      },
      {
        template: 'شماره پشتیبانی: {2}',
        templateLables: ['شماره پشتیبانی']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'سفارش لغو شد ۲',
    title_type: SmsTitleType.CODE_ORDER_6,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'سفارش شما به شماره {0} به علت "{1}" تایید نگردید.',
        templateLables: ['شماره سفارش', 'دلیل لغو']
      },
      {
        template: 'لطفا جهت پیگیری به حساب کاربری خود مراجعه نمایید.'
      },
      {
        template: 'در صورت نیاز با پشتیبانی تماس حاصل فرمایید.'
      },
      {
        template: 'شماره پشتیبانی: {2}',
        templateLables: ['شماره پشتیبانی']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },

  //  Payment =====================================================
  {
    label: 'تایید پرداخت',
    title_type: SmsTitleType.CODE_PAYMENT_1,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'پرداخت شما با شماره تراکنش {0} به مبلغ {1} تومان با موفقیت انجام شد.',
        templateLables: ['شماره تراکنش', 'مبلغ پرداختی']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'پرداخت با مشکل مواجه شد',
    title_type: SmsTitleType.CODE_PAYMENT_2,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'پرداخت شما به دلیل {0} ناموفق بود. لطفا مجددا تلاش نمایید.',
        templateLables: ['دلیل ناموفق بودن پرداخت']
      },
      {
        template: 'لینک سفارش: {1}',
        templateLables: ['لینک سفارش']
      },
      {
        template: 'در صورت نیاز با پشتیبانی تماس حاصل فرمایید.'
      },
      {
        template: 'شماره پشتیبانی: {2}',
        templateLables: ['شماره پشتیبانی']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'برگشت وجه',
    title_type: SmsTitleType.CODE_PAYMENT_3,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'مبلغ {0} تومان به حساب شما بازگردانده شد. شماره پیگیری: {1}',
        templateLables: ['مبلغ', 'شماره پیگیری']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'پرداخت تایید شد',
    title_type: SmsTitleType.CODE_PAYMENT_4,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'پرداخت مربوط به سفارش شماره {0} تایید گردید.',
        templateLables: ['شماره سفارش']
      },
      {
        template: 'مبلغ باقیمانده تا قطعی شدن سفارش شما، {1} ریال است.',
        templateLables: ['مبلغ باقی مانده']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'پرداخت تایید نشد',
    title_type: SmsTitleType.CODE_PAYMENT_5,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'پرداخت مربوط به سفارش شماره {0} به علت "{1}" تایید نگردید.',
        templateLables: ['شماره سفارش', 'دلیل عدم تایید']
      },
      {
        template: 'لطفا جهت پیگیری به قسمت سفارش های وب سایت مراجعه نمایید.'
      },
      {
        template: 'در صورت نیاز با پشتیبانی تماس حاصل فرمایید.'
      },
      {
        template: 'شماره پشتیبانی: {2}',
        templateLables: ['شماره پشتیبانی']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'پرداخت وجه سفارش کامل شد',
    title_type: SmsTitleType.CODE_PAYMENT_6,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'وجه سفارش شماره {0} به مبلغ {1} ریال به طور کامل دریافت و توسط همکاران ما تایید گردید.',
        templateLables: ['شماره سفارش', 'مبلغ سفارش']
      },
      {
        template: 'از خرید شما سپاسگزاریم.'
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },

  // Delivery ====================================================
  {
    label: 'سفارش پست شد',
    title_type: SmsTitleType.CODE_DELIVERY_1,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'سفارش شما با شماره {0} ارسال گردید.',
        templateLables: ['شماره سفارش']
      },
      {
        template: 'کد پیگیری پست: {1}',
        templateLables: ['کد']
      },
      {
        template: 'لینک مرسوله پستی: {2}',
        templateLables: ['لینک اداره پست']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'سفارش با پیک ارسال شد',
    title_type: SmsTitleType.CODE_DELIVERY_2,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'سفارش شما با شماره {0} ارسال گردید.',
        templateLables: ['شماره سفارش']
      },
      {
        template: 'شماره تماس پیک: {1}',
        templateLables: ['موبایل پیک']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'سفارش ارسال شد (انتخاب نحوه ارسال)',
    title_type: SmsTitleType.CODE_DELIVERY_3,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'سفارش شما با شماره {0} ارسال گردید.',
        templateLables: ['شماره سفارش']
      },
      {
        template: 'شماره پیگیری مرسوله: {1}',
        templateLables: ['شماره پیگیری']
      },
      {
        template: 'نحوه ارسال: {2}',
        templateLables: ['نحوه ارسال']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'سفارش امروز ارسال خواهد شد',
    title_type: SmsTitleType.CODE_DELIVERY_4,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'سفارش شما با شماره {0} امروز به مقصد ارسال خواهد شد.',
        templateLables: ['شماره سفارش']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'سفارش تحویل داده شد',
    title_type: SmsTitleType.CODE_DELIVERY_5,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'سفارش شما با شماره {0} تحویل داده شد.',
        templateLables: ['شماره سفارش']
      },
      {
        template: 'از خرید شما متشکریم.'
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },

  // Promotion ===================================================
  {
    label: 'کد تخفیف',
    title_type: SmsTitleType.CODE_PROMOTION_1,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'بابت {0} کد تخفیف ویژه {1} درصدی برای خریدهای شما فعال شد!',
        templateLables: ['دلیل', 'کد تخفیف']
      },
      {
        template: 'کد تخفیف: {2}',
        templateLables: ['کد تخفیف']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'محصول موجود شد',
    title_type: SmsTitleType.CODE_PROMOTION_2,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'محصول {0} دوباره موجود شد.',
        templateLables: ['نام محصول']
      },
      {
        template: 'جهت خرید به فروشگاه مراجعه فرمایید.'
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },

  // Support =====================================================
  {
    label: 'سبد خرید منتظر تکمیل شدن است (غیر فعال)',
    title_type: SmsTitleType.CODE_SUPPORT_1,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'سبد خرید شما همچنان منتظر تکمیل شدن است.'
      },
      {
        template: 'جهت نهایی کردن سفارش به octocommerce.ir مراجعه کنید.'
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'درخواست پشتیبانی شما ثبت شد',
    title_type: SmsTitleType.CODE_SUPPORT_2,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'درخواست شما با شماره {0} ثبت شد. پشتیبانی در اسرع وقت با شما تماس خواهد گرفت.',
        templateLables: ['شماره درخواست']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'درخواست پشتیبانی شما انجام شد',
    title_type: SmsTitleType.CODE_SUPPORT_3,
    lines: [
      {
        template: 'کاربر گرامی،'
      },
      {
        template: 'درخواست شما با شماره {0} با موفقیت پیگیری و حل شد.',
        templateLables: ['شماره درخواست']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },

  // Internal ====================================================
  {
    label: 'داخلی - سفارش جدید ثبت شد',
    title_type: SmsTitleType.CODE_INTERNAL_1,
    lines: [
      {
        template: 'سفارش جدیدی با شماره {0} توسط کاربر {1} ثبت شد.',
        templateLables: ['شماره سفارش', 'نام کاربر']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'داخلی - پرداخت جدید داریم',
    title_type: SmsTitleType.CODE_INTERNAL_2,
    lines: [
      {
        template: 'سفارش با شماره {0} در درگاه آنلاین پرداخت شد.',
        templateLables: ['شماره سفارش']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  },
  {
    label: 'داخلی - پرداخت جدید با نام بانک',
    title_type: SmsTitleType.CODE_INTERNAL_3,
    lines: [
      {
        template: 'سفارش با شماره {0} در درگاه آنلاین بانک {1} پرداخت شد.',
        templateLables: ['شماره سفارش', 'نام بانک']
      },
      {
        template: 'octocommerce.ir'
      }
    ]
  }
]

const AccountSettings = () => {
  // ** Hook
  const theme = useTheme()

  // ** Store
  const { dispatch } = store

  // ** States
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)
  const [selectedSMS, setSelectedSMS] = useState<SMS | null>(null)
  const [inputs, setInputs] = useState<{ [key: string]: string | number }>({})
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // ** Function
  const handleUserSelect = (user: string | null) => {
    setPhoneNumber(user)
  }

  const handleSend = async () => {
    try {
      if (!selectedSMS?.title_type) return

      setLoading(true)

      const mobile_phone = phoneNumber?.startsWith('0')
        ? `+98${phoneNumber.slice(1)}`
        : phoneNumber?.startsWith('+98')
        ? phoneNumber
        : `+98${phoneNumber}`

      await basicService.sendSupportShortMessage({
        mobile_phone,
        title_type: selectedSMS.title_type,
        text_list: Object.values(inputs).map(_ => _.toString())
      })

      dispatch(toastSuccess('پیامک ارسال شد.'))
      setRefreshKey(key => key + 1)
    } catch (error) {
      const errorMessage = (error as Error).message || 'An unknown error occurred'
      dispatch(toastError('خطای ارسال پیامک از طریق پنل: ' + errorMessage))
    } finally {
      setLoading(false)
    }
  }

  const handleSMSChange = (newValue: SMS | null) => {
    setSelectedSMS(newValue)
    setInputs({})
  }

  const handleInputChange = (index: number, value: string | number) => {
    setInputs(prevInputs => ({
      ...prevInputs,
      [`input${index}`]: value
    }))
  }

  const renderTemplateWithInputs = () => {
    if (!selectedSMS) return null

    const lines = selectedSMS.lines

    return lines?.map((line, lineIndex) => {
      const { template, templateLables } = line
      const placeholders = template.match(/{\d+}/g) || [] // Extract all placeholders like {0}, {1}, etc.

      // Map placeholders to fields with labels or default values
      const parsedFields = placeholders.map((placeholder, index) => ({
        index,
        placeholder,
        label: templateLables?.[index] || `Input ${index + 1}`
      }))

      const textParts: JSX.Element[] = []
      let remainingText = template // Remaining text to process

      // Iterate over placeholders and split the text around them
      placeholders.forEach((placeholder, index) => {
        const placeholderIndex = remainingText.indexOf(placeholder)
        if (placeholderIndex !== -1) {
          // Extract text before the placeholder
          const beforeText = remainingText.slice(0, placeholderIndex)
          if (beforeText) {
            textParts.push(<Typography key={`text-${lineIndex}-${index}`}>{beforeText}</Typography>)
          }

          // Add the input field for the placeholder
          const inputIndex = parseInt(placeholder.replace(/[{}]/g, ''), 10)
          textParts.push(
            <TextField
              key={`input-${lineIndex}-${index}`}
              label={parsedFields.find(field => field.index === inputIndex)?.label || ''}
              value={inputs[`input${inputIndex}`] || ''}
              onChange={e => handleInputChange(inputIndex, e.target.value)}
            />
          )

          // Remove processed part (up to and including the placeholder)
          remainingText = remainingText.slice(placeholderIndex + placeholder.length)
        }
      })

      // Add any remaining text after the last placeholder
      if (remainingText) {
        textParts.push(<Typography key={`text-end-${lineIndex}`}>{remainingText}</Typography>)
      }

      return (
        <Grid item xs={12} key={`line-${lineIndex}`}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'start',
              gap: 4
            }}
          >
            {textParts}
          </Box>
        </Grid>
      )
    })
  }

  return (
    <Box>
      <Card sx={{ padding: 10 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <UserSelectOrInput onChange={user => handleUserSelect(user)} label='کاربر یا شماره موبایل' />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                id='choosing-a-sms-model-id'
                options={SMS_List}
                value={selectedSMS}
                getOptionLabel={option => option?.label}
                isOptionEqualToValue={(option, value) => option?.title_type === value?.title_type}
                noOptionsText={'هیچ آیتمی موجود نیست'}
                renderInput={params => <TextField {...params} label='نوع پیامک' />}
                onChange={(_, value) => handleSMSChange(value)}
                renderOption={(props, item) => (
                  <Box
                    component='li'
                    {...props}
                    key={item.title_type}
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: theme => theme.palette.divider
                      }
                    }}
                    gap={1}
                  >
                    <Typography>{item.label}</Typography>
                  </Box>
                )}
              />
            </Grid>
          </Grid>

          <Box
            sx={{
              borderRadius: '8px',
              boxShadow: 3,
              padding: loading ? 3 : 10,
              border: 1,
              borderColor: theme.palette.secondary.light,
              marginTop: 10,
              display: loading ? 'block' : 'flex',
              justifyContent: loading ? 'center' : 'start'
            }}
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <Box>
                <Grid container spacing={4}>
                  {renderTemplateWithInputs()}
                </Grid>

                <ButtonStyled
                  variant='outlined'
                  color='success'
                  size='large'
                  sx={{ marginTop: 10 }}
                  onClick={() => handleSend()}
                >
                  ارسال
                </ButtonStyled>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      <TableShortMessage refreshKey={refreshKey} />
    </Box>
  )
}

export default AccountSettings
