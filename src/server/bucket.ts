import {
  SharedKeyCredential,
  ServiceURL,
  ContainerURL,
  StorageURL,
  Aborter,
  BlobURL,
  BlockBlobURL
} from '@azure/storage-blob'

const account = 'tweetmotion'
const accountKey = process.env.ACCOUNT_KEY
const sharedKeyCredentials = new SharedKeyCredential(account, accountKey)
const pipeline = StorageURL.newPipeline(sharedKeyCredentials)
const serviceUrl = new ServiceURL(
  `https://${account}.blob.core.windows.net`,
  pipeline
)

const containerName = 'tweets'
const containerUrl = ContainerURL.fromServiceURL(serviceUrl, containerName)
const createContainer = containerUrl.create(Aborter.none)

async function streamToString(
  readableStream: NodeJS.ReadableStream
): Promise<string> {
  return new Promise((resolve, reject): void => {
    const chunks = []
    readableStream.on('data', data => {
      chunks.push(data.toString())
    })
    readableStream.on('end', () => {
      resolve(chunks.join(''))
    })
    readableStream.on('error', reject)
  })
}

export const getStoredTweets = async (key: string): Promise<string> => {
  await createContainer.catch(err => {
    if (err.code === 'ContainerAlreadyExists') Promise.resolve()
  })
  try {
    const url = BlobURL.fromContainerURL(containerUrl, key)
    const req = await url.download(Aborter.none, 0)
    const res = await streamToString(req.readableStreamBody)
    return res
  } catch (error) {
    if (error.status === 404) return null
  }
}

export const setStoredTweets = async (
  key: string,
  body: string
): Promise<void> => {
  await createContainer.catch(err => {
    if (err.code === 'ContainerAlreadyExists') Promise.resolve()
  })
  const url = BlobURL.fromContainerURL(containerUrl, key)
  const blockUrl = BlockBlobURL.fromBlobURL(url)
  await blockUrl.upload(Aborter.none, body, body.length)
}
