// ** React Imports

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

// ** Components Imports
import TableLabel from '@/components/tables/TableLabel'

const Label = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <TableLabel />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Label
