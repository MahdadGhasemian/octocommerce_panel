// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  Box,
  Button,
  Grid,
  TextField,
  useMediaQuery,
  useTheme
} from '@mui/material'

// ** Icons Imports
import { Add, Delete, ExpandMore } from '@mui/icons-material'

interface ExternalSeller {
  store_name?: string
  store_category_url: string
  store_category_english_name: string
  store_category_persian_name: string
}

export type Props = {
  initialExternalSellers?: ExternalSeller[]
  onChange: (value: ExternalSeller[]) => void
}

const CategoryExternalSeller = (props: Props) => {
  // ** Props
  const { initialExternalSellers, onChange } = props

  // ** Hook
  const theme = useTheme()

  // ** State
  const [externalSellers, setExternalSellers] = useState<ExternalSeller[] | undefined>(initialExternalSellers)

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  // ** Functions
  const onAddingHandler = () => {
    setExternalSellers(prevExternalSellers => {
      const updated = [
        ...(prevExternalSellers || []),
        {
          store_name: '',
          store_category_url: '',
          store_category_english_name: '',
          store_category_persian_name: ''
        }
      ]

      onChange(updated)

      return updated
    })
  }

  const onDeletingHandler = (index: number) => {
    setExternalSellers(prevExternalSellers => {
      if (!prevExternalSellers) return []

      const updated = prevExternalSellers.filter((_, i) => i !== index)

      onChange(updated)

      return updated
    })
  }

  const onChangeHandler = (index: number, field: keyof ExternalSeller, value: string) => {
    setExternalSellers(prevExternalSellers => {
      if (!prevExternalSellers) return []
      const updated = [...prevExternalSellers]
      updated[index] = {
        ...updated[index],
        [field]: value
      }

      onChange(updated)

      return updated
    })
  }

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />} aria-controls='panel1-content' id='panel1-header'>
        <Box display='flex' alignItems='center' justifyContent='center' gap={4}>
          <span>تامین</span>
          <Badge
            overlap='circular'
            badgeContent={externalSellers?.length || 0}
            color='info'
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          ></Badge>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          sx={{
            gap: {
              xs: 4,
              md: 2
            }
          }}
        >
          {externalSellers?.map((spec, index) => (
            <Grid key={`${spec}-${index}`} container spacing={2} alignItems='center' justifyContent='end'>
              <Grid item xs={12} sm={4}>
                <TextField
                  label='نام فروشگاه'
                  name='store_name'
                  value={spec.store_name}
                  onChange={e => onChangeHandler(index, 'store_name', e.target.value)}
                  fullWidth
                  size='small'
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  label='لینک دسته بندی'
                  name='store_category_url'
                  value={spec.store_category_url}
                  onChange={e => onChangeHandler(index, 'store_category_url', e.target.value)}
                  fullWidth
                  size='small'
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label='نام انگلیسی'
                  name='store_category_english_name'
                  value={spec.store_category_english_name}
                  onChange={e => onChangeHandler(index, 'store_category_english_name', e.target.value)}
                  fullWidth
                  size='small'
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label='نام فارسی'
                  name='store_category_persian_name'
                  value={spec.store_category_persian_name}
                  onChange={e => onChangeHandler(index, 'store_category_persian_name', e.target.value)}
                  fullWidth
                  size='small'
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <Button
                  variant={isSmallScreen ? 'outlined' : 'text'}
                  color='error'
                  size='small'
                  fullWidth={isSmallScreen}
                  onClick={() => onDeletingHandler(index)}
                >
                  <Delete />
                </Button>
              </Grid>
            </Grid>
          ))}
          <Button variant='outlined' color='success' fullWidth onClick={() => onAddingHandler()}>
            افزودن
            <Add />
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

export default CategoryExternalSeller
