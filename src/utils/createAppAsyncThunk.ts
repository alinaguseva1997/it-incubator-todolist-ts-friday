import { createAsyncThunk } from "@reduxjs/toolkit"
import { AppDispatch, AppRootStateType } from "app/store"

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: AppRootStateType
  dispatch: AppDispatch
  rejectValue: null
  //типизация наших парметров из ThunkAPI, которые мы используем в санке
}>()
