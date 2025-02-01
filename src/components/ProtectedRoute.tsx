// ** React Imports
import { ReactNode } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** Redux Imports
import { useSelector } from 'react-redux'
import { selectIsLogin } from '@/redux/slices/authSlice'

// check if you are on the client (browser) or server
const isBrowser = () => typeof window !== 'undefined'

const ProtectedRoute = (props: { children: ReactNode }) => {
  // ** Props
  const { children } = props

  // ** Hook
  const router = useRouter()

  // ** Global State
  const isLogin = useSelector(selectIsLogin)

  const unprotectedRoutes = ['/login']

  const pathIsProtected = unprotectedRoutes.indexOf(router.pathname) === -1

  if (isBrowser() && !isLogin && pathIsProtected) {
    router.push('/login')
  }

  return <div>{children}</div>
}

export default ProtectedRoute
