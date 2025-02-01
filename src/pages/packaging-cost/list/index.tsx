// ** React Imports

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

// ** Components Imports
import TablePackagingCost from '@/components/tables/TablePackagingCost'

const Invoice = () => {
  // ** Hook

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <TablePackagingCost />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Invoice
