const { SQSClient, SendMessageCommand, ReceiveMessageCommand } = require('@aws-sdk/client-sqs')

module.exports = exports = class QueueAdapter {
  constructor(options = {}) {
    this.#sqsClient = options.sqsClient || new SQSClient({ region: options.region || 'us-east-1' })
  }

  #sqsClient

  async send(queueUrl, message, options) {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: message,
      ...options
    })

    return await this.#sqsClient.send(command)
  }

  async receive(queueUrl, options) {
    const command = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      ...options
    })

    return await this.#sqsClient.send(command)
  }
}
