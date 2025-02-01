// ** React Imports
import { FC } from 'react'

// ** MUI Components
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  TypographyProps,
  styled
} from '@mui/material'

// ** Icons Imports
import { TrashCanOutline } from 'mdi-material-ui'
import { ConfirmationContentProps } from '@/context/confirmationContext'

const StyledDescreption = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontWeight: 600,
  overflow: 'hidden',
  whiteSpace: 'normal',
  textOverflow: 'ellipsis',
  marginBottom: theme.spacing(0.75),

  '& span.groupName': {
    fontWeight: 900
  },

  '& span.name': {
    color: 'red',
    fontStyle: 'italic'
  }
}))

interface Props {
  open: boolean
  content: string | ConfirmationContentProps
  onCancel: () => void
  onConfirm: () => void
}

const ConfirmDialog: FC<Props> = (props: Props) => {
  const { open, content, onCancel, onConfirm } = props

  return (
    <Dialog open={open}>
      <DialogTitle>{typeof content === 'string' ? 'تایید پاک کردن' : content?.title}</DialogTitle>
      <DialogContent>
        {typeof content === 'string' ? (
          <Typography>{content}</Typography>
        ) : content.isGeneral ? (
          <StyledDescreption>
            <span>{content.text}</span>
          </StyledDescreption>
        ) : (
          <StyledDescreption>
            {`آیا از پاک کردن `}
            <span className='groupName'>{content.groupName}</span>
            {` `}
            <span className='name'>{content.name}</span>
            {` اطمینان دارید؟`}
          </StyledDescreption>
        )}
      </DialogContent>
      <DialogActions sx={{ mt: 4 }}>
        <Button variant='outlined' fullWidth onClick={onCancel}>
          خیر
        </Button>
        <Button color='error' variant='contained' fullWidth onClick={onConfirm}>
          {typeof content !== 'string' && content.isGeneral ? content.rejectButtonText : 'بله پاک شود'}
          {typeof content !== 'string' && content.isGeneral ? <div></div> : <TrashCanOutline />}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog
