// ** React Imports
import { useState, SyntheticEvent, Fragment, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import { Box, Menu, Badge, Avatar, MenuItem, Typography, Stack, Button } from '@mui/material'
import { styled } from '@mui/material/styles'

// ** Icons Imports
import LogoutVariant from 'mdi-material-ui/LogoutVariant'

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

// ** Services Import
import AuthService from '@/services/auth.service'

// ** Redux Imports
import { useSelector } from 'react-redux'
import { selectAccount } from '@/redux/slices/authSlice'
import { resetCart } from '@/redux/slices/cartSlice'
import { store } from '@/redux/store'

// ** Services Import
import BasicService from '@/services/basic.service'

const UserDropdown = () => {
  // ** States
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)
  const [balance, setBalance] = useState<number>(0)

  // ** Hooks
  const router = useRouter()

  // ** Stores
  const account = useSelector(selectAccount)

  const { dispatch } = store

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = async (url?: string, logout?: boolean) => {
    if (url) {
      router.push(url)
    }
    setAnchorEl(null)

    if (logout) {
      try {
        await AuthService.logout()
        dispatch(resetCart())
      } catch (e) {}
    }
  }

  const handleUserSetting = () => {
    router.push('/account-settings')
  }

  useEffect(() => {
    const fetchData = async () => {
      const myWallet = await BasicService.getMyWallet()
      setBalance(myWallet.balance)
    }

    fetchData()
  }, [])

  return (
    <Fragment>
      <Badge
        overlap='circular'
        onClick={handleDropdownOpen}
        sx={{ ml: 2, cursor: 'pointer' }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar
          alt={account.full_name}
          onClick={handleDropdownOpen}
          sx={{ width: '2.5rem', height: '2.5rem' }}
          src={`${account.avatar}?width=120`}
          imgProps={{ crossOrigin: 'use-credentials' }}
        />
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 230, marginTop: 4 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Button fullWidth onClick={handleUserSetting}>
          <Box sx={{ pt: 2, pb: 3, px: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Badge
                overlap='circular'
                badgeContent={<BadgeContentSpan />}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <Avatar
                  alt={account.full_name}
                  sx={{ width: '2.5rem', height: '2.5rem' }}
                  src={`${account.avatar}?width=120`}
                  imgProps={{ crossOrigin: 'use-credentials' }}
                />
              </Badge>
              <Box sx={{ display: 'flex', marginLeft: 3, alignItems: 'flex-start', flexDirection: 'column' }}>
                <Typography sx={{ fontWeight: 600 }}>{account.full_name}</Typography>
                <Typography variant='body2' sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>
                  {account.full_name}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Button>

        {/* <Divider sx={{ mt: 0, mb: 1 }} />
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <AccountOutline sx={{ marginRight: 2 }} />
            Profile
          </Box>
        </MenuItem>
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <EmailOutline sx={{ marginRight: 2 }} />
            Inbox
          </Box>
        </MenuItem>
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <MessageOutline sx={{ marginRight: 2 }} />
            Chat
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <CogOutline sx={{ marginRight: 2 }} />
            Settings
          </Box>
        </MenuItem>
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <CurrencyUsd sx={{ marginRight: 2 }} />
            Pricing
          </Box>
        </MenuItem>
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <HelpCircleOutline sx={{ marginRight: 2 }} />
            FAQ
          </Box>
        </MenuItem>
        <Divider /> */}

        <MenuItem sx={{ py: 2 }} onClick={() => handleDropdownClose('/wallet/transactions', false)}>
          <Button variant='outlined' fullWidth>
            <Stack direction='row' spacing={2}>
              <Typography>موجودی</Typography>
              <Typography>{new Intl.NumberFormat().format(balance)}</Typography>
              <Typography>ریال</Typography>
            </Stack>
          </Button>
        </MenuItem>

        <MenuItem sx={{ py: 2 }} onClick={() => handleDropdownClose('/login', true)}>
          <LogoutVariant sx={{ marginRight: 2, fontSize: '1.375rem', color: 'text.secondary' }} />
          خروج
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

export default UserDropdown
