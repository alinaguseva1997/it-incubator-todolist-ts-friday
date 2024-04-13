import { Dispatch } from "redux"
import { appActions } from "app/app.reducer"
import { BaseResponseType } from "common/types/common.types"

/**
 * Обрабатывает ошибки сервера и соответствующим образом обновляет состояние приложения.
 * @template D - Тип данных ответа сервера.
 * @param {BaseResponseType<D>} data - Данные ответа сервера.
 * @param {Dispatch} dispatch - Функция, используемая для отправки действий.
 * @param {boolean} [showError=true] - Флаг, указывающий, нужно ли отображать сообщение об ошибке. По умолчанию true.
 */
export const handleServerAppError = <D>(data: BaseResponseType<D>, dispatch: Dispatch, showError: boolean = true) => {
  // Проверяем, является ли флаг showError true
  if (showError) {
    // Отправляем действие для установки ошибки приложения
    dispatch(
      // Проверяем, имеет ли массив data.messages длину больше 0
      appActions.setAppError(data.messages.length ? { error: data.messages[0] } : { error: "Произошла ошибка" }),
    )
  }
  // Отправляем действие для установки статуса приложения "failed"
  dispatch(appActions.setAppStatus({ status: "failed" }))
}
