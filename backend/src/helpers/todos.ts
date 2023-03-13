import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { DeleteTodoRequest } from '../requests/DeleteTodoRequest'
import { getAttachmentUrl, getUploadUrl } from './attachmentUtils'
import { TodoAccess } from './todosAcess'

// TODO: Implement businessLogic
const todoAccess = new TodoAccess()
const logger = createLogger('S3')

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return todoAccess.getTodosForUser(userId)
}

export async function deleteTodo(
  deleteData: DeleteTodoRequest
): Promise<boolean> {
  return todoAccess.deleteTodo(deleteData)
}

export async function updateTodo(
  updateTodoRequest: UpdateTodoRequest,
  todoId: string,
  userId: string
): Promise<boolean> {
  return todoAccess.updateTodo({ ...updateTodoRequest, todoId, userId })
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()

  const result = await todoAccess.createTodo({
    todoId,
    userId: userId,
    name: createTodoRequest.name,
    done: false,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString()
  })
  return result
}

export async function createAttachmentPresignedUrl(
  todoId: string,
  userId: string
): Promise<string | null> {
  try {
    const attachmentId = uuid.v4()
    const uploadUrl = getUploadUrl(attachmentId)
    const attachmentUrl = getAttachmentUrl(attachmentId)
    logger.info('Presigned url is' + uploadUrl)
    logger.info('Formatted url is' + attachmentUrl)
    const saveDbCall = await todoAccess.updateAttachmentUrl(
      todoId,
      userId,
      attachmentUrl
    )
    logger.info('Save db called', { saveDbCall })
    return uploadUrl
  } catch (e) {
    logger.info('Cannot upload/save attachment', e)
    return null
  }
}