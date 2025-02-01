// ** React Imports

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

// ** Components Imports
import TableDeliveryMethod from '@/components/tables/TableDeliveryMethod'

const Invoice = () => {
  // ** Hook

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <TableDeliveryMethod />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Invoice
