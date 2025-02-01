import {
  configureStore,
  ThunkAction,
  Action,
  combineReducers,
  Reducer,
  CombinedState,
  AnyAction
} from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'

import storage from 'redux-persist/lib/storage'
import authReducer, { AuthState } from './slices/authSlice'
import snackbarReducer, { SnackbarState } from './slices/snackbarSlice'
import counterReducer, { CounterState } from './slices/counterSlice'
import mahdadReducer, { MahdadState } from './slices/mahdadSlice'
import cardReducer, { CartState } from './slices/cartSlice'
import settingReducer, { SettingState } from './slices/settingSlice'
import contactReducer, { ContactState } from './slices/contactSlice'
import messageReducer, { MessageState } from './slices/messageSlice'
import productReducer, { ProductState } from './slices/productSlice'

const rootReducer: Reducer<
  CombinedState<{
    auth: AuthState
    snackbar: SnackbarState
    counter: CounterState
    mahdad: MahdadState
    cart: CartState
    setting: SettingState
    contact: ContactState
    message: MessageState
    product: ProductState
  }>,
  AnyAction
> = combineReducers({
  auth: authReducer,
  snackbar: snackbarReducer,
  counter: counterReducer,
  mahdad: mahdadReducer,
  cart: cardReducer,
  setting: settingReducer,
  contact: contactReducer,
  message: messageReducer,
  product: productReducer
})

const persistConfig = {
  key: 'root',
  storage,

  whitelist: ['auth', 'cart']
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
})

export const persistor = persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

//
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>
