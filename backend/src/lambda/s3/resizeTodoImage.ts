import { S3EventRecord, SNSEvent, SNSHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../../utils/logger'
import Jimp from 'jimp/es'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3()

const attachmentBucket = process.env.ATTACHMENT_S3_BUCKET
const thumbnailsBucket = process.env.THUMBNAILS_S3_BUCKET

const loggers = createLogger('S3Event')

export const handler: SNSHandler = async (event: SNSEvent) => {
    loggers.info(`Processing S3 SNS event ${event}`)
    for(const snsRecord of event.Records) {
        const s3EventMsg = snsRecord.Sns.Message
        loggers.info(`Processing S3 event ${s3EventMsg}`)
        const s3Event = JSON.parse(s3EventMsg)
        for(const record of s3Event.Records) {
            await processEvent(record)
        }
    }

    async function processEvent(record: S3EventRecord) {
        const key = record.s3.object.key
        loggers.info(`Processing S3 record ${key}`)
        const response = await s3.getObject({
            Bucket: attachmentBucket,
            Key: key
        }).promise()
        const body = response.Body
        const image = await Jimp.read(body)

        loggers.info('Resizing to thumbnails')
        image.resize(150, Jimp.AUTO)
            .greyscale() // set greyscale
        const convertedBuffer = await image.getBufferAsync(Jimp.AUTO)

        loggers.info(`Storing thumbnails to S3 bucket`)
        await s3.putObject({
            Bucket: thumbnailsBucket,
            Key: `${key}.jpeg`,
            Body: convertedBuffer
        }).promise()
    }

    
}