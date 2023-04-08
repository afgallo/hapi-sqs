# hapi-sqs
![workflow](https://github.com/afgallo/hapi-sqs/actions/workflows/main.yml/badge.svg)
[![codecov](https://codecov.io/gh/afgallo/hapi-sqs/branch/main/graph/badge.svg?token=19Y3ZLIDZF)](https://codecov.io/gh/afgallo/hapi-sqs)

This Hapi plugin simplifies interaction with Amazon Simple Queue Service (SQS) by providing a convenient way to use the AWS SDK for JavaScript (v3) with Hapi.js applications.

## Installation

```bash
npm i hapi-sqs
```

## Usage

First, register the plugin with your Hapi server:

```javascript
const Hapi = require('@hapi/hapi');
const SQSPlugin = require('hapi-sqs');

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

  await server.register({
    plugin: SQSPlugin,
    options: {
      region: 'us-east-1', // Replace with your desired AWS region
    }
  });

  // Add routes, start server, etc.
};

init();
```

The plugin will create an instance of `QueueAdapter` using the provided options and decorate the Hapi server toolkit with the sqs property.

## Configuration

You can pass the following options when registering the plugin:

`region` (required) - The AWS region for your SQS resources (e.g., 'us-east-1'). Defaults to `us-east-1`.

`sqsClient` (optional) - An instance of the AWS SQS client. Defaults to the `SQSClient` from AWS SDK.

`awsAccessKey` (optional) - Your AWS access key id.

`awsSecretKey` (optional) - Your AWS secret key.

Example:
```javascript
await server.register({
  plugin: SQSPlugin,
  options: {
    region: 'us-east-1',
    sqsClient: customSQSClient,
    awsAccessKey: 'your_access_key',
    awsSecretKey: 'your_secret_key'
  }
});
```

## API
The plugin exposes the following method:

`send(queueUrl, message, options)`

Sends a message to the specified SQS queue.

`queueUrl` (required) - The URL of the target SQS queue.

`message` (required) - The message to send.

`options` (optional) - An object containing additional options for the `SendMessageCommand`.

Returns a Promise that resolves with the `SendMessageCommand` response.

## Example
Here's an example of how to use the plugin in your Hapi routes:

```javascript
server.route({
  method: 'POST',
  path: '/send',
  handler: async (request, h) => {
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue';
    const message = 'Hello, world!';
    const options = { MessageGroupId: 'test-group' };

    try {
      const response = await h.sqs.send(queueUrl, message, options);
      return h.response(response).code(200);
    } catch (error) {
      return h.response(error).code(500);
    }
  },
});
```
