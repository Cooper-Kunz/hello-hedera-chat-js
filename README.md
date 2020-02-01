# Hedera Consensus Service Chat Tutorial

This is an example chat application, which demonstrates how you can use provable, decentralized messaging on the Hedera Consensus Service.

A tutorial to follow along and build this project from scratch is coming soon!

## Built With

* [Hedera Hashgraph](https://www.hedera.com/) - The enterprise grade public network
* [Hedera Hashgraph's JavaScript SDK](https://github.com/hashgraph/hedera-sdk-js) - The easiest way to use Hedera in JavaScript
* [Express.js](https://expressjs.com/) - A fast, unopinionated web framework for node.js
* [Socket.io](https://socket.io/) - A realtime client to server framewrok for node.js

### Prerequisites

This demo assumes that you have an account on the Hedera Testnet. For example:

```
ACCOUNT_ID: 0.0.123456789

PUBLIC_KEY: 302a300506032b657003210013d392c9ebcf942a3c4ca165e6ee7721df293960001dfe0c347ea8542ef6c4a4

PRIVATE_KEY: 302e020100300506032b657004220420f4361ec73dc43e568f1620a7b7ecb7330790b8a1c7620f1ce353aa1de4f0eaa6
```

If you don't have one yet, you can signup at [portal.hedera.com](https://portal.hedera.com/).

Additionally you will need to be running a version of [node](https://nodejs.org/en/) above v8.

## Getting Started

Clone this repository with the following command:

```
git clone https://github.com/Cooper-Kunz/hello-hedera-chat-js.git
```

After you have downloaded locally, move into the project, and create a new .env file.

```
cd chat

touch .env
```

Add your Testnet account info to your .env file, like below:

```
ACCOUNT_ID=

PUBLIC_KEY=

PRIVATE_KEY=
```

Finally after downloading and setting up our environment, we will install our packages.

```
npm i
```

And after instaling our dependencies, we can now run the server!

```
node server.js
```

You should now see a browser open, at a random port location. This will connect you to a pre-filled, test topic!

If you want to create your own topic, run the following, then copy and paste the response into server.js.

```
node init.js
```

Optional parameters to customize the console output are coming soon!

```
node server.js --debug
node server.js --minimal
```

## Disclaimer 

This is a simple tutorial. It has no error handling or production ready features! 

Please use responsibly and contact me directly if you see issues or have questions.

### LICENSE

[MIT](LICENSE)