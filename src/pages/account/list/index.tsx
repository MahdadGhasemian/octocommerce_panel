// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

// ** Components Imports
import TableAccount from '@/components/tables/TableAccount'

const Invoice = () => {
  // ** Hook

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <TableAccount />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Invoice
