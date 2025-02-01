// ** MUI Imports
import { Grid, Card } from '@mui/material'

// ** Components Imports
import TableWarehouse from '@/components/tables/TableWarehouse'

const WarehouseManagement = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <TableWarehouse />
        </Card>
      </Grid>
    </Grid>
  )
}

export default WarehouseManagement
