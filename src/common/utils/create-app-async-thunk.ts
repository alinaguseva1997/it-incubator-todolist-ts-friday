import { AppDispatch, AppRootStateType } from "app/store"
import { createAsyncThunk } from "@reduxjs/toolkit"
import { BaseResponseType } from "common/types"

/**
Создает асинхронное Thunk-действие для приложения.
  @template AppRootStateType - Тип корневого состояния приложения.
  @template AppDispatch - Тип dispatch.
  @template BaseResponseType - Тип базового ответа или значения, которое может быть отклонено.
*/
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: AppRootStateType
  dispatch: AppDispatch
  rejectValue: BaseResponseType | null
}>()
