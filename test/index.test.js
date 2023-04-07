const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Hapi = require('@hapi/hapi')

const SQSPlugin = require('../lib/index')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

describe('SQS Plugin', () => {
  it('registers the plugin and decorates the toolkit with the SQS client', async () => {
    const server = new Hapi.Server()

    await server.register({ plugin: SQSPlugin })

    expect(server.registrations['hapi-sqs']).to.exist()
  })
})
