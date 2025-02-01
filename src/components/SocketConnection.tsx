// ** React Imports
import { useEffect, useState } from 'react'

// ** Socket IO
import io, { Socket } from 'socket.io-client'

// ** Redux Imports
import { store } from '@/redux/store'
import { toastInfo } from '@/redux/slices/snackbarSlice'
import { selectIsLogin, isInternalUser } from '@/redux/slices/authSlice'
import { useSelector } from 'react-redux'
import { IMessage, addMessage, setDefaultCount, setBoardCount, setMessages } from '@/redux/slices/messageSlice'

// ** Hook Import
import { useSettings } from '@/hooks/useSettings'

function useSocket(isLogin: boolean, isNotUser: boolean) {
  const [socket, setSocket] = useState<Socket>()

  useEffect(() => {
    const url = new URL('', process.env.NEXT_PUBLIC_API_BASE_URL).origin
    const socketio = io(url, {
      withCredentials: true,
      path: process.env.NEXT_PUBLIC_SOCKET_API_PATH,
      autoConnect: false
    })

    if (isLogin && isNotUser) {
      socketio.connect()
      setSocket(socketio)
    }

    function cleanup() {
      socketio.disconnect()
    }

    return cleanup
  }, [])

  return socket
}

const SocketConnection = () => {
  // ** Hooks
  const { settings, saveSettings } = useSettings()

  // ** Global State
  const isLogin = useSelector(selectIsLogin)
  const isAccess = useSelector(isInternalUser)

  const { dispatch } = store

  const socket = useSocket(isLogin, isAccess)

  const newMessageHandler = (message: IMessage) => {
    dispatch(addMessage(message))
    dispatch(toastInfo(message?.body))
  }

  useEffect(() => {
    if (socket) {
      saveSettings({ ...settings, socket })

      socket.on('events', message => {
        const data = JSON.parse(message)

        const { key, value } = data

        if (key === 'new_message') newMessageHandler(value)
        else if (key === 'initial_message') {
          const { default_total, board_total, last_messages } = value

          dispatch(setDefaultCount(default_total))
          dispatch(setBoardCount(board_total))
          dispatch(setMessages(last_messages))
        }
      })
    }
  }, [socket])

  return <></>
}

export default SocketConnection
