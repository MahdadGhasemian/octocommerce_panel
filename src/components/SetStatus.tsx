// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import { Button, Grid, TextField } from '@mui/material'

// ** Icons Imports
import { Check, Close } from 'mdi-material-ui'

interface Props {
  confirmedValue: any
  rejectedValue: any
  handleConfirmOrReject: any
  setRejectNote: any
  confirmButtonText?: string
  rejectButtonText?: string
}

const SetStatus = (props: Props) => {
  // ** Props
  const {
    confirmedValue,
    rejectedValue,
    handleConfirmOrReject,
    setRejectNote,
    confirmButtonText = 'تایید',
    rejectButtonText = 'عدم تایید'
  } = props

  // ** State
  const [rejectProcess, setRejectProcess] = useState<boolean>(false)

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Button variant='contained' color='success' fullWidth onClick={() => handleConfirmOrReject(confirmedValue)}>
          {confirmButtonText}
          <Check />
        </Button>
      </Grid>
      {!rejectProcess && (
        <Grid item xs={12} sm={6}>
          <Button color='error' variant='contained' fullWidth onClick={() => setRejectProcess(true)}>
            {rejectButtonText}
            <Close />
          </Button>
        </Grid>
      )}
      {rejectProcess && (
        <>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='علت عدم تایید'
              InputLabelProps={{
                shrink: true
              }}
              InputProps={{
                inputProps: { min: 0 }
              }}
              onChange={e => setRejectNote(e.target.value)}
              sx={{ marginTop: 4 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button color='error' variant='contained' fullWidth onClick={() => handleConfirmOrReject(rejectedValue)}>
              عدم تایید
              <Close />
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button color='warning' variant='contained' fullWidth onClick={() => setRejectProcess(false)}>
              انصراف
              <Close />
            </Button>
          </Grid>
        </>
      )}
    </Grid>
  )
}

export default SetStatus
