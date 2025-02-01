// ** React Imports
import React from 'react'

// ** MUI Imports
import Snackbar from '@mui/material/Snackbar'
import MuiAlert, { AlertProps } from '@mui/material/Alert'

// ** Redux Imports
import { useDispatch, useSelector } from 'react-redux'
import { selectLastNotifications, close, INotification } from '@/redux/slices/snackbarSlice'
import { AppDispatch } from '@/redux/store'

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />
})

const Notification = () => {
  // ** Global State
  const notifications = useSelector(selectLastNotifications)
  const dispatch = useDispatch<AppDispatch>()

  const closeHandler = (notification: INotification) => {
    dispatch(close(notification))
  }

  return (
    <Snackbar open={!!notifications?.length}>
      <span>
        {notifications?.map(notification => (
          <Alert
            key={notification.id}
            onClose={() => closeHandler(notification)}
            severity={notification.type}
            sx={{ width: '100%', m: '0.5rem' }}
          >
            {notification.message}
          </Alert>
        ))}
      </span>
    </Snackbar>
  )
}

export default Notification
