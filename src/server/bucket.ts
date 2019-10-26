import { S3 } from 'aws-sdk'

const Bucket = `tweetmotion`
const apiVersion = '2006-03-01'
const s3 = new S3({ apiVersion })

const createBuket = s3
  .createBucket({
    Bucket
  })
  .promise()

export const getStoredTweets = async (Key: string): Promise<string> => {
  await createBuket
  try {
    const req = await s3.getObject({ Bucket, Key }).promise()
    return req.Body as string
  } catch (error) {
    if (error.code === 'NoSuchKey') return null
  }
}

export const setStoredTweets = async (
  Key: string,
  Body: string
): Promise<void> => {
  await s3.putObject({ Bucket, Key, Body }).promise()
}
