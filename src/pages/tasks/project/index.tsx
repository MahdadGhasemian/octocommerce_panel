// ** React Imports

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

// ** Components Imports
import TableProject from '@/components/tables/TableProject'

const Project = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <TableProject />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Project
