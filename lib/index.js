const QueueAdapter = require('../lib/adapter/queue-adapter')
const Package = require('../package.json')

exports.plugin = {
  pkg: Package,
  register: (server, options) => {
    const sqsClient = new QueueAdapter(options)
    server.decorate('toolkit', 'sqs', sqsClient)
  }
}
