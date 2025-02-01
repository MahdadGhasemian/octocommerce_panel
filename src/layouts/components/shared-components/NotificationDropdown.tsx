// ** React Imports
import { useState, SyntheticEvent, Fragment, ReactNode } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { styled, Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MuiMenu, { MenuProps } from '@mui/material/Menu'
import MuiAvatar, { AvatarProps } from '@mui/material/Avatar'
import MuiMenuItem, { MenuItemProps } from '@mui/material/MenuItem'
import Typography, { TypographyProps } from '@mui/material/Typography'

// ** Icons Imports
import { BellOutline } from 'mdi-material-ui'

// ** Third Party Components
import PerfectScrollbarComponent from 'react-perfect-scrollbar'

// ** Redux Imports
import { useSelector } from 'react-redux'
import { IMessage, MessageType, selectDefaultMessages, selectDefaultUnreadCount } from '@/redux/slices/messageSlice'

// ** Utils Imports
import { fromNow } from '@/utils/from-now'
import { Badge } from '@mui/material'

// ** Hook Import
import { useSettings } from '@/hooks/useSettings'

// ** Styled Menu component
const Menu = styled(MuiMenu)<MenuProps>(({ theme }) => ({
  '& .MuiMenu-paper': {
    width: 380,
    overflow: 'hidden',
    marginTop: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  '& .MuiMenu-list': {
    padding: 0
  }
}))

// ** Styled MenuItem component
const MenuItem = styled(MuiMenuItem)<MenuItemProps>(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`
}))

const styles = {
  maxHeight: 349,
  '& .MuiMenuItem-root:last-of-type': {
    border: 0
  }
}

// ** Styled PerfectScrollbar component
const PerfectScrollbar = styled(PerfectScrollbarComponent)({
  ...styles
})

// ** Styled Avatar component
const Avatar = styled(MuiAvatar)<AvatarProps>({
  width: '2.375rem',
  height: '2.375rem',
  fontSize: '1.125rem'
})

// ** Styled component for the title in MenuItems
const MenuItemTitle = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontWeight: 600,
  flex: '1 1 100%',
  overflow: 'hidden',
  fontSize: '0.875rem',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  marginBottom: theme.spacing(0.75)
}))

// ** Styled component for the subtitle in MenuItems
const MenuItemSubtitle = styled(Typography)<TypographyProps>({
  flex: '1 1 100%',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis'
})

const NotificationDropdown = () => {
  // ** States
  const [anchorEl, setAnchorEl] = useState<(EventTarget & Element) | null>(null)

  // ** Global State
  const messages = useSelector(selectDefaultMessages)
  const unreadCount = useSelector(selectDefaultUnreadCount)

  // ** Hook
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const { settings } = useSettings()

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = () => {
    setAnchorEl(null)
  }

  const ScrollWrapper = ({ children }: { children: ReactNode }) => {
    if (hidden) {
      return <Box sx={{ ...styles, overflowY: 'auto', overflowX: 'hidden' }}>{children}</Box>
    } else {
      return (
        <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>{children}</PerfectScrollbar>
      )
    }
  }

  const handleMessageClick = (message: IMessage) => {
    setAnchorEl(null)

    const id = message.id
    const type = message.type

    if (type === MessageType.NewOrder) {
      const order_id = message.data?.id
      const order_invoice_number = message.data?.order_invoice_number

      window.open(`/invoice/view?id=${order_id}&order_invoice_number=${order_invoice_number}`, '_blank')
    } else if (type === MessageType.NewPayment) {
      const order_id = message.data?.order_id

      window.open(`/invoice/view?id=${order_id}`, '_blank')
    } else if (type === MessageType.NewDelivery) {
      const delivery_id = message.data?.id
      const order_id = message.data?.order?.id

      window.open(`/invoice/view?id=${order_id}&delivery_id=${delivery_id}`, '_blank')
    } else if (type === MessageType.NewReview) {
      const review_id = message.data?.id

      window.open(`/review/list/?id=${review_id}`)
    } else if (type === MessageType.NewQuestion) {
      const question_id = message.data?.id

      window.open(`/question/list/?id=${question_id}`)
    }

    settings.socket?.emit('message_viewed', { id, is_viewed: true })
  }

  const handleTickUnreadMessagesAsRead = () => {
    settings.socket?.emit('all_default_group_messages_viewed', { is_viewed: true })
    handleDropdownClose()
  }

  return (
    <Fragment>
      <IconButton color='inherit' aria-haspopup='true' onClick={handleDropdownOpen} aria-controls='customized-menu'>
        <Badge
          overlap='circular'
          sx={{ ml: 2, cursor: 'pointer' }}
          badgeContent={unreadCount}
          color='primary'
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <BellOutline />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleDropdownClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disableRipple>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography sx={{ fontWeight: 600 }}>پیام ها</Typography>
            <Chip
              size='small'
              label={`${unreadCount} جدید`}
              color='primary'
              sx={{ height: 20, fontSize: '0.75rem', fontWeight: 500, borderRadius: '10px' }}
            />
          </Box>
        </MenuItem>
        <ScrollWrapper>
          {messages.map(message => {
            return (
              <MenuItem key={message.id} onClick={() => handleMessageClick(message)}>
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    alt={message.data?.account?.last_name}
                    src={`${message.data?.account?.avatar}?width=120`}
                    imgProps={{ crossOrigin: 'use-credentials' }}
                  />
                  <Box sx={{ mx: 4, flex: '1 1', display: 'flex', overflow: 'hidden', flexDirection: 'column' }}>
                    <MenuItemTitle>{message.title}</MenuItemTitle>
                    <MenuItemSubtitle variant='body2'>{message.body}</MenuItemSubtitle>
                  </Box>
                  <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                    {fromNow(message.created_at)}
                  </Typography>
                </Box>
              </MenuItem>
            )
          })}
        </ScrollWrapper>
        <MenuItem
          disableRipple
          sx={{ py: 3.5, borderBottom: 0, borderTop: theme => `1px solid ${theme.palette.divider}` }}
        >
          {unreadCount ? (
            <Button fullWidth variant='outlined' onClick={handleTickUnreadMessagesAsRead}>
              ثبت همه پیام ها به عنوان خوانده شده
            </Button>
          ) : (
            <MenuItemTitle>شما تمامی پیام های خود را خوانده اید!</MenuItemTitle>
          )}
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

export default NotificationDropdown
