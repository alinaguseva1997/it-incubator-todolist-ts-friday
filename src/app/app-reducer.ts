import { Dispatch } from "redux"
import { authAPI } from "api/todolists-api"
import { authActions } from "features/Login/auth-reducer"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppThunk } from "app/store"

export type RequestStatusType = "idle" | "loading" | "succeeded" | "failed"
export type InitialStateType = ReturnType<typeof slice.getInitialState>

const slice = createSlice({
  name: 'app' ,
  initialState: {
    status: "idle" as RequestStatusType,
    error: null as string | null, //чтобы не ругался TS(as - воспринимай как)
    isInitialized: false,
  },
  reducers: {
    setAppError: (state, action: PayloadAction<{error: string | null}>) => {
      state.error = action.payload.error
    },
    setAppStatus: (state, action: PayloadAction<{status: RequestStatusType}>) => {
      state.status = action.payload.status
    },
    setAppInitialized: (state, action: PayloadAction<{isInitialized: boolean}>) => {
      state.isInitialized = action.payload.isInitialized
    }
  }
})
export const appReducer = slice.reducer //reducer для использования снаружи
export const appActions = slice.actions

export const initializeAppTC = (): AppThunk => (dispatch: Dispatch) => {
  authAPI.me().then((res) => {
    if (res.data.resultCode === 0) {
      dispatch(authActions.setIsLoggedIn({isLoggedIn: true}))
    } else {
    }
    dispatch(appActions.setAppInitialized({isInitialized: true}))
  })
}










// const initialState: InitialStateType = {
//   status: "idle",
//   error: null,
//   isInitialized: false,
// }

// export const appReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
//   switch (action.type) {
//     case "APP/SET-STATUS":
//       return { ...state, status: action.status }
//     case "APP/SET-ERROR":
//       return { ...state, error: action.error }
//     case "APP/SET-IS-INITIALIED":
//       return { ...state, isInitialized: action.value }
//     default:
//       return { ...state }
//   }
// }

// export type InitialStateType = {
//   // происходит ли сейчас взаимодействие с сервером
//   status: RequestStatusType
//   // если ошибка какая-то глобальная произойдёт - мы запишем текст ошибки сюда
//   error: string | null
//   // true когда приложение проинициализировалось (проверили юзера, настройки получили и т.д.)
//   isInitialized: boolean
// }

// export const setAppErrorAC = (error: string | null) => ({ type: "APP/SET-ERROR", error }) as const
// export const setAppStatusAC = (status: RequestStatusType) => ({ type: "APP/SET-STATUS", status }) as const
// export const setAppInitializedAC = (value: boolean) => ({ type: "APP/SET-IS-INITIALIED", value }) as const

export type SetAppErrorActionType = ReturnType<typeof slice.actions.setAppError>
export type SetAppStatusActionType = ReturnType<typeof slice.actions.setAppStatus>

type ActionsType = SetAppErrorActionType | SetAppStatusActionType | ReturnType<typeof slice.actions.setAppInitialized>
