// ** React Imports
import { forwardRef, useEffect, useState } from 'react'

// ** MUI Imports
import {
  Autocomplete,
  Box,
  Button,
  ButtonProps,
  Grid,
  Paper,
  styled,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from '@mui/material'

// ** Icons Imports
import { Plus } from 'mdi-material-ui'

// ** Services Import
import BasicService, { Contact } from '@/services/basic.service'

// ** Component Imports
import { NumericFormat, NumericFormatProps } from 'react-number-format'
import { User } from '@/services/auth.service'
import { useSelector } from 'react-redux'
import { isCustomerUser } from '@/redux/slices/authSlice'

const ButtonStyled = styled(Button)<ButtonProps & { htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const CancelButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(4.5),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4)
  }
}))

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
      valueIsNumericString
    />
  )
})

type Props = {
  contact: Contact | null
  onSelectContact: any
  label?: string
  user: User | null
}

const OrderInvoice = (props: Props) => {
  // ** Props
  const { contact, onSelectContact, label, user } = props

  // ** Global State
  const isUser = useSelector(isCustomerUser)

  // ** States
  const [contactList, setContactList] = useState<Array<Contact>>()
  const [newContact, setNewContact] = useState<Partial<Contact>>()
  const [open, setOpen] = useState(false)

  const fetchContacts = async () => {
    if (isUser) {
      const contacts = await BasicService.getAllContact(1000, 1)
      setContactList(contacts.data)
    } else {
      const contactFilters = user ? [{ id: 'user_id', value: user.id, operator: '$eq' }] : []
      const contacts = await BasicService.getAllContact(1000, 1, undefined, contactFilters)
      setContactList(contacts.data)
    }
  }

  const handleContact = (value: Contact | null | undefined) => {
    if (value) {
      onSelectContact(value)
    }
  }

  const handleAddNewContact = async () => {
    if (newContact) {
      if (isUser) {
        const contact = await BasicService.createContact({ ...newContact })
        onSelectContact(contact)
      } else {
        if (user) {
          const contact = await BasicService.createContactForOtherUser({ ...newContact, user_id: +user.id })
          onSelectContact(contact)
        }
      }

      fetchContacts()
    }
    handleClose()
  }

  const handleClickOpen = () => {
    setNewContact({})
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    fetchContacts()
  }, [user])

  if (!contactList) return <p>در حال آماده سازی اطلاعات ...</p>

  return (
    <Box>
      <Dialog fullWidth maxWidth={'md'} open={open} onClose={handleClose}>
        <DialogTitle>افزودن آدرس جدید</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} marginY={4}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='عنوان'
                placeholder='شرکت'
                value={newContact?.title}
                onChange={e => {
                  setNewContact({ ...newContact, title: e.target.value })
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='تلفن ثابت'
                value={newContact?.phone}
                onChange={e => {
                  setNewContact({ ...newContact, phone: e.target.value })
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='نام'
                placeholder='شرکت'
                value={newContact?.name}
                onChange={e => {
                  setNewContact({ ...newContact, name: e.target.value })
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='تلفن همراه'
                value={newContact?.mobile_phone}
                onChange={e => {
                  setNewContact({ ...newContact, mobile_phone: e.target.value })
                }}
              />
            </Grid>
            <Grid item xs={12} sm={9}>
              <TextField
                fullWidth
                label='آدرس'
                value={newContact?.address}
                onChange={e => {
                  setNewContact({ ...newContact, address: e.target.value })
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label='کد پستی'
                value={newContact?.postal_code}
                onChange={e => {
                  setNewContact({ ...newContact, postal_code: e.target.value })
                }}
                InputProps={{ style: { direction: 'ltr' }, inputComponent: NumericFormatCustom as any }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='کد ملی'
                value={newContact?.national_code}
                onChange={e => {
                  setNewContact({ ...newContact, national_code: e.target.value })
                }}
                InputProps={{ style: { direction: 'ltr' }, inputComponent: NumericFormatCustom as any }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='کد اقتصادی'
                value={newContact?.economic_code}
                onChange={e => {
                  setNewContact({ ...newContact, economic_code: e.target.value })
                }}
                InputProps={{ style: { direction: 'ltr' }, inputComponent: NumericFormatCustom as any }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <ButtonStyled variant='contained' component='label' onClick={handleAddNewContact}>
            ذخیره
          </ButtonStyled>
          <CancelButtonStyled color='error' variant='outlined' onClick={handleClose}>
            انصراف
          </CancelButtonStyled>
        </DialogActions>
      </Dialog>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Autocomplete
            id='contact'
            fullWidth
            value={contact}
            getOptionLabel={contacts => `${contacts.title || contacts?.name}`}
            options={contactList}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            noOptionsText={'هیچ آیتمی موجود نیست'}
            renderOption={(props, contacts) => (
              <Box component='li' {...props} key={contacts.id}>
                {contacts.title || contacts?.name}
              </Box>
            )}
            renderInput={params => <TextField {...params} label={label} />}
            onChange={(_, value) => handleContact(value)}
            PaperComponent={({ children }) => {
              return (
                <Paper>
                  <ButtonStyled
                    component='button'
                    fullWidth
                    onMouseDown={() => {
                      handleClickOpen()
                    }}
                  >
                    افزودن جدید
                    <Plus />
                  </ButtonStyled>
                  {children}
                </Paper>
              )
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant='body2'>{contact?.name}</Typography>
          <Typography variant='body2'>{contact?.address}</Typography>
          <Typography variant='body2'>{contact?.national_code}</Typography>
        </Grid>
      </Grid>
    </Box>
  )
}

export default OrderInvoice
