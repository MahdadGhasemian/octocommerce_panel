// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

// ** Components Imports
import TableContact from '@/components/tables/TableContact'

const Invoice = () => {
  // ** Hook

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <TableContact />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Invoice
