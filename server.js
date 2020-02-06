/* configure access to our .env */
require("dotenv").config();

/* include express.js & socket.io */
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

/* include other packages */
const inquirer = require("inquirer");
const open = require("open");
const TextDecoder = require("text-encoding").TextDecoder;

/* hedera.js */
const {
  Client,
  ConsensusSubmitMessageTransaction,
  ConsensusTopicId,
  ConsensusTopicCreateTransaction,
  MirrorClient,
  MirrorConsensusTopicQuery
} = require("@hashgraph/sdk");

/* utilities */
const questions = require("./utils.js").initQuestions;
const UInt8ToString = require("./utils.js").UInt8ToString;
const secondsToDate = require("./utils.js").secondsToDate;
const log = require("./utils.js").handleLog;
const sleep = require("./utils.js").sleep;

/* init variables */
const defaultTopicId = ConsensusTopicId.fromString("0.0.156824");
const mirrorNodeAddress = new MirrorClient("api.testnet.kabuto.sh:50211");
const HederaClient = Client.forTestnet();
const specialChar = "&";
var topicId = "";
var logStatus = "Default";

/* configure our env based on prompted input */
async function init() {
  inquirer.prompt(questions).then(async function(answers) {
    try {
      logStatus = answers.status;
      /* configure account */
      if (answers.account === "" || answers.key === "") {
        log("init()", "using default .env config", logStatus);
        HederaClient.setOperator(
          process.env.ACCOUNT_ID,
          process.env.PRIVATE_KEY
        );
      } else {
        HederaClient.setOperator(answers.account, answers.key);
      }
      /* configure topic */
      if (answers.topic.includes("create")) {
        log("init()", "creating new topic", logStatus);
        topicId = await createNewTopic();
      } else {
        log("init()", "using default topic", logStatus);
        topicId = defaultTopicId;
      }
      /* run & serve the express app */
      runChat();
    } catch (error) {
      log("ERROR: init()", error, logStatus);
      process.exit(1);
    }
  });
}

function runChat() {
  app.use(express.static("public"));
  http.listen(0, function() {
    const randomInstancePort = http.address().port;
    open("http://localhost:" + randomInstancePort, { app: "firefox" }); // to do - add fallback browsers
  });
  subscribeToMirror();
  io.on("connection", function(client) {
    io.emit("connect message", client.id + specialChar + topicId);
    client.on("chat message", function(msg) {
      const formattedMessage = client.id + specialChar + msg;
      sendHCSMessage(formattedMessage);
    });
    client.on("disconnect", function() {
      io.emit("disconnect message", client.id);
    });
  });
}

init(); // process arguments & handoff to runChat()

/* helper hedera functions are below */
/* have feedback, questions, etc.? please feel free to file an issue! */
function sendHCSMessage(msg) {
  try {
    new ConsensusSubmitMessageTransaction()
      .setTopicId(topicId)
      .setMessage(msg)
      .execute(HederaClient);
    log("ConsensusSubmitMessageTransaction()", msg, logStatus);
  } catch (error) {
    log("ERROR: ConsensusSubmitMessageTransaction()", error, logStatus);
    process.exit(1);
  }
}

function subscribeToMirror() {
  try {
    new MirrorConsensusTopicQuery()
      .setTopicId(topicId)
      .subscribe(mirrorNodeAddress, res => {
        log("Response from MirrorConsensusTopicQuery()", res, logStatus);
        const message = new TextDecoder("utf-8").decode(res["message"]);
        var runningHash = UInt8ToString(res["runningHash"]);
        var timestamp = secondsToDate(res["consensusTimestamp"]);
        io.emit(
          "chat message",
          message +
            specialChar +
            res.sequenceNumber +
            specialChar +
            runningHash +
            specialChar +
            timestamp
        );
      });
    log("MirrorConsensusTopicQuery()", topicId.toString(), logStatus);
  } catch (error) {
    log("ERROR: MirrorConsensusTopicQuery()", error, logStatus);
    process.exit(1);
  }
}

async function createNewTopic() {
  try {
    const tx = await new ConsensusTopicCreateTransaction().execute(
      HederaClient
    );
    log(
      "ConsensusTopicCreateTransaction()",
      `submitted tx ${tx} .. waiting 3 seconds for receipt`,
      logStatus
    );
    await sleep(3000); // need to wait until this has persisted to a mirror
    const receipt = await tx.getReceipt(HederaClient);
    const newTopicId = receipt.getTopicId();
    log(
      "ConsensusTopicCreateTransaction()",
      `created new topic ${newTopicId} .. waiting 9 seconds for it to get to our Mirror Node`,
      logStatus
    );
    await sleep(9000); // need to wait until this has persisted to a mirror
    log("ConsensusTopicCreateTransaction()", newTopicId.toString(), logStatus);
    return newTopicId;
  } catch (error) {
    log("ERROR: ConsensusTopicCreateTransaction()", error, logStatus);
    process.exit(1);
  }
}
