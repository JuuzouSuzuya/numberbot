"use strict";

// Dependencies
const Discord = require("discord.js");
const fs = require("fs");
const fibNumbers = require("./fib");

function divisibleBy(divisor, input) { return input % divisor === 0; }

class Bot {
    /**
     * @param token {string}
     * @param path {string} the database file path
     * @param channels {{base10: {string}, base2: {string}, fib: {string}}} channel names for each base
     * @param writeDatabaseDelay {Number}
     */
    constructor(token, path, channels, writeDatabaseDelay) {
        this.bot = new Discord.Client();
		this.token = token;
        this.dbPath = path;
        this.channels = channels;
        this.writeDatabaseDelay = writeDatabaseDelay;
        this.db = {
            base10: {
                current: 0,
                users: {}
            },
            base2: {
                current: 0,
                users: {}
            },
            fib: {
                current: 0,
                users: {}
            }
        };

        let newdb = false;  // determines whether the database was just created, so we don't have to load the file

        if (!fs.existsSync(path)) {
            console.log("Database file not found, creating it for you...");
            fs.writeFileSync(path, JSON.stringify(this.db), (err) => {
                if (err) throw err;
                newdb = true;
            });
        }

        if (!newdb) {
            let data = fs.readFileSync(path);
            this.db = JSON.parse(data);
        }
    }

    /**
     * Starts the Discord client
     * @public
     */
    startClient() {
        let _this = this;
        console.log("Attempting connection...");
        this.bot.login(this.token);

        this.bot.on("ready", () => {
            this.printInfo();
            setEventListeners();
        });

        function setEventListeners() {
            _this.bot.on("message", (message) => {
                switch (message.channel.name) {
                    case _this.channels.base10:
                        _this._base10Message(message);
                        break;
                    case _this.channels.base2:
                        _this._base2Message(message);
                        break;
                    case _this.channels.fib:
                        _this._fibMessage(message);
                        break;
					default:
                    	// Message is not in a counting channel. Reply to commands.
						switch (message.content) {
							case "!points":
								_this._sayScore(message);
								break;
							default:
								break;
						}
                        break;
                }
            });
        }

        // Write database on a regular interval
        setInterval(() => {
        	_this.writeDatabase();
        }, _this.writeDatabaseDelay);
    };

    /**
	 * Reply to a message that requests point stats
     * @param message {Discord.Message}
     * @private
     */
    _sayScore(message) {
		let user = message.author;
		let userID = user.id;
		let hasBase10 = this.db.base10.users.hasOwnProperty(userID);
		let hasBase2 = this.db.base2.users.hasOwnProperty(userID);
		let hasFib = this.db.fib.users.hasOwnProperty(userID);

        let base10Score = hasBase10 ? `You have ${this.db.base10.users[userID].points} Base 10 counting point(s).`
								    : `You have no Base 10 counting points.`;
        let base2Score  = hasBase2  ? `You have ${this.db.base2.users[userID].points} Base 2 counting point(s).`
            						: `You have no Base 2 counting points.`;
        let fibScore    = hasFib    ? `You have ${this.db.fib.users[userID].points} Fibonacci counting point(s).`
            						: `You have no Fibonacci counting points.`;

        let finalMessage = [base10Score, base2Score, fibScore].join(" ");
        message.reply(finalMessage);
    }

    writeDatabase() {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.dbPath, JSON.stringify(this.db), (err) => {
                if (err) throw err;
                console.log("Database written to disk.");
                resolve();
            });
        });
    };

    _base10Message(message) {
        let user 	  = message.author;
        let inputNum  = parseInt(message.content);

        if (inputNum === this.db.base10.current + 1) {
            this.db.base10.current++;

            let award = 1;
            award = divisibleBy(100, inputNum)     ? 100     : award;
            award = divisibleBy(500, inputNum)     ? 500     : award;
            award = divisibleBy(1000, inputNum)    ? 1000    : award;
            award = divisibleBy(10000, inputNum)   ? 10000   : award;
            award = divisibleBy(100000, inputNum)  ? 100000  : award;
            award = divisibleBy(1000000, inputNum) ? 1000000 : award;

            if (award > 100) { message.pin(); }

            // Store points.
            if (!this.db.base10.users.hasOwnProperty(user.id)) {
                // User has no ID entry. Create one.
                this.db.base10.users[user.id] = {
                    username: user.username,
                    points: 0
                }
            }
            if (this.db.base10.users[user.id].points) {
                this.db.base10.users[user.id].points += award;
            } else {
                this.db.base10.users[user.id].points = award;
            }
        }
        else {
            message.delete();
        }
    }

    _base2Message(message) {
        let user 	  = message.author;
        let inputNum  = parseInt(message.content, 2);

        if (inputNum === this.db.base2.current + 1) {
            this.db.base2.current++;

            let award = 1;
            award = divisibleBy(100, inputNum)  ? 100 : award;
            award = divisibleBy(500, inputNum)  ? 500 : award;
            award = divisibleBy(1000, inputNum) ? 1000 : award;

            if (award > 100) { message.pin(); }

            // Store points.
            if (!this.db.base2.users.hasOwnProperty(user.id)) {
                // User has no ID entry. Create one.
                this.db.base2.users[user.id] = {
                    username: user.username,
                    points: 0
                }
            }
            if (this.db.base2.users[user.id].points) {
                this.db.base2.users[user.id].points += award;
            } else {
                this.db.base2.users[user.id].points = award;
            }
        }
        else {
            message.delete();
        }
    }

    _fibMessage(message) {
        let user 	  = message.author;
        let inputNum  = message.content;  // string input

        if (inputNum === fibNumbers[this.db.fib.current + 1]) {
            this.db.fib.current++;

            let award = 1;
            award = divisibleBy(10, this.db.fib.current)   ? 100 : award;
            award = divisibleBy(50, this.db.fib.current)   ? 500 : award;
            award = divisibleBy(100, this.db.fib.current)  ? 1000 : award;

            if (award > 10) { message.pin(); }

            // Store points.
            if (!this.db.fib.users.hasOwnProperty(user.id)) {
                // User has no ID entry. Create one.
                this.db.fib.users[user.id] = {
                    username: user.username,
                    points: 0
                }
            }
            if (this.db.fib.users[user.id].points) {
                this.db.fib.users[user.id].points += award;
            } else {
                this.db.fib.users[user.id].points = award;
            }
        }
        else {
            message.delete();
        }
    }

    printInfo() {
        console.log("------");
        console.log("Number Bot by AndroFox");
        console.log("RELEASE: 20161207");
        console.log("------");
        console.log("Hello! I'm number bot.");
        console.log(`My Discord username is ${this.bot.user.username}.`);
        console.log(`My Discord user ID is ${this.bot.user.id}.`);
        console.log(`Currently, ${this.db.base10.current} base 10 numbers, ${this.db.base2.current} base 2 numbers`);
        console.log(`and ${this.db.fib.current} fibonacci numbers have been counted.`);
        console.log("------");
        console.log("I am listening to the following channels:");
        console.log(`base10    => "${this.channels.base10}"`);
        console.log(`base2     => "${this.channels.base2}"`);
        console.log(`fibonacci => "${this.channels.fib}"`);
        console.log("------");
    }
}

module.exports = Bot;