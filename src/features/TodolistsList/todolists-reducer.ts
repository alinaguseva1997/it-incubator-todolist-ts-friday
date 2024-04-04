import { Dispatch } from "redux"
import { appActions, RequestStatusType } from "app/app-reducer"
import { handleServerNetworkError } from "common/utils/handleServerNetworkError"
import { AppThunk } from "app/store"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { tasksThunks } from "features/TodolistsList/tasks-reducer"
import { ResultCode, todolistsAPI, TodolistType } from "features/TodolistsList/todolists-api"
import { createAppAsyncThunk, handleServerAppError } from "common/utils"

export type FilterValuesType = "all" | "active" | "completed"
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}

const slice = createSlice({
  name: "todolists",
  initialState: [] as TodolistDomainType[],
  reducers: {
    changeTodolistFilter: (state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) => {
      const index = state.findIndex((todo) => todo.id === action.payload.id)
      if (index !== -1) state[index].filter = action.payload.filter
    },
    changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string; status: RequestStatusType }>) => {
      const index = state.findIndex((todo) => todo.id === action.payload.id)
      if (index !== -1) state[index].entityStatus = action.payload.status

      // 2 вариант
      // const todo = state.find(todo => todo.id === action.payload.id)
      // if (todo) {
      //   todo.entityStatus = action.payload.status
      // }
    },
    clearTodosData: () => {
      return [] // возвращаем новый стейт
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodolists.fulfilled, (state, action) => {
        return action.payload.todolists.forEach((tl) => {
          state.push({ ...tl, filter: "all", entityStatus: "idle" })
        })
        // в этом случае мы использовали return, потому что мы не можем сделать так:
        // state = action.payload.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }))
        // напрямую стейт перезаписывать нельзя(док-ция), поэтому мы возвращаем НОВЫЙ стейт
        // 2 вариант
        // return action.payload.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }))
      })
      .addCase(removeTodolist.fulfilled, (state, action) => {
        const index = state.findIndex((todo) => todo.id === action.payload.id)
        if (index !== -1) state.splice(index, 1)
      })
      .addCase(addTodolist.fulfilled, (state, action) => {
        state.unshift({ ...action.payload.todolist, filter: "all", entityStatus: "idle" })
      })
      .addCase(changeTodolistTitle.fulfilled, (state, action) => {
        const index = state.findIndex((todo) => todo.id === action.payload.id)
        if (index !== -1) state[index].title = action.payload.title
      })
  },
})

// thunks
export const fetchTodolists = createAppAsyncThunk<{ todolists: TodolistType[] }, void>(
  "todolists/fetchTodolists",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }))
      const res = await todolistsAPI.getTodolists()
      dispatch(appActions.setAppStatus({ status: "succeeded" }))
      const todos = res.data
      todos.forEach((tl) => {
        dispatch(tasksThunks.fetchTasks(tl.id))
      })
      return { todolists: res.data }
    } catch (error) {
      handleServerNetworkError(error, dispatch)
      return rejectWithValue(null)
    }
  },
)
export const removeTodolist = createAppAsyncThunk<{ id: string }, string>(
  "todolists/removeTodolist",
  async (todolistId: string, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }))
      dispatch(todolistsAction.changeTodolistEntityStatus({ id: todolistId, status: "loading" }))
      const res = await todolistsAPI.deleteTodolist(todolistId)
      dispatch(appActions.setAppStatus({ status: "succeeded" }))
      return { id: todolistId }
    } catch (error) {
      handleServerNetworkError(error, dispatch)
      return rejectWithValue(null)
    }
  },
)
export const addTodolist = createAppAsyncThunk<{ todolist: TodolistType }, string>(
  "todolists/addTodolist",
  async (title: string, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }))
      const res = await todolistsAPI.createTodolist(title)
      dispatch(appActions.setAppStatus({ status: "succeeded" }))
      return { todolist: res.data.data.item }
    } catch (error) {
      handleServerNetworkError(error, dispatch)
      return rejectWithValue(null)
    }
  },
)
export const changeTodolistTitle = createAppAsyncThunk<ArgAddTodoTitle, ArgAddTodoTitle>(
  "todolists/changeTodolistTitle",
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      const res = await todolistsAPI.updateTodolist(arg.id, arg.title)
      if (res.data.resultCode === ResultCode.success) {
        return arg
      } else {
        handleServerAppError(res.data, dispatch)
        return rejectWithValue(null)
      }
    } catch (error) {
      handleServerNetworkError(error, dispatch) //обрабатывает ошибки
      return rejectWithValue(null)
    }
  },
)

export type ArgAddTodoTitle = { id: string; title: string }
export const todolistsReducer = slice.reducer
export const todolistsAction = slice.actions
export const todolistsThunks = { fetchTodolists, removeTodolist, addTodolist, changeTodolistTitle }

// types
// export type AddTodolistActionType = ReturnType<typeof addTodolistAC>
// export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>
// export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>
// export type ClearDataActionType = ReturnType<typeof clearTodosDataAC>
// type ActionsType =
//   | RemoveTodolistActionType
//   | AddTodolistActionType
//   | ReturnType<typeof changeTodolistTitleAC>
//   | ReturnType<typeof changeTodolistFilterAC>
//   | SetTodolistsActionType
//   | ReturnType<typeof changeTodolistEntityStatusAC>
//   | ClearDataActionType
// type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>
// const initialState: Array<TodolistDomainType> = []
// export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
//   switch (action.type) {
//     case "REMOVE-TODOLIST":
//       return state.filter((tl) => tl.id != action.id)
//     case "ADD-TODOLIST":
//       return [{ ...action.todolist, filter: "all", entityStatus: "idle" }, ...state]
//
//     case "CHANGE-TODOLIST-TITLE":
//       return state.map((tl) => (tl.id === action.id ? { ...tl, title: action.title } : tl))
//     case "CHANGE-TODOLIST-FILTER":
//       return state.map((tl) => (tl.id === action.id ? { ...tl, filter: action.filter } : tl))
//     case "CHANGE-TODOLIST-ENTITY-STATUS":
//       return state.map((tl) => (tl.id === action.id ? { ...tl, entityStatus: action.status } : tl))
//     case "SET-TODOLISTS":
//       return action.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }))
//     case "CLEAR-DATA":
//       return []
//     default:
//       return state
//   }
// }

// actions
// export const removeTodolistAC = (id: string) => ({ type: "REMOVE-TODOLIST", id }) as const
// export const addTodolistAC = (todolist: TodolistType) => ({ type: "ADD-TODOLIST", todolist }) as const
// export const changeTodolistTitleAC = (id: string, title: string) =>({type: "CHANGE-TODOLIST-TITLE",id,title,}) as const
// export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) =>({type: "CHANGE-TODOLIST-FILTER",id,filter,}) as const
// export const changeTodolistEntityStatusAC = (id: string, status: RequestStatusType) =>({type: "CHANGE-TODOLIST-ENTITY-STATUS",id,status,}) as const
// export const setTodolistsAC = (todolists: Array<TodolistType>) => ({ type: "SET-TODOLISTS", todolists }) as const
// export const clearTodosDataAC = () => ({ type: "CLEAR-DATA" }) as const //зачищаем данные после вылогинивания

//thunks
// export const fetchTodolistsTC = (): AppThunk => {
//   return (dispatch) => {
//     dispatch(appActions.setAppStatus({ status: "loading" }))
//     todolistsAPI
//       .getTodolists()
//       .then((res) => {
//         dispatch(todolistsAction.setTodolists({ todolists: res.data }))
//         dispatch(appActions.setAppStatus({ status: "succeeded" }))
//         return res.data
//       })
//       .then((todos) => {
//         todos.forEach((tl) => {
//           dispatch(tasksThunks.fetchTasks(tl.id))
//         })
//       })
//       .catch((error) => {
//         handleServerNetworkError(error, dispatch)
//       })
//   }
// }
// export const removeTodolistTC = (todolistId: string): AppThunk => {
//   return (dispatch: Dispatch) => {
//     //изменим глобальный статус приложения, чтобы вверху полоса побежала
//     dispatch(appActions.setAppStatus({ status: "loading" }))
//     //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
//     dispatch(todolistsAction.changeTodolistEntityStatus({ id: todolistId, status: "loading" }))
//     todolistsAPI.deleteTodolist(todolistId).then((res) => {
//       dispatch(todolistsAction.removeTodolist({ id: todolistId }))
//       //скажем глобально приложению, что асинхронная операция завершена
//       dispatch(appActions.setAppStatus({ status: "succeeded" }))
//     })
//   }
// }
// export const addTodolistTC = (title: string): AppThunk => {
//   return (dispatch: Dispatch) => {
//     dispatch(appActions.setAppStatus({ status: "loading" }))
//     todolistsAPI.createTodolist(title).then((res) => {
//       dispatch(todolistsAction.addTodolist({ todolist: res.data.data.item }))
//       dispatch(appActions.setAppStatus({ status: "succeeded" }))
//     })
//   }
// }
// export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
//   return (dispatch: Dispatch) => {
//     todolistsAPI.updateTodolist(id, title).then((res) => {
//       dispatch(todolistsAction.changeTodolistTitle({ id, title }))
//     })
//   }
// }
