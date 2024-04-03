export { handleServerAppError } from "common/utils/handleServerAppError"
export { handleServerNetworkError } from "common/utils/handleServerNetworkError"
export { createAppAsyncThunk } from "common/utils/createAppAsyncThunk"

//re-export

//этот файл должен обязательно называться index, он нужен для того, чтобы сократить во всем проекте импорты, чтобы импорт был просто из utils
// до
// export { createAppAsyncThunk } from "./utils/createAppAsyncThunk"
// после
//export { createAppAsyncThunk } from "utils"
