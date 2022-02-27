# Serverless TODO
A simple project allow to declare TODO works with a due date using lambda and serverless, for capstone project of Udacity Cloud Developer

# Functionality of the application

This application will allow creating/removing/updating/fetching TODO items. Each TODO item can optionally have an attachment image. Each user only has access to TODO items that he/she has created.

# TODO items
* `todoId` (string) - a unique id for an item
* `createdAt` (string) - date and time when an item was created
* `name` (string) - name of a TODO item (e.g. "Change a light bulb")
* `dueDate` (string) - date and time by which an item should be completed
* `done` (boolean) - true if an item was completed, false otherwise
* `attachmentUrl` (string) (optional) - a URL pointing to an image attached to a TODO item

## Prerequisites

### Data sample:
# List of todos:
```json
{
  "items": [
    {
      "todoId": "123",
      "createdAt": "2019-07-27T20:01:45.424Z",
      "name": "Buy milk",
      "dueDate": "2019-07-29T20:01:45.424Z",
      "done": false,
      "attachmentUrl": "http://example.com/image.png"
    },
    {
      "todoId": "456",
      "createdAt": "2019-07-27T20:01:45.424Z",
      "name": "Send a letter",
      "dueDate": "2019-07-29T20:01:45.424Z",
      "done": true,
      "attachmentUrl": "http://example.com/image.png"
    },
  ]
}
```
# Create todo:
* Authorized user is required
* name of todo is not allow an "EMPTY" string and under 6 characters or NULL

Request:
```json
{
  "name": "Water flowers",
  "dueDate": "2019-06-11"
}
```

Response:
```json
{
  "item": {
    "todoId": "123",
    "createdAt": "2019-07-27T20:01:45.424Z",
    "name": "Water flowers",
    "dueDate": "2019-06-11",
    "done": false,
    "attachmentUrl": "http://example.com/image.png"
  }
}
```
# Update todo:
* Authorized user is required
* name of todo is not allow an "EMPTY" string and under 6 characters or NULL
* todoId is required (put it in the path variable)

Request:
```json
{
  "name": "Buy bread",
  "dueDate": "2019-07-29T20:01:45.424Z",
  "done": true
}
```
Response: status code 200 with empty body

# Delete todo
* Authorized user is required
* todoId is required (put it in the path variable)
Reponse: status code 204 with empty body

#GenerateUploadUrl - returns a pre-signed URL that can be used to upload an attachment file for a TODO item.

```json
{
  "uploadUrl": "https://s3-bucket-name.s3.eu-west-2.amazonaws.com/image.png"
}
```

All functions are already connected to appropriate events from API Gateway.

An id of a user can be extracted from a JWT token passed by a client.


# Frontend
The `client` folder contains a web application that can use the API that should be developed in the project.
Authorize user with Auth0
This frontend allow to interact with serverless TODO BE
To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```