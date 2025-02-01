// ** React Imports
import { ElementType, forwardRef, useState } from 'react'

// ** MUI Imports
import { Button, ButtonProps, Dialog, IconButton, Slide, styled, Toolbar, Typography } from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'

// ** Icons Imports
import { Close, Plus } from 'mdi-material-ui'

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction='right' ref={ref} {...props} />
})

const SlideDialog = (props: {}) => {
  // ** Props
  const {} = props

  // ** States
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div>
      <ButtonStyled component='button' variant='contained' onClick={handleClickOpen}>
        <Plus />
      </ButtonStyled>
      <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        <Toolbar>
          <IconButton edge='start' color='inherit' onClick={handleClose} aria-label='close'>
            <Close />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
            افزودن آدرس جدید
          </Typography>
          <Button autoFocus color='inherit' onClick={handleClose}>
            ذخیره
          </Button>
        </Toolbar>
      </Dialog>
    </div>
  )
}

export default SlideDialog
