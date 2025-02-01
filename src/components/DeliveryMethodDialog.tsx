// ** React Imports
import React, { FC, Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import {
  Button,
  IconButton,
  Dialog,
  AppBar,
  Toolbar,
  Typography,
  Slide,
  TextField,
  Box,
  List,
  ListItem,
  Divider,
  CircularProgress
} from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'

// ** Icons Imports
import { CloseCircleOutline, Delete } from 'mdi-material-ui'

// ** Services Import
import BasicService, { DeliveryMethod, DeliveryMethodAreaRule } from '@/services/basic.service'

// ** Redux Imports
import { store } from '@/redux/store'
import { toastError, toastSuccess } from '@/redux/slices/snackbarSlice'

// ** Map Types Imports
import { DeliveryTypeMap } from '@/map-types'

//
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

type Props = {
  deliveryMethod: DeliveryMethod
  open: boolean
  onClose: () => void
}

const DeliveryMethodDialog: FC<Props> = (props: Props) => {
  // ** Props
  const { deliveryMethod, open, onClose } = props

  // ** States
  const [deliveryMethodAreaRule, setDeliveryMethodAreaRule] = useState<DeliveryMethodAreaRule[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  // ** Store
  const { dispatch } = store

  useEffect(() => {
    if (deliveryMethod?.delivery_method_area_rules)
      setDeliveryMethodAreaRule(sortData(deliveryMethod.delivery_method_area_rules))
  }, [deliveryMethod])

  const handleClose = () => {
    onClose()
  }

  const handleSaveDeliveryMethod = async () => {
    try {
      if (deliveryMethod?.id) {
        setLoading(true)

        const editedDeliveryMethod = {
          ...deliveryMethod,
          fixed_price: Number(deliveryMethod?.fixed_price || 0),
          per_kilometer: Number(deliveryMethod?.per_kilometer || 0)
        }

        editedDeliveryMethod.delivery_method_area_rules = deliveryMethodAreaRule?.map(item => {
          return {
            ...item,
            price: Number(item?.price || 0)
          }
        })

        await BasicService.editDeliveryMethod(Number(deliveryMethod.id), editedDeliveryMethod)

        dispatch(
          toastSuccess(
            `تغییرات مربوط به روش ارسال ${DeliveryTypeMap.get(deliveryMethod.delivery_type)} با موفقیت ذخیره شد.`
          )
        )
        onClose()
      }
    } catch (error) {
      dispatch(toastError('خطایی رخ داده است!'))
    } finally {
      setLoading(false)
    }
  }

  const handleAddNewRule = () => {
    const newRule: DeliveryMethodAreaRule = {
      area_name: '',
      price: 0
    }
    setDeliveryMethodAreaRule(prevData => [...prevData, newRule])
  }

  const handleDeleteRule = (index: number) => {
    if (!confirm('Are you sure you want to delete this rule?')) {
      return
    }
    setDeliveryMethodAreaRule(prevData => prevData.filter((_, i) => i !== index))
  }

  const handleEditField = (index: number, field: keyof DeliveryMethodAreaRule, value: string | number) => {
    setDeliveryMethodAreaRule(prevData => prevData.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const sortData = (data: DeliveryMethodAreaRule[]) => {
    return data?.sort((a: DeliveryMethodAreaRule, b: DeliveryMethodAreaRule) => {
      return a.area_name.localeCompare(b.area_name)
    })
  }

  return (
    <Fragment>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton edge='start' color='inherit' onClick={handleClose} aria-label='close'>
              <CloseCircleOutline />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} color='inherit' variant='h6' component='div'>
              ناحیه ها
            </Typography>
            <Button autoFocus color='inherit' onClick={handleSaveDeliveryMethod}>
              ذخیره
            </Button>
          </Toolbar>
        </AppBar>

        <Box display='flex'>
          {loading ? (
            <CircularProgress />
          ) : (
            <Box sx={{ padding: 4 }}>
              <Button color='secondary' onClick={handleAddNewRule} variant='contained' size='large' sx={{ m: 4 }}>
                جدید
              </Button>
              <List>
                {deliveryMethodAreaRule.map((rule, index) => (
                  <Fragment key={index}>
                    <Box display='flex' flexDirection='row' gap={2} justifyContent='center' alignItems='center'>
                      <ListItem alignItems='flex-start'>
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flex: 1 }}>
                          <TextField
                            label='نام'
                            value={rule.area_name || ''}
                            onChange={e => handleEditField(index, 'area_name', e.target.value)}
                            fullWidth
                          />
                          <TextField
                            label='قیمت'
                            type='number'
                            value={rule.price || ''}
                            onChange={e => handleEditField(index, 'price', Number(e.target.value))}
                            fullWidth
                          />
                        </Box>
                      </ListItem>
                      <IconButton color='error' onClick={() => handleDeleteRule(index)}>
                        <Delete />
                      </IconButton>
                    </Box>
                    <Divider />
                  </Fragment>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Dialog>
    </Fragment>
  )
}

export default DeliveryMethodDialog
