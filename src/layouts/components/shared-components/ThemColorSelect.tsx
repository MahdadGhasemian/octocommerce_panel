// ** MUI Imports
import { FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material'

// ** Type Import
import { Settings } from '@/context/settingsContext'

// ** Types
import { ThemeColor } from '@/layouts/types'

const themeColors: ThemeColor[] = ['primary', 'secondary', 'error', 'warning', 'info', 'success']

interface Props {
  settings: Settings
  saveSettings: (values: Settings) => void
}

const ThemColorSelect = (props: Props) => {
  // ** Props
  const { settings, saveSettings } = props

  const handleThemeChange = (themeColor: ThemeColor) => {
    if (themeColors.includes(themeColor)) saveSettings({ ...settings, themeColor })
  }

  const handleChange = (event: SelectChangeEvent) => {
    const themeColor = event.target.value as ThemeColor
    handleThemeChange(themeColor)
  }

  return (
    <FormControl variant='standard' sx={{ m: 1, minWidth: 120 }}>
      <Select value={settings.themeColor} onChange={handleChange}>
        {themeColors.map(theme => (
          <MenuItem value={theme} key={theme}>
            {theme}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default ThemColorSelect
