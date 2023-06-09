const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs')

module.exports = exports = class QueueAdapter {
  constructor(options = {}) {
    let credentials = null

    if (options.awsAccessKey && options.awsSecretKey) {
      credentials = { accessKeyId: options.awsAccessKey, secretAccessKey: options.awsSecretKey }
    }

    this.#sqsClient = options.sqsClient || new SQSClient({ region: options.region || 'us-east-1', credentials })
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
}
