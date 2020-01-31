const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const open = require("open");
const TextDecoder = require("text-encoding").TextDecoder;
const HederaClient = require("./hedera-client");
const UInt8ToString = require("./utils.js").UInt8ToString;
const secondsToDate = require("./utils.js").secondsToDate;
const {
  ConsensusSubmitMessageTransaction,
  ConsensusTopicId,
  MirrorClient,
  MirrorConsensusTopicQuery
} = require("@hashgraph/sdk");
const topicId = ConsensusTopicId.fromString("0.0.156824");
const mirrorNodeAddress = new MirrorClient("api.testnet.kabuto.sh:50211");

if (process.argv.length <= 2) {
  // do nothing
  //console.log("normal args");
} else {
  for (var i = 2; i < process.argv.length; i++) {
    // process the rest of our args
    var arg = process.argv[i];
    if (i === 2) {
      // pass in how we should manage errors
      if (arg === "--debug") {
        // print out debugging info from our logger
        console.log(arg);
      } else if (arg === "--minimal") {
        // print out only the "minimal" output
        console.log(arg);
      }
      else { 
        console.log(
          `\noops, arg '${arg}' didn't appear to match our schema.\nwe'll try to ignore this, but maybe you'd like to try again?\n`
        );
      }
    } else {
      console.log(
        `\noops, arg '${arg}' didn't appear to match our schema.\nwe'll ignore this, but maybe you'd like to try again?\n`
      );
    }
  }
}

init(); // After we've processed our args, lets setup the app!

function init() {
  //console.log(environmentLocation);

  app.use(express.static("public")); // Render our /public folder

  /* define port for express.js to serve the app at */
  http.listen(0, function() {
    //console.log("listening on ", http.address().port);
    const randomInstancePort = http.address().port;
    open("http://localhost:" + randomInstancePort, { app: "firefox" }); // may crash/error if they don't have firefox
  });

  /* called whenever a user connects to the client */
  io.on("connection", function(client) {
    //console.log("connection: ", client.id);
    io.emit("connect message", client.id + "&" + topicId);
    listenForMessages();

    client.on("chat message", function(msg) {
      const formattedMessage = client.id + "&" + msg; // use a special character to break our messages
      sendHCSMessage(formattedMessage);
    });

    client.on("disconnect", function() {
      //console.log("disconnect");
      io.emit("disconnect message", client.id);
    });
  });
}

// TO DO - error handling / response management for subscribing to a Mirror Node API
// TO DO - compare results from multiple mirror node APIs
/* listen to our mirror node API */
function listenForMessages() {
  console.log("MirrorConsensusTopicQuery()");
  // Currently, the Kabuto API will return _all_ messages that have happened in this
  // topic upon a new subscription event, meaning there could be a looot of data here
  new MirrorConsensusTopicQuery()
    .setTopicId(topicId)
    .subscribe(mirrorNodeAddress, res => {
      console.log("Pub-sub response from MirrorConsensusTopicQuery()");
      //console.log("mirror node res:", res);
      const message = new TextDecoder("utf-8").decode(res["message"]);
      var runningHash = UInt8ToString(res["runningHash"]);
      var timestamp = secondsToDate(res["consensusTimestamp"]);
      io.emit(
        "chat message",
        message + "&" + res.sequenceNumber + "&" + runningHash + "&" + timestamp
      );
    });
  return;
}

// TO DO - error handling / response management for submitting a new HCS message
function sendHCSMessage(msg) {
  console.log("ConsensusSubmitMessageTransaction()");
  new ConsensusSubmitMessageTransaction()
    .setTopicId(topicId)
    .setMessage(msg)
    .execute(HederaClient);
}
