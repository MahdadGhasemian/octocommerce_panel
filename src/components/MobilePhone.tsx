// ** React Imports
import { FC } from 'react'

// ** MUI Imports
import { InputAdornment, TextField } from '@mui/material'

// ** Icons Imports
import Phone from 'mdi-material-ui/Phone'

//
interface Props {
  type: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  label?: string
  placeholder?: string
  autoFocus?: boolean
  fullWidth?: boolean
  sx?: object
}

const MobilePhoneInput: FC<Props> = ({
  type,
  value,
  onChange,
  className,
  label,
  placeholder,
  autoFocus,
  fullWidth,
  sx
}) => {
  return (
    <TextField
      type={type}
      value={value}
      onChange={onChange}
      label={label || 'Phone Number'}
      placeholder={placeholder}
      className={className}
      autoFocus={autoFocus}
      fullWidth={fullWidth}
      sx={{
        ...sx,
        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
          display: 'none'
        },
        '& input[type=number]': {
          MozAppearance: 'textfield'
        }
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position='start'>
            <Phone />
          </InputAdornment>
        )
      }}
    />
  )
}

export default MobilePhoneInput
