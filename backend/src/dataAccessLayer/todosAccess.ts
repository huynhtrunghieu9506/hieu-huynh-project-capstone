import * as AWS from 'aws-sdk'
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { createLogger } from "../utils/logger";
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";
const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('ToDosAccess')

export class ToDosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todoIndex = process.env.TODOS_CREATED_AT_INDEX) {
        }
    
        async getAllTodos(userId: string): Promise<TodoItem[]> {
            logger.info(`Getting all todos ${userId} `)
            const result = await this.docClient.query({
                TableName: this.todosTable,
                IndexName: this.todoIndex,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                }
            }).promise()

            return result.Items as TodoItem[]
        }

        async getToDo(todoId: string, userId: string): Promise<TodoItem> {
            logger.info(`Get todo by id ${todoId}`)
            const result = await this.docClient.get({
                TableName: this.todosTable,
                Key: {
                    todoId: todoId,
                    userId: userId
                }
            }).promise()
            return result.Item as TodoItem
        }

        async createToDo(todoItem: TodoItem) {
            logger.info(`Create todo ${todoItem}`)
            await this.docClient.put({
                TableName: this.todosTable,
                Item: todoItem
            }).promise()
        }

        async updateToDo(todoId: string, userId: string, todoUpdate: TodoUpdate) {
            logger.info(`Update to do item ${todoId} with id ${todoId}`)
            await this.docClient.update({
                TableName: this.todosTable,
                Key: {
                    todoId: todoId,
                    userId: userId
                },
                UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
                ExpressionAttributeNames: {
                    "#name": "name"
                },
                ExpressionAttributeValues: {
                    ":name": todoUpdate.name,
                    ":dueDate": todoUpdate.dueDate,
                    ":done": todoUpdate.done
                }
            }).promise()
        }

        async deleteTodo(todoId: string, userId: string) {
            logger.info(`Deleing todo id ${todoId}`)
            await this.docClient.delete({
                TableName: this.todosTable,
                Key: {
                    todoId: todoId,
                    userId: userId
                }
            }).promise()
        }

        async updateUrl(todoId: String, userId: string, url: string, thumbnailUrl: string) {
            logger.info(`Updating todo url ${url} for id ${todoId}`)
            await this.docClient.update({
                TableName: this.todosTable,
                Key: {
                    todoId: todoId,
                    userId: userId
                },
                UpdateExpression: 'set attachmentUrl = :url, thumbnailUrl = :thumbnailUrl',
                ExpressionAttributeValues: {
                    ':url': url,
                    ':thumbnailUrl': thumbnailUrl
                }
            }).promise()
        }
}