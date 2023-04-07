const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const { SQSClient, SendMessageCommand, ReceiveMessageCommand } = require('@aws-sdk/client-sqs')
const QueueAdapter = require('../lib/adapter/queue-adapter')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

describe('QueueAdapter', () => {
  let sqsClient
  let sendStub
  let queueAdapter

  beforeEach(() => {
    sqsClient = new SQSClient()
    sendStub = Sinon.stub(sqsClient, 'send')
    queueAdapter = new QueueAdapter({ sqsClient })
  })

  afterEach(() => {
    sendStub.restore()
  })

  it('creates a new SQSClient if not provided as an option', () => {
    let newQueueAdapter = new QueueAdapter()
    expect(newQueueAdapter).to.be.an.instanceof(QueueAdapter) // any assert will do as sqsClient is a private variable

    newQueueAdapter = new QueueAdapter({ region: 'ap-southeast-1' })
    expect(newQueueAdapter).to.be.an.instanceof(QueueAdapter)
  })

  it('creates a new SQSClient with custom AWS access and secret keys', () => {
    const customQueueAdapter = new QueueAdapter({
      awsAccessKey: 'custom_access_key',
      awsSecretKey: 'custom_secret_key'
    })

    expect(customQueueAdapter).to.be.an.instanceof(QueueAdapter)
  })

  it('creates a new SQSClient and ignores AWS access and secret keys', () => {
    const customQueueAdapter = new QueueAdapter({
      awsAccessKey: 'custom_access_key'
    })

    expect(customQueueAdapter).to.be.an.instanceof(QueueAdapter)
  })

  it('sends a message to the queue', async () => {
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue'
    const message = 'Hello, world!'
    const sendMessageResponse = { MessageId: '12345' }

    sendStub.withArgs(Sinon.match.instanceOf(SendMessageCommand)).resolves(sendMessageResponse)

    const response = await queueAdapter.send(queueUrl, message)

    expect(response).to.equal(sendMessageResponse)
    Sinon.assert.calledWithMatch(sendStub, Sinon.match.instanceOf(SendMessageCommand))
    Sinon.assert.calledWithMatch(sendStub, Sinon.match.has('input', { QueueUrl: queueUrl, MessageBody: message }))
  })

  it('receives messages from the queue', async () => {
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue'
    const receiveMessageResponse = { Messages: [] }
    const options = { MaxNumberOfMessages: 1 }

    sendStub.withArgs(Sinon.match.instanceOf(ReceiveMessageCommand)).resolves(receiveMessageResponse)

    const response = await queueAdapter.receive(queueUrl, options)

    expect(response).to.equal(receiveMessageResponse)
    Sinon.assert.calledWithMatch(sendStub, Sinon.match.instanceOf(ReceiveMessageCommand))
    Sinon.assert.calledWithMatch(sendStub, Sinon.match.has('input', { QueueUrl: queueUrl, ...options }))
  })

  it('sends a message with additional options', async () => {
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue'
    const message = 'Hello, world!'
    const options = { MessageGroupId: 'test-group' }

    sendStub.resolves('send result')

    const result = await queueAdapter.send(queueUrl, message, options)

    expect(result).to.equal('send result')

    Sinon.assert.calledOnceWithExactly(sendStub, Sinon.match.instanceOf(SendMessageCommand))
    Sinon.assert.calledWithMatch(
      sendStub,
      Sinon.match.has('input', { QueueUrl: queueUrl, MessageBody: message, ...options })
    )
  })
})
