require("dotenv").config();

const HederaClient = require("./hedera-client");
const { ConsensusTopicCreateTransaction } = require("@hashgraph/sdk");

async function main() {
  console.log("ConsensusTopicCreateTransaction()");

  const tx = await new ConsensusTopicCreateTransaction().execute(HederaClient);
  console.log("tx:", tx);

  const receipt = await tx.getReceipt(HederaClient);
  const newTopicId = receipt.getTopicId();
  console.log("new HCS topic ID:", newTopicId);
}

main();
