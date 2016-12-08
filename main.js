/**
 * Created by androfox on 12/7/16.
 */
const Bot = require("./bot");

let token, db, channels;
token = "MjU0Njg1MTEyMTcwNDQ2ODQ4.CySpgQ.7tmRG5PlcFIkpBKpk8AbE1J1gTU";
db = "database.txt";
channels = {
    "base10": "base10",
    "base2": "base2",
    "fib": "fibonacci"
};

let myBot = new Bot(token, db, channels, 60000);
myBot.startClient();

process.on("SIGINT", () => {
    console.log("Shutting down the bot.");
    console.log("Saving database.");
    myBot.writeDatabase().then(() => {
        process.exit();
    });
});