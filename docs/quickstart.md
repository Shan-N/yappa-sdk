# Quickstart

## Installation

```bash
npm install yappa-sdk
```

## Basic Usage

```js
import { Client } from 'yappa-sdk';

const client = new Client({
  url: 'wss://example.com/socket',
  reconnect: true,
});

client.on('connect', () => {
  console.log('Connected!');
});

client.connect();
```

See [Client API](./client.md) for more details.
