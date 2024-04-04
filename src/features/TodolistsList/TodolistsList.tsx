import React, { useCallback, useEffect } from "react"
import { useSelector } from "react-redux"
import { AppRootStateType } from "app/store"
import {
  fetchTodolists,
  FilterValuesType,
  TodolistDomainType,
  todolistsAction,
  todolistsThunks,
} from "./todolists-reducer"
import { TasksStateType, tasksThunks } from "./tasks-reducer"
import { Grid, Paper } from "@mui/material"
import { Todolist } from "./Todolist/Todolist"
import { Navigate } from "react-router-dom"
import { useAppDispatch } from "common/hooks/useAppDispatch"
import { todolistsSelector } from "features/TodolistsList/todolists-selectors"
import { isLoggedInSelector } from "features/Login/auth-selectors"
import { tasksSelector } from "features/TodolistsList/tasks-selectors"
import { TaskStatuses } from "common/enum/enum"
import { AddItemForm } from "common/components/AddItemForm"

type PropsType = {
  demo?: boolean
}

export const TodolistsList: React.FC<PropsType> = ({ demo = false }) => {
  const todolists = useSelector<AppRootStateType, Array<TodolistDomainType>>(todolistsSelector)
  const tasks = useSelector<AppRootStateType, TasksStateType>(tasksSelector)
  const isLoggedIn = useSelector<AppRootStateType, boolean>(isLoggedInSelector)

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (demo || !isLoggedIn) {
      return
    }
    dispatch(fetchTodolists())
  }, [])

  const removeTask = useCallback(function (taskId: string, todolistId: string) {
    dispatch(tasksThunks.removeTask({ taskId, todolistId }))
  }, [])

  const addTask = useCallback(function (title: string, todolistId: string) {
    dispatch(tasksThunks.addTask({ title, todolistId }))
  }, [])

  const changeStatus = useCallback(function (taskId: string, status: TaskStatuses, todolistId: string) {
    dispatch(tasksThunks.updateTask({ taskId, domainModel: { status }, todolistId }))
  }, [])

  const changeTaskTitle = useCallback(function (taskId: string, newTitle: string, todolistId: string) {
    dispatch(tasksThunks.updateTask({ taskId, domainModel: { title: newTitle }, todolistId }))
  }, [])

  const changeFilter = useCallback(function (value: FilterValuesType, todolistId: string) {
    dispatch(todolistsAction.changeTodolistFilter({ id: todolistId, filter: value }))
  }, [])

  const removeTodolist = useCallback(function (id: string) {
    dispatch(todolistsThunks.removeTodolist(id))
  }, [])

  const changeTodolistTitle = useCallback(function (id: string, title: string) {
    dispatch(todolistsThunks.changeTodolistTitle({ id, title }))
  }, [])

  const addTodolist = useCallback(
    (title: string) => {
      dispatch(todolistsThunks.addTodolist(title))
    },
    [dispatch],
  )

  if (!isLoggedIn) {
    return <Navigate to={"/login"} />
  }

  return (
    <>
      <Grid container style={{ padding: "20px" }}>
        <AddItemForm addItem={addTodolist} />
      </Grid>
      <Grid container spacing={3}>
        {todolists.map((tl) => {
          let allTodolistTasks = tasks[tl.id]

          return (
            <Grid item key={tl.id}>
              <Paper style={{ padding: "10px" }}>
                <Todolist
                  todolist={tl}
                  tasks={allTodolistTasks}
                  removeTask={removeTask}
                  changeFilter={changeFilter}
                  addTask={addTask}
                  changeTaskStatus={changeStatus}
                  removeTodolist={removeTodolist}
                  changeTaskTitle={changeTaskTitle}
                  changeTodolistTitle={changeTodolistTitle}
                  demo={demo}
                />
              </Paper>
            </Grid>
          )
        })}
      </Grid>
    </>
  )
}
