// ** MUI Imports
import IconButton from '@mui/material/IconButton'

// ** Icons Imports
import Login from 'mdi-material-ui/Login'

// ** Next Imports
import Link from 'next/link'

const UserLogin = () => {
  return (
    <Link passHref href={'/login'}>
      <IconButton color='inherit' aria-haspopup='true'>
        <Login />
      </IconButton>
    </Link>
  )
}

export default UserLogin
