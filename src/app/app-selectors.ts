import { AppRootStateType } from "app/store"

export const statusSelector = (state: AppRootStateType) => state.app.status
export const isInitializedSelector = (state: AppRootStateType) => state.app.isInitialized
export const errorSelector = (state: AppRootStateType) => state.app.error