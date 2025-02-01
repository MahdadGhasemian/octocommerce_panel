// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

// ** Components Imports
import TableCategory from '@/components/tables/TableCategory'

// ** Services Import
import BasicService, { Category } from '@/services/basic.service'

const Invoice = () => {
  // ** Hook

  // ** State
  const [categoriesFlat, setCategoriesFlat] = useState<Array<Category>>()

  useEffect(() => {
    const fetchData = async () => {
      const categoriesFlat = await BasicService.getAllFlat()
      setCategoriesFlat(categoriesFlat)
    }

    fetchData()
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <TableCategory categoriesFlat={categoriesFlat} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Invoice
