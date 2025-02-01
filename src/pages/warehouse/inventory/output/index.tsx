// ** MUI Imports
import { Grid, Card } from '@mui/material'

// ** Components Imports
import TableInventoryItem from '@/components/tables/TableInventoryItem'

const OperationList = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <TableInventoryItem inventory_type='output' />
        </Card>
      </Grid>
    </Grid>
  )
}

export default OperationList
