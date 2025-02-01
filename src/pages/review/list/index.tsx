// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

// ** Components Imports
import TableReview from '@/components/tables/TableReview'

const Invoice = () => {
  // ** Hook

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <TableReview />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Invoice
