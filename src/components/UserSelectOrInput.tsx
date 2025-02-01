// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import { Autocomplete, Box, CircularProgress, TextField, Typography } from '@mui/material'

// ** Services Import
import authService, { User } from '@/services/auth.service'

export type Props = {
  onChange: (value: string | null) => void
  label?: string
}

const UserSelectOrInput = (props: Props) => {
  // ** Props
  const { onChange, label = 'کاربر' } = props

  // ** States
  const [user, setUser] = useState<User | string | null>(null)
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [options, setOptions] = useState<User[]>([])

  // Fetch products when the inputValue changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const response = await authService.getAllUser(10, 1, inputValue)
      setOptions(response.data || [])
      setLoading(false)

      if (user && typeof user !== 'string') {
        onChange(user?.mobile_phone)
      } else {
        onChange(inputValue)
      }
    }

    fetchData()
  }, [inputValue])

  const handleSelectUser = (selectedUser: User | string | null) => {
    setUser(selectedUser)

    if (selectedUser && typeof selectedUser !== 'string') {
      onChange(selectedUser.mobile_phone)
    }
  }

  return (
    <Autocomplete
      id='user'
      freeSolo
      value={user}
      inputValue={inputValue}
      options={options}
      getOptionLabel={option => {
        if (typeof option === 'string') {
          return option
        }

        return `${option?.first_name || ''} ${option?.last_name || ''}`
      }}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      noOptionsText={'هیچ آیتمی موجود نیست'}
      loadingText='در حال بارگذاری...'
      renderOption={(props, user) => (
        <Box
          component='li'
          {...props}
          key={user.id}
          sx={{
            '&:nth-of-type(odd)': {
              backgroundColor: theme => theme.palette.divider
            }
          }}
          gap={1}
        >
          <Typography>
            {`${user.first_name} ${user.last_name}`}
            <span dir='ltr'>{user.mobile_phone?.replace('+98', '0')}</span>
          </Typography>
        </Box>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
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
      onChange={(_, value) => handleSelectUser(value)}
      loading={loading}
    />
  )
}

export default UserSelectOrInput
