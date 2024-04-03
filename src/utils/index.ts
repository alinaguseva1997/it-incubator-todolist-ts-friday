export { handleServerAppError } from "./handleServerAppError"
export { handleServerNetworkError } from "./handleServerNetworkError"
export { createAppAsyncThunk } from "./createAppAsyncThunk"

//re-export

//этот файл должен обязательно называться index, он нужен для того, чтобы сократить во всем проекте импорты, чтобы импорт был просто из utils
// до
// export { createAppAsyncThunk } from "./utils/createAppAsyncThunk"
// после
//export { createAppAsyncThunk } from "utils"
