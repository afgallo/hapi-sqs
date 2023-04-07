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

  it('sends a message to the queue', async () => {
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue'
    const messageBody = 'Hello, world!'
    const sendMessageResponse = { MessageId: '12345' }

    sendStub.withArgs(Sinon.match.instanceOf(SendMessageCommand)).resolves(sendMessageResponse)

    const response = await queueAdapter.send(queueUrl, messageBody)

    expect(response).to.equal(sendMessageResponse)
    Sinon.assert.calledWithMatch(sendStub, Sinon.match.instanceOf(SendMessageCommand))
    Sinon.assert.calledWithMatch(sendStub, Sinon.match.has('input', { QueueUrl: queueUrl, MessageBody: messageBody }))
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
})
