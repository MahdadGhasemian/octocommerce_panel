// ** React Imports

// ** MUI Imports
import { Card, Grid } from '@mui/material'

// ** Components Imports
import TableBonus from '@/components/tables/TableBonus'

const Bonus = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <TableBonus />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Bonus
