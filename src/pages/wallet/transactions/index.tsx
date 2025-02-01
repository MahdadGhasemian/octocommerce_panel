// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

// ** Components Imports
import TableWalletTransaction from '@/components/tables/TableWalletTransaction'

const Invoice = () => {
  // ** Hook

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <TableWalletTransaction />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Invoice
