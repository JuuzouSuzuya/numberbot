/**
 * Created by androfox on 12/7/16.
 */
const Bot = require("./bot");

let token, db, channels;
token = "YOURTOKEN";
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
