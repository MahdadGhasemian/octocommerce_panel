// ** React Imports
import React, { FC, useState, useRef } from 'react'
import { SliderPicker, ColorResult } from 'react-color'

// ** MUI Imports
import { Button, TextField, Box, Grid, IconButton } from '@mui/material'

// ** Icons Imports
import { Palette } from 'mdi-material-ui'

const colorOptions = [
  '#90C8E5', // Cold (Light Blue)
  '#5FB2D9', // Cold-Moderate (Sky Blue)
  '#76AD96', // Moderate (Sea Green)
  '#E3B505', // Moderate-Warm (Mustard Yellow)
  '#E57D31', // Warm (Tangerine Orange)
  '#FF5370' // Warm-Hot (Coral Pink)
]

type Props = {
  label: string
  onColorSelected: any
  defaultValue?: string
}

const ColorPicker: FC<Props> = (props: Props) => {
  // ** Props
  const { label, onColorSelected, defaultValue } = props

  const [color, setColor] = useState<string>()
  const [showPicker, setShowPicker] = useState<boolean>(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor)
    onColorSelected(selectedColor)
  }

  const handlePickerToggle = () => {
    setShowPicker(prevState => !prevState)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
      setShowPicker(false)
    }
  }

  React.useEffect(() => {
    setColor(defaultValue)
  }, [defaultValue])

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <Box>
      <TextField
        label={label}
        value={color}
        InputLabelProps={{
          shrink: true
        }}
        InputProps={{
          endAdornment: (
            <IconButton color='primary' onClick={handlePickerToggle} edge='end'>
              <Palette />
            </IconButton>
          )
        }}
        onChange={e => handleColorSelect(e.target.value)}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: color || 'default'
            },
            '&:hover fieldset': {
              borderColor: color || 'default'
            },
            '&.Mui-focused fieldset': {
              borderColor: color || 'default'
            }
          }
        }}
      />
      {showPicker && (
        <Box ref={pickerRef} sx={{ marginY: 4 }}>
          <div>
            <SliderPicker color={color} onChange={(color: ColorResult) => handleColorSelect(color.hex)} />
          </div>
        </Box>
      )}
      <Grid container spacing={4} marginY={4}>
        {colorOptions.map(option => (
          <Grid item key={option}>
            <Button
              style={{ backgroundColor: option, height: '36px', margin: '0 4px' }}
              onClick={() => handleColorSelect(option)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default ColorPicker
