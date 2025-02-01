// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

// ** Components Imports
import TableAccess from '@/components/tables/TableAccess'

const Invoice = () => {
  // ** Hook

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <TableAccess />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Invoice
