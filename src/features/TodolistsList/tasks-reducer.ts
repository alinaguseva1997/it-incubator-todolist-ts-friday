import { TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType } from "api/todolists-api"
import { Dispatch } from "redux"
import { AppRootStateType, AppThunk } from "app/store"
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils"
import { appActions } from "app/app-reducer"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { todolistsAction } from "features/TodolistsList/todolists-reducer"

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
  name: 'tasks',
  initialState: {} as TasksStateType,
  reducers: {
    removeTask: (state, action: PayloadAction<{taskId: string, todolistId: string}>) => {
      const tasksForCurrentTodolist = state[action.payload.todolistId]
      const index = tasksForCurrentTodolist.findIndex(task => task.id === action.payload.taskId)
      if (index !== -1) tasksForCurrentTodolist.splice(index, 1)
    },
    addTask: (state, action: PayloadAction<{task: TaskType}>) => {
      state[action.payload.task.todoListId].unshift(action.payload.task)
    },
    updateTask: (state, action: PayloadAction<{taskId: string, model: UpdateDomainTaskModelType, todolistId: string}>) => {
      const tasksForCurrentTodolist = state[action.payload.todolistId]
      const index = tasksForCurrentTodolist.findIndex(task => task.id === action.payload.taskId)
      if (index !== -1) tasksForCurrentTodolist[index] = { ...tasksForCurrentTodolist[index], ...action.payload.model}
    },
    setTasks: (state, action: PayloadAction<{tasks: Array<TaskType>, todolistId: string}>) => {
      state[action.payload.todolistId] = action.payload.tasks
    }
  },
  extraReducers: (builder) => {  // используется, когда нужно взять редьюсеры из других slice
    builder
      .addCase(todolistsAction.addTodolist, (state, action) => {
      state[action.payload.todolist.id] = []
    })
      .addCase(todolistsAction.removeTodolist, (state, action) => {
        delete state[action.payload.id]
    })
      .addCase(todolistsAction.setTodolists, (state, action) => {
      action.payload.todolists.forEach(tl => {
        state[tl.id] = []
      })
    })
      .addCase(todolistsAction.clearTodosData, () => {
        return {}
      })
  }
})
export const tasksReducer = slice.reducer
export const tasksActions = slice.actions

// thunks
export const fetchTasksTC = (todolistId: string): AppThunk => (dispatch: Dispatch) => {
  dispatch(appActions.setAppStatus({status: "loading"}))
  todolistsAPI.getTasks(todolistId).then((res) => {
    const tasks = res.data.items
    dispatch(tasksActions.setTasks({tasks, todolistId}))
    dispatch(appActions.setAppStatus({status: "succeeded"}))
  })
}
export const removeTaskTC = (taskId: string, todolistId: string): AppThunk => (dispatch: Dispatch) => {
  todolistsAPI.deleteTask(todolistId, taskId).then((res) => {
    dispatch(tasksActions.removeTask({taskId,todolistId}))
  })
}
export const addTaskTC = (title: string, todolistId: string): AppThunk =>
  (dispatch: Dispatch) => {
    dispatch(appActions.setAppStatus({status: "loading"}))
    todolistsAPI
      .createTask(todolistId, title)
      .then((res) => {
        if (res.data.resultCode === 0) {
          const task = res.data.data.item
          dispatch(tasksActions.addTask({task}))
          dispatch(appActions.setAppStatus({status: "succeeded"}))
        } else {
          handleServerAppError(res.data, dispatch)
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch)
      })
  }
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string): AppThunk =>
  (dispatch: Dispatch, getState: () => AppRootStateType) => {
    const state = getState()
    const task = state.tasks[todolistId].find((t) => t.id === taskId)
    if (!task) {
      //throw new Error("task not found in the state");
      console.warn("task not found in the state")
      return
    }

    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...domainModel,
    }

    todolistsAPI.updateTask(todolistId, taskId, apiModel)
      .then((res) => {
        if (res.data.resultCode === 0) {
          dispatch(tasksActions.updateTask({taskId,model: apiModel,todolistId}))
        } else {
          handleServerAppError(res.data, dispatch)
        }
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch)
      })
  }











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
