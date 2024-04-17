import React, { useCallback, useEffect } from "react"
import { useSelector } from "react-redux"
import { FilterValuesType, todolistsActions, todolistsThunks } from "features/TodolistsList/todolists.reducer"
import { tasksThunks } from "features/TodolistsList/tasks.reducer"
import { Grid, Paper } from "@mui/material"
import { AddItemForm } from "common/components"
import { Todolist } from "./Todolist/Todolist"
import { Navigate } from "react-router-dom"
import { useActions, useAppDispatch } from "common/hooks"
import { selectIsLoggedIn } from "features/auth/auth.selectors"
import { selectTasks } from "features/TodolistsList/tasks.selectors"
import { selectTodolists } from "features/TodolistsList/todolists.selectors"
import { TaskStatuses } from "common/enums"

export const TodolistsList = () => {
  const todolists = useSelector(selectTodolists)
  const tasks = useSelector(selectTasks)
  const isLoggedIn = useSelector(selectIsLoggedIn)

  // const dispatch = useAppDispatch()
  const { fetchTodolists, removeTodolist, addTodolist, changeTodolistTitle } = useActions(todolistsThunks)
  const { addTask, removeTask, updateTask } = useActions(tasksThunks)
  const { changeTodolistFilter } = useActions(todolistsActions)

  useEffect(() => {
    if (!isLoggedIn) {
      return
    }
    fetchTodolists()
    // dispatch(todolistsThunks.fetchTodolists())
  }, [])

  const removeTaskCallback = useCallback(function (taskId: string, todolistId: string) {
    removeTask({ taskId, todolistId })
    // dispatch(tasksThunks.removeTask({ taskId, todolistId }))
  }, [])

  const addTaskCallback = useCallback(function (title: string, todolistId: string) {
    addTask({ title, todolistId })
    // dispatch(tasksThunks.addTask({ title, todolistId }))
  }, [])

  const changeStatus = useCallback(function (taskId: string, status: TaskStatuses, todolistId: string) {
    updateTask({ taskId, domainModel: { status }, todolistId })
  }, [])

  const changeTaskTitle = useCallback(function (taskId: string, title: string, todolistId: string) {
    updateTask({ taskId, domainModel: { title }, todolistId })
  }, [])

  const changeFilter = useCallback(function (filter: FilterValuesType, id: string) {
    changeTodolistFilter({ id, filter })
  }, [])

  const removeTodolistCallback = useCallback(function (id: string) {
    removeTodolist(id)
    // dispatch(todolistsThunks.removeTodolist(id))
  }, [])

  const changeTodolistTitleCallback = useCallback(function (id: string, title: string) {
    changeTodolistTitle({ id, title })
    // dispatch(todolistsThunks.changeTodolistTitle({ id, title }))
  }, [])

  const addTodolistCallback = useCallback((title: string) => {
    addTodolist(title)
    // dispatch(todolistsThunks.addTodolist(title))
  }, [])

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
                  removeTask={removeTaskCallback}
                  changeFilter={changeFilter}
                  addTask={addTaskCallback}
                  changeTaskStatus={changeStatus}
                  removeTodolist={removeTodolist}
                  changeTaskTitle={changeTaskTitle}
                  changeTodolistTitle={removeTodolistCallback}
                />
              </Paper>
            </Grid>
          )
        })}
      </Grid>
    </>
  )
}
