import { AppDispatch, AppRootStateType } from "app/store"
import { handleServerNetworkError } from "common/utils/handle-server-network-error"
import { BaseThunkAPI } from "@reduxjs/toolkit/dist/createAsyncThunk"
import { appActions } from "app/app.reducer"
import { BaseResponseType } from "common/types"

/**

 Обрабатывает асинхронные операции с использованием блока try-catch внутри Thunk-действия.
 @template T - Тип возвращаемого значения функции logic.
 @param {BaseThunkAPI<AppRootStateType, unknown, AppDispatch, null | BaseResponseType>} thunkAPI - Объект API для Thunk-действия.
 @param {() => Promise<T>} logic - Функция, представляющая асинхронную логику, которая должна быть выполнена.
 @returns {Promise<T | ReturnType<typeof thunkAPI.rejectWithValue>>} - Промис, который разрешается значением, возвращенным функцией logic, или значением, отклоненным через thunkAPI.rejectWithValue.
 */
export const thunkTryCatch = async <T>(
  thunkAPI: BaseThunkAPI<AppRootStateType, unknown, AppDispatch, null | BaseResponseType>,
  logic: () => Promise<T>,
): Promise<T | ReturnType<typeof thunkAPI.rejectWithValue>> => {
  const { dispatch, rejectWithValue } = thunkAPI
  dispatch(appActions.setAppStatus({ status: "loading" }))
  try {
    return await logic()
  } catch (e) {
    handleServerNetworkError(e, dispatch)
    return rejectWithValue(null)
  } finally {
    dispatch(appActions.setAppStatus({ status: "idle" }))
  }
}
//Здесь мы передаем thunkAPI и функцию logic в thunkTryCatch. (logic - это именно положительный кейс, который сидит в ветке try)
//Функция logic - это функция, которую мы хотим выполнить с помощью try. Мы использовали анонимную функцию внутри thunkTryCatch для выполнения logic.
//Функция thunkTryCatch возвращает результат выполнения logic.
//Если во время выполнения logic произошла ошибка, мы обрабатываем ее в блоке catch. Затем мы заканчиваем выполнение thunkTryCatch, устанавливая статус приложения в первоначальное состояние idle.
// Это позволяет нам избежать дублирования кода и повторного использования catch блоков в каждом из thunk.
