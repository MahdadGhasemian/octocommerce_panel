// ** MUI Imports
import { Grid, Card } from '@mui/material'

// ** Components Imports
import TableInvoice from '@/components/tables/TableInvoice'

const Invoice = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <TableInvoice />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Invoice
