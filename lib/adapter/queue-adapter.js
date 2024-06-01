const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs')

/**
 * QueueAdapter is a class that provides a simple interface for sending messages to an AWS SQS queue.
 *
 * @example
 * const queueAdapter = new QueueAdapter({ awsAccessKey: 'myaccesskey', awsSecretKey: 'mysecretkey' })
 * await queueAdapter.send('myQueueUrl', 'myMessage')
 */
module.exports = exports = class QueueAdapter {
  /**
   * Creates a new QueueAdapter.
   *
   * @param {Object} options - The options for the QueueAdapter.
   * @param {string} options.awsAccessKey - The AWS access key. Optional if `options.sqsClient` is provided.
   * @param {string} options.awsSecretKey - The AWS secret key. Optional if `options.sqsClient` is provided.
   * @param {SQSClient} options.sqsClient - An instance of SQSClient to use instead of creating a new one. Optional.
   * @param {string} options.region - The AWS region to use. Defaults to 'us-east-1'.
   */
  constructor(options = {}) {
    let credentials = null

    if (options.awsAccessKey && options.awsSecretKey) {
      credentials = { accessKeyId: options.awsAccessKey, secretAccessKey: options.awsSecretKey }
    }

    this.#sqsClient = options.sqsClient || new SQSClient({ region: options.region || 'us-east-1', credentials })
  }

  #sqsClient

  /**
   * Sends a message to the specified queue.
   *
   * @param {string} queueUrl - The URL of the queue to send the message to.
   * @param {string} message - The message to send.
   * @param {Object} options - Additional options for sending the message.
   * @returns {Promise<Object>} - A promise that resolves to the result of sending the message.
   * @throws {Error} - If `queueUrl` or `message` is not provided.
   */
  async send(queueUrl, message, options) {
    if (!queueUrl || !message) {
      throw new Error('queueUrl and message are required parameters')
    }

    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: message,
      ...options
    })

    try {
      return await this.#sqsClient.send(command)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to send message', error)
      throw error
    }
  }
}
