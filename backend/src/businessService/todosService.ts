import { ToDosAccess } from "../dataAccessLayer/todosAccess";
import { AttachmentUtils } from "../utils/attachmentUtils";
import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import * as uuid from 'uuid'
import { createLogger } from "../utils/logger";

const toDoAccess = new ToDosAccess()
const attachmentUtils = new AttachmentUtils()
const logger = createLogger('BusinessLogic')

export async function createToDo(userId: string, request: CreateTodoRequest): Promise<TodoItem> {
    const todoId = uuid.v4()
    const item: TodoItem = {
        userId,
        todoId,
        createdAt: new Date().toISOString(),
        done: false,
        attachmentUrl: null,
        ...request
    }
    logger.info(`Creating todo ${item}`)
    await toDoAccess.createToDo(item)
    return item
}

export async function getAll(userId: string): Promise<TodoItem[]> {
    logger.info(`Get todos by userId ${userId}`)
    return await toDoAccess.getAllTodos(userId)
}

export async function updateTodo(userId: string, todoId: string, request: UpdateTodoRequest) {
    logger.info(`Updating todo ${request} by userId ${userId} and todoId ${todoId}`)
    const todo = await toDoAccess.getToDo(todoId, userId)

    if(!todo)
        throw new Error('Todo not found')

    await toDoAccess.updateToDo(todoId, userId, request)
}

export async function deleteTodo(userId: string, todoId: string) {
    logger.info(`deleting todo ${todoId} for user ${userId}`)
    const todo = await toDoAccess.getToDo(todoId, userId)

    if(!todo)
        throw new Error('Todo not found')

    await toDoAccess.deleteTodo(todoId, userId)
}

export async function updateUrl(userId: string, todoId: string, attachmentId: string) {
    logger.info(`update todo attachment ${attachmentId}`)
    const attachmentUrl = await attachmentUtils.getUrl(attachmentId)
    const thumbnailUrl = await attachmentUtils.getThumbnailUrl(attachmentId)
    const todo = await toDoAccess.getToDo(todoId, userId)

    if(!todo)
        throw new Error('Todo not found')

    await toDoAccess.updateUrl(todoId, userId, attachmentUrl, thumbnailUrl)
}

export async function generateSignedUrl(attachmentId: string): Promise<String> {
    logger.info(`Generating signed url`)
    return await attachmentUtils.getSignedUrl(attachmentId)
}