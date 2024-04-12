import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type RequestStatusType = "idle" | "loading" | "succeeded" | "failed"
export type InitialStateType = ReturnType<typeof slice.getInitialState>

const slice = createSlice({
  name: "app",
  initialState: {
    status: "idle" as RequestStatusType,
    error: null as string | null, //чтобы не ругался TS(as - воспринимай как)
    isInitialized: false,
  },
  reducers: {
    setAppError: (state, action: PayloadAction<{ error: string | null }>) => {
      state.error = action.payload.error
    },
    setAppStatus: (state, action: PayloadAction<{ status: RequestStatusType }>) => {
      state.status = action.payload.status
    },
    setAppInitialized: (state, action: PayloadAction<{ isInitialized: boolean }>) => {
      state.isInitialized = action.payload.isInitialized
    },
  },
})
export const appReducer = slice.reducer //reducer для использования снаружи
export const appActions = slice.actions

export type SetAppErrorActionType = ReturnType<typeof slice.actions.setAppError>
export type SetAppStatusActionType = ReturnType<typeof slice.actions.setAppStatus>

type ActionsType = SetAppErrorActionType | SetAppStatusActionType | ReturnType<typeof slice.actions.setAppInitialized>
