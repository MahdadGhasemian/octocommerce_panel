// ** MUI Imports
import { Grid, Card } from '@mui/material'

// ** Components Imports
import TableInventoryStock from '@/components/tables/TableInventoryStock'

const OperationList = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <TableInventoryStock />
        </Card>
      </Grid>
    </Grid>
  )
}

export default OperationList
