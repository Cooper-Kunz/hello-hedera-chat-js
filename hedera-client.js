require("dotenv").config();
const { Client } = require("@hashgraph/sdk");

const HederaClient = new Client({
  network: { "0.testnet.hedera.com:50211": "0.0.3" },
  operator: {
    account: process.env.testID,
    privateKey: process.env.testPrivateKey
  }
});

module.exports = HederaClient;

