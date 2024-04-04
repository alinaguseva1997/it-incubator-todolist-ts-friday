import { handleServerNetworkError } from "common/utils/handleServerNetworkError"
import { appActions } from "app/app-reducer"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { todolistsAction, todolistsThunks } from "features/TodolistsList/todolists-reducer"
import { createAppAsyncThunk, handleServerAppError } from "common/utils"
import { TaskPriorities, TaskStatuses } from "common/enum/enum"
import { ResultCode, TaskType, todolistsAPI, UpdateTaskModelType } from "features/TodolistsList/todolists-api"

// types
export type UpdateDomainTaskModelType = {
  title?: string
  description?: string
  status?: TaskStatuses
  priority?: TaskPriorities
  startDate?: string
  deadline?: string
}
export type TasksStateType = {
  [key: string]: Array<TaskType>
}

const slice = createSlice({
  name: "tasks",
  initialState: {} as TasksStateType,
  reducers: {},
  extraReducers: (builder) => {
    // используется, когда нужно взять редьюсеры из других slice, или обработка положительного сценария санки (thunk.fulfilled)
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state[action.payload.todolistId] = action.payload.tasks //(action)
      }) //обработка положительного кейса
      .addCase(addTask.fulfilled, (state, action) => {
        state[action.payload.task.todoListId].unshift(action.payload.task)
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        const tasksForCurrentTodolist = state[action.payload.todolistId]
        const index = tasksForCurrentTodolist.findIndex((task) => task.id === action.payload.taskId)
        if (index !== -1) tasksForCurrentTodolist.splice(index, 1)
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const tasksForCurrentTodolist = state[action.payload.todolistId]
        const index = tasksForCurrentTodolist.findIndex((task) => task.id === action.payload.taskId)
        if (index !== -1)
          tasksForCurrentTodolist[index] = { ...tasksForCurrentTodolist[index], ...action.payload.domainModel }
      })
      .addCase(todolistsThunks.addTodolist.fulfilled, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(todolistsThunks.removeTodolist.fulfilled, (state, action) => {
        delete state[action.payload.id]
      })
      .addCase(todolistsThunks.fetchTodolists.fulfilled, (state, action) => {
        action.payload.todolists.forEach((tl) => {
          state[tl.id] = []
        })
      })
      .addCase(todolistsAction.clearTodosData, () => {
        return {}
      })
  },
})

// thunks
const fetchTasks = createAppAsyncThunk<
  { tasks: TaskType[]; todolistId: string }, //то, что возвращает санка
  string //то, что принимает в качестве аргумента
>("tasks/fetchTasks", async (todolistId, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI
  try {
    dispatch(appActions.setAppStatus({ status: "loading" }))
    const res = await todolistsAPI.getTasks(todolistId)
    dispatch(appActions.setAppStatus({ status: "succeeded" }))
    return { tasks: res.data.items, todolistId } // возвращаем то, что нужно добавить в стейт через кейс в редьюсере
  } catch (error) {
    handleServerNetworkError(error, dispatch) //обрабатывает ошибки
    return rejectWithValue(null) // это требует Toolkit, чтобы не было ошибок в обработке кейса, обязательно нужно что-то возвращать
  }
})

const addTask = createAppAsyncThunk<{ task: TaskType }, ArgAddTask>("tasks/addTask", async (arg, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI
  try {
    dispatch(appActions.setAppStatus({ status: "loading" }))
    const res = await todolistsAPI.createTask(arg.todolistId, arg.title)
    if (res.data.resultCode === ResultCode.success) {
      const task = res.data.data.item
      dispatch(appActions.setAppStatus({ status: "succeeded" }))
      return { task }
    } else {
      handleServerAppError(res.data, dispatch)
      return rejectWithValue(null)
    }
  } catch (error) {
    handleServerNetworkError(error, dispatch)
    return rejectWithValue(null)
  }
})

const removeTask = createAppAsyncThunk<ArgRemoveTask, ArgRemoveTask>("tasks/removeTask", async (arg, thunkAPI) => {
  const { dispatch, rejectWithValue } = thunkAPI
  try {
    dispatch(appActions.setAppStatus({ status: "loading" }))
    const res = await todolistsAPI.deleteTask(arg.todolistId, arg.taskId)
    if (res.data.resultCode === ResultCode.success) {
      dispatch(appActions.setAppStatus({ status: "succeeded" }))
      return arg
    } else {
      handleServerAppError(res.data, dispatch)
      return rejectWithValue(null)
    }
  } catch (error) {
    handleServerNetworkError(error, dispatch)
    return rejectWithValue(null)
  }
})

const updateTask = createAppAsyncThunk<ArgUpdateTask, ArgUpdateTask>("tasks/updateTask", async (arg, thunkAPI) => {
  const { dispatch, rejectWithValue, getState } = thunkAPI
  try {
    const state = getState()
    const task = state.tasks[arg.todolistId].find((t) => t.id === arg.taskId)
    if (!task) {
      return rejectWithValue(null)
    }

    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...arg.domainModel,
    }

    const res = await todolistsAPI.updateTask(arg.todolistId, arg.taskId, apiModel)
    if (res.data.resultCode === ResultCode.success) {
      return arg
    } else {
      handleServerAppError(res.data, dispatch)
      return rejectWithValue(null)
    }
  } catch (error) {
    handleServerNetworkError(error, dispatch)
    return rejectWithValue(null)
  }
})

export type ArgAddTask = { title: string; todolistId: string }
export type ArgRemoveTask = { taskId: string; todolistId: string }
export type ArgUpdateTask = { taskId: string; domainModel: UpdateDomainTaskModelType; todolistId: string }
export const tasksReducer = slice.reducer
export const tasksActions = slice.actions
export const tasksThunks = { fetchTasks, removeTask, addTask, updateTask }

// const initialState: TasksStateType = {}

// export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
//   switch (action.type) {
//     case "REMOVE-TASK":
//       return { ...state, [action.todolistId]: state[action.todolistId].filter((t) => t.id != action.taskId) }
//     case "ADD-TASK":
//       return { ...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]] }
//     case "UPDATE-TASK":
//       return {
//         ...state,
//         [action.todolistId]: state[action.todolistId].map((t) =>
//           t.id === action.taskId ? { ...t, ...action.model } : t,
//         ),
//       }
//     case "ADD-TODOLIST":
//       return { ...state, [action.todolist.id]: [] }
//     case "REMOVE-TODOLIST":
//       const copyState = { ...state }
//       delete copyState[action.id]
//       return copyState
//     case "SET-TODOLISTS": {
//       const copyState = { ...state }
//       action.todolists.forEach((tl) => {
//         copyState[tl.id] = []
//       })
//       return copyState
//     }
//     case "SET-TASKS":
//       return { ...state, [action.todolistId]: action.tasks }
//     case "CLEAR-DATA":
//       return {}
//     default:
//       return state
//   }
// }

// actions
// export const removeTaskAC = (taskId: string, todolistId: string) =>
//   ({ type: "REMOVE-TASK", taskId, todolistId }) as const
// export const addTaskAC = (task: TaskType) => ({ type: "ADD-TASK", task }) as const
// export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
//   ({ type: "UPDATE-TASK", model, todolistId, taskId }) as const
// export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) =>
//   ({ type: "SET-TASKS", tasks, todolistId }) as const

//thunks

// export const fetchTasksTC =
//   (todolistId: string): AppThunk =>
//   (dispatch: Dispatch) => {
//     dispatch(appActions.setAppStatus({ status: "loading" }))
//     todolistsAPI.getTasks(todolistId).then((res) => {
//       const tasks = res.data.items
//       dispatch(tasksActions.setTasks({ tasks, todolistId }))
//       dispatch(appActions.setAppStatus({ status: "succeeded" }))
//     })
//   }

// export const updateTaskTC =
//   (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string): AppThunk =>
//   (dispatch: Dispatch, getState: () => AppRootStateType) => {
//     const state = getState()
//     const task = state.tasks[todolistId].find((t) => t.id === taskId)
//     if (!task) {
//       //throw new Error("task not found in the state");
//       console.warn("task not found in the state")
//       return
//     }
//
//     const apiModel: UpdateTaskModelType = {
//       deadline: task.deadline,
//       description: task.description,
//       priority: task.priority,
//       startDate: task.startDate,
//       title: task.title,
//       status: task.status,
//       ...domainModel,
//     }
//
//     todolistsAPI
//       .updateTask(todolistId, taskId, apiModel)
//       .then((res) => {
//         if (res.data.resultCode === 0) {
//           dispatch(tasksActions.updateTask({ taskId, model: apiModel, todolistId }))
//         } else {
//           handleServerAppError(res.data, dispatch)
//         }
//       })
//       .catch((error) => {
//         handleServerNetworkError(error, dispatch)
//       })
//   }

// export const addTaskTC =
//   (title: string, todolistId: string): AppThunk =>
//   (dispatch: Dispatch) => {
//     dispatch(appActions.setAppStatus({ status: "loading" }))
//     todolistsAPI
//       .createTask(todolistId, title)
//       .then((res) => {
//         if (res.data.resultCode === 0) {
//           const task = res.data.data.item
//           dispatch(tasksActions.addTask({ task }))
//           dispatch(appActions.setAppStatus({ status: "succeeded" }))
//         } else {
//           handleServerAppError(res.data, dispatch)
//         }
//       })
//       .catch((error) => {
//         handleServerNetworkError(error, dispatch)
//       })
//   }

// export const removeTask =
//   (taskId: string, todolistId: string): AppThunk =>
//   (dispatch: Dispatch) => {
//     todolistsAPI.deleteTask(todolistId, taskId).then((res) => {
//       dispatch(tasksActions.removeTask({ taskId, todolistId }))
//     })
//   }

// type ActionsType =
//   | ReturnType<typeof removeTaskAC>
//   | ReturnType<typeof addTaskAC>
//   | ReturnType<typeof updateTaskAC>
//   | AddTodolistActionType
//   | RemoveTodolistActionType
//   | SetTodolistsActionType
//   | ReturnType<typeof setTasksAC>
//   | ClearDataActionType
// type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>
