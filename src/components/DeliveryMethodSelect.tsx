// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import { Autocomplete, Box, CircularProgress, Stack, TextField, Typography } from '@mui/material'

// ** Services Import
import basicService, { DeliveryMethod, DeliveryMethodAreaRule, DeliveryPricingType } from '@/services/basic.service'

// ** Redux Imports
import { store } from '@/redux/store'
import {
  selectDeliveryMethod,
  selectDeliveryMethodAreaRule,
  setDeliveryMethodAreaRuleSelected,
  setDeliveryMethodSelected
} from '@/redux/slices/cartSlice'
import { useSelector } from 'react-redux'

// ** Map Types Imports
import { DeliveryTypeMap } from '@/map-types'

const DeliveryMethodSelect = () => {
  // ** States
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')

  // ** Store
  const { dispatch } = store
  const deliveryMethod = useSelector(selectDeliveryMethod)
  const deliveryMethodAreaRule = useSelector(selectDeliveryMethodAreaRule)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const sorting = [
        {
          id: 'id',
          desc: false
        }
      ]
      const filters = [{ id: 'is_enabled', value: true, operator: '$eq' }]
      const response = await basicService.getAllDeliveryMethod(10, 1, inputValue, filters, sorting)
      setDeliveryMethods(
        response.data?.map(item => {
          return {
            ...item,
            fixed_price: Number(item.fixed_price || 0),
            delivery_method_area_rules: item?.delivery_method_area_rules
              ?.map(area => {
                return {
                  ...area,
                  price: Number(area.price || 0)
                }
              })
              ?.sort((a: DeliveryMethodAreaRule, b: DeliveryMethodAreaRule) => {
                return a.area_name.localeCompare(b.area_name)
              })
          }
        }) || []
      )
      setLoading(false)
    }

    fetchData()
  }, [inputValue])

  // Handle DeliveryMethod method selection

  const handleDeliveryMethodSelect = (deliveryMethod: DeliveryMethod | null) => {
    if (!deliveryMethod) return

    dispatch(setDeliveryMethodSelected(deliveryMethod))

    if (
      deliveryMethod.delivery_pricing_type === DeliveryPricingType.SELECTED_AREA &&
      deliveryMethod.delivery_method_area_rules?.length
    ) {
      const areaRule = deliveryMethod.delivery_method_area_rules[0]
      dispatch(setDeliveryMethodAreaRuleSelected(areaRule))
    }
  }

  // Handle area rule selection
  const handleAreaRuleSelect = (areaRule: DeliveryMethodAreaRule | null) => {
    if (!areaRule) return

    dispatch(setDeliveryMethodAreaRuleSelected(areaRule))
  }

  return (
    <Stack direction='row' spacing={2}>
      <Autocomplete
        value={deliveryMethod}
        options={deliveryMethods}
        getOptionLabel={deliveryMethod =>
          `${DeliveryTypeMap.get(deliveryMethod.delivery_type)} - ${deliveryMethod.description}`
        }
        isOptionEqualToValue={(option, value) => option.id === value.id}
        noOptionsText={'هیچ آیتمی موجود نیست'}
        loadingText='در حال بارگذاری...'
        renderOption={(props, deliveryMethod) => (
          <Box
            component='li'
            {...props}
            key={deliveryMethod.id}
            sx={{
              '&:nth-of-type(odd)': {
                backgroundColor: theme => theme.palette.divider
              }
            }}
            gap={1}
          >
            <>
              <Typography>{DeliveryTypeMap.get(deliveryMethod.delivery_type)}</Typography>-
              <Typography
                sx={{
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '0.85rem !important'
                }}
              >
                {deliveryMethod.description}
              </Typography>
            </>
          </Box>
        )}
        renderInput={params => (
          <TextField
            {...params}
            label='روش ارسال'
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
        onInputChange={(_, value) => setInputValue(value)}
        onChange={(_, value) => handleDeliveryMethodSelect(value)}
        loading={loading}
        fullWidth
      />
      {deliveryMethod?.delivery_pricing_type === DeliveryPricingType.SELECTED_AREA &&
        deliveryMethod?.delivery_method_area_rules && (
          <Autocomplete
            value={deliveryMethodAreaRule}
            options={deliveryMethod.delivery_method_area_rules}
            getOptionLabel={areaRule => `${areaRule.area_name} - ${areaRule.price} تومان`}
            isOptionEqualToValue={(option, value) => option.area_name === value.area_name}
            noOptionsText={'هیچ آیتمی موجود نیست'}
            loadingText='در حال بارگذاری...'
            renderOption={(props, areaRule, index) => (
              <Box
                component='li'
                {...props}
                key={`area-item-${areaRule.area_name}-${index}`}
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: theme => theme.palette.divider
                  }
                }}
                gap={1}
              >
                <Typography>
                  <span>{areaRule.area_name}</span> - {areaRule.price} تومان
                </Typography>
              </Box>
            )}
            renderInput={params => (
              <TextField
                {...params}
                label='منطقه'
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
            onInputChange={(_, value) => setInputValue(value)}
            onChange={(_, value) => handleAreaRuleSelect(value)}
            loading={loading}
            fullWidth
          />
        )}
    </Stack>
  )
}

export default DeliveryMethodSelect
