// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import { IconButton, TextField } from '@mui/material'

// ** Icon Imports
import { Update } from '@mui/icons-material'

export type Props = {
  product_id: number
}

const AvailableQuantity = (props: Props) => {
  // ** Props
  const { product_id } = props

  // ** States
  const [loading, setLoading] = useState<boolean>(false)
  const [availableQuantity, setAvailableQuantity] = useState<number>(0)
  const [availableQuantityChanged, setAvailableQuantityChanged] = useState<boolean>(false)

  // ** Functions
  const handleAvailableQuantityUpdate = async () => {
    setLoading(true)
    // const { available_quantity } = await basicService.updateInventoryStockVirtualy(product_id, availableQuantity)
    // setAvailableQuantity(available_quantity)
    setAvailableQuantityChanged(false)
    setLoading(false)
  }

  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true)
      // const { available_quantity } = await basicService.getInventoryStockVirtualy(product_id)
      // setAvailableQuantity(available_quantity)
      setAvailableQuantityChanged(false)
      setLoading(false)
    }

    if (product_id) fetchStock()
  }, [product_id])

  return (
    <TextField
      label='موجودی'
      name='availableQuantity'
      value={availableQuantity}
      InputLabelProps={{
        shrink: true
      }}
      onChange={e => {
        setAvailableQuantity(+e.target.value)
        setAvailableQuantityChanged(true)
      }}
      fullWidth
      InputProps={{
        endAdornment: availableQuantityChanged && (
          <IconButton color='primary' edge='end' onClick={handleAvailableQuantityUpdate}>
            <Update />
          </IconButton>
        )
      }}
      disabled={loading}
    />
  )
}

export default AvailableQuantity
