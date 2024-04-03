import { tasksReducer, TasksStateType, tasksThunks } from "./tasks-reducer"
import { todolistsAction } from "features/TodolistsList/todolists-reducer"
import { TaskPriorities, TaskStatuses } from "common/enum/enum"
import { TaskType } from "features/TodolistsList/todolists-api"

let startState: TasksStateType = {}
beforeEach(() => {
  startState = {
    todolistId1: [
      {
        id: "1",
        title: "CSS",
        status: TaskStatuses.New,
        todoListId: "todolistId1",
        description: "",
        startDate: "",
        deadline: "",
        addedDate: "",
        order: 0,
        priority: TaskPriorities.Low,
      },
      {
        id: "2",
        title: "JS",
        status: TaskStatuses.Completed,
        todoListId: "todolistId1",
        description: "",
        startDate: "",
        deadline: "",
        addedDate: "",
        order: 0,
        priority: TaskPriorities.Low,
      },
      {
        id: "3",
        title: "React",
        status: TaskStatuses.New,
        todoListId: "todolistId1",
        description: "",
        startDate: "",
        deadline: "",
        addedDate: "",
        order: 0,
        priority: TaskPriorities.Low,
      },
    ],
    todolistId2: [
      {
        id: "1",
        title: "bread",
        status: TaskStatuses.New,
        todoListId: "todolistId2",
        description: "",
        startDate: "",
        deadline: "",
        addedDate: "",
        order: 0,
        priority: TaskPriorities.Low,
      },
      {
        id: "2",
        title: "milk",
        status: TaskStatuses.Completed,
        todoListId: "todolistId2",
        description: "",
        startDate: "",
        deadline: "",
        addedDate: "",
        order: 0,
        priority: TaskPriorities.Low,
      },
      {
        id: "3",
        title: "tea",
        status: TaskStatuses.New,
        todoListId: "todolistId2",
        description: "",
        startDate: "",
        deadline: "",
        addedDate: "",
        order: 0,
        priority: TaskPriorities.Low,
      },
    ],
  }
})

test("correct task should be deleted from correct array", () => {
  // 1 параметр - то, что санка возвращает
  // 2 параметр - метаданные, данные о данных. Напрямую не используются, но могут пригодиться для теста.В нашем случае он никак не влияет на тест
  // 3 параметр - ид, которую принимает наш тест
  const payload = { todolistId: "2", taskId: "todolistId2" }
  const action = tasksThunks.removeTask.fulfilled(payload, "requestId", payload)

  const endState = tasksReducer(startState, action)

  expect(endState["todolistId1"].length).toBe(3)
  expect(endState["todolistId2"].length).toBe(2)
  expect(endState["todolistId2"].every((t) => t.id != "2")).toBeTruthy()
})
test("correct task should be added to correct array", () => {
  const task = {
    todoListId: "todolistId2",
    title: "juce",
    status: TaskStatuses.New,
    addedDate: "",
    deadline: "",
    description: "",
    order: 0,
    priority: 0,
    startDate: "",
    id: "id exists",
  }

  const action = tasksThunks.addTask.fulfilled({ task }, "requestId", {
    title: task.title,
    todolistId: task.todoListId,
  })

  const endState = tasksReducer(startState, action)

  expect(endState["todolistId1"].length).toBe(3)
  expect(endState["todolistId2"].length).toBe(4)
  expect(endState["todolistId2"][0].id).toBeDefined()
  expect(endState["todolistId2"][0].title).toBe("juce")
  expect(endState["todolistId2"][0].status).toBe(TaskStatuses.New)
})
test("status of specified task should be changed", () => {
  const payload = {
    taskId: "2",
    domainModel: { status: TaskStatuses.New },
    todolistId: "todolistId2",
  }
  const action = tasksThunks.updateTask.fulfilled(payload, "requestId", payload)

  const endState = tasksReducer(startState, action)

  expect(endState["todolistId1"][1].status).toBe(TaskStatuses.Completed)
  expect(endState["todolistId2"][1].status).toBe(TaskStatuses.New)
})
test("title of specified task should be changed", () => {
  const payload = { taskId: "2", domainModel: { title: "yogurt" }, todolistId: "todolistId2" }
  const action = tasksThunks.updateTask.fulfilled(payload, "requestId", payload)

  const endState = tasksReducer(startState, action)

  expect(endState["todolistId1"][1].title).toBe("JS")
  expect(endState["todolistId2"][1].title).toBe("yogurt")
  expect(endState["todolistId2"][0].title).toBe("bread")
})
test("new array should be added when new todolist is added", () => {
  const action = todolistsAction.addTodolist({
    todolist: {
      id: "blabla",
      title: "new todolist",
      order: 0,
      addedDate: "",
    },
  })

  const endState = tasksReducer(startState, action)

  const keys = Object.keys(endState)
  const newKey = keys.find((k) => k != "todolistId1" && k != "todolistId2")
  if (!newKey) {
    throw Error("new key should be added")
  }

  expect(keys.length).toBe(3)
  expect(endState[newKey]).toEqual([])
})
test("propertry with todolistId should be deleted", () => {
  const action = todolistsAction.removeTodolist({ id: "todolistId2" })

  const endState = tasksReducer(startState, action)

  const keys = Object.keys(endState)

  expect(keys.length).toBe(1)
  expect(endState["todolistId2"]).not.toBeDefined()
})

test("empty arrays should be added when we set todolists", () => {
  const action = todolistsAction.setTodolists({
    todolists: [
      { id: "1", title: "title 1", order: 0, addedDate: "" },
      { id: "2", title: "title 2", order: 0, addedDate: "" },
    ],
  })

  const endState = tasksReducer({}, action)

  const keys = Object.keys(endState)

  expect(keys.length).toBe(2)
  expect(endState["1"]).toBeDefined()
  expect(endState["2"]).toBeDefined()
})
test("tasks should be added for todolist", () => {
  // tasksThunks.fetchTasks.fulfilled - экшн берется из санки
  // 1 параметр - то, что санка возвращает
  // 2 параметр - метаданные, данные о данных. Напрямую не используются, но могут пригодиться для теста.В нашем случае он никак не влияет на тест
  // 3 параметр - ид, которую принимает наш тест

  // 1 variant
  //  const action = tasksThunks.fetchTasks.fulfilled(
  //    { tasks: startState["todolistId1"], todolistId: "todolistId1" },
  //    "requestId",
  //    "todolistId1",
  //  )

  //2 variant
  type FetchTasksActionType = {
    type: string
    payload: { tasks: TaskType[]; todolistId: string }
  }

  const action: FetchTasksActionType = {
    type: tasksThunks.fetchTasks.fulfilled.type,
    payload: { tasks: startState["todolistId1"], todolistId: "todolistId1" },
  }

  const endState = tasksReducer(
    {
      todolistId2: [],
      todolistId1: [],
    },
    action,
  )

  expect(endState["todolistId1"].length).toBe(3)
  expect(endState["todolistId2"].length).toBe(0)
})
