// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import { Autocomplete, Box, CircularProgress, TextField, Typography } from '@mui/material'

// ** Services Import
import authService, { User } from '@/services/auth.service'

export type Props = {
  onChange: (value: User | null) => void
}

const UserSelect = (props: Props) => {
  // ** Props
  const { onChange } = props

  // ** States
  const [user, setUser] = useState<User | null>(null)
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
    }

    fetchData()
  }, [inputValue])

  const handleSelectUser = (user: User | null) => {
    setUser(user)
    onChange(user)
  }

  return (
    <Autocomplete
      id='user'
      value={user}
      options={options}
      getOptionLabel={user => `${user.first_name} ${user.last_name}`}
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
          label='نام کاربر'
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

export default UserSelect
