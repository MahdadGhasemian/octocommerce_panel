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

interface Specification {
  key: string
  value: string
  key_2?: string
  value_2?: string
}

export type Props = {
  initialSpecifications?: Specification[]
  onChange: (value: Specification[]) => void
}

const ProductSpecification = (props: Props) => {
  // ** Props
  const { initialSpecifications, onChange } = props

  // ** Hook
  const theme = useTheme()

  // ** State
  const [specifications, setSpecifications] = useState<Specification[] | undefined>(initialSpecifications)

  // ** Vars
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  // ** Functions
  const onAddingHandler = () => {
    setSpecifications(prevSpecifications => {
      const updated = [
        ...(prevSpecifications || []),
        {
          key: '',
          value: '',
          key_2: '',
          value_2: ''
        }
      ]

      onChange(updated)

      return updated
    })
  }

  const onDeletingHandler = (index: number) => {
    setSpecifications(prevSpecifications => {
      if (!prevSpecifications) return []

      const updated = prevSpecifications.filter((_, i) => i !== index)

      onChange(updated)

      return updated
    })
  }

  const onChangeHandler = (index: number, field: keyof Specification, value: string) => {
    setSpecifications(prevSpecifications => {
      if (!prevSpecifications) return []
      const updated = [...prevSpecifications]
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
          <span>مشخصات فنی</span>
          <Badge
            overlap='circular'
            badgeContent={specifications?.length || 0}
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
          {specifications?.map((spec, index) => (
            <Grid key={`${spec}-${index}`} container spacing={2} alignItems='center' justifyContent='end'>
              <Grid item xs={12} sm={6} md={2.7}>
                <TextField
                  label='کلید فارسی'
                  name='key'
                  value={spec.key}
                  onChange={e => onChangeHandler(index, 'key', e.target.value)}
                  fullWidth
                  size='small'
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.7}>
                <TextField
                  label='مقدار فارسی'
                  name='value'
                  value={spec.value}
                  onChange={e => onChangeHandler(index, 'value', e.target.value)}
                  fullWidth
                  size='small'
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.7}>
                <TextField
                  label='English Key'
                  name='key_2'
                  value={spec.key_2}
                  onChange={e => onChangeHandler(index, 'key_2', e.target.value)}
                  fullWidth
                  size='small'
                  dir='ltr'
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.7}>
                <TextField
                  label='English Value'
                  name='value_2'
                  value={spec.value_2}
                  onChange={e => onChangeHandler(index, 'value_2', e.target.value)}
                  fullWidth
                  size='small'
                  dir='ltr'
                />
              </Grid>
              <Grid item xs={12} sm={2} md={1.2}>
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

export default ProductSpecification
