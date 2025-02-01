// ** React Imports

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

// ** Components Imports
import TableQuestion from '@/components/tables/TableQuestion'

const Invoice = () => {
  // ** Hook

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <TableQuestion />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Invoice
