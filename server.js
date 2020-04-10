const express = require("express");
const uuid = require("uuid").v4;
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// This colour is used for text borders when the server sends a message
const SERVER_COLOUR = "#8FBCBB";
// Passphrase for sending challenge
const PASSPHRASE = /hit me/i;
// A full list of all the challenges
let allChallenges = require("./cards.json");
// A list of challenges in circulation
let challenges = allChallenges;
// Users are appended to this list with an id, name and colour
let users = [];
// List of possible colours users can be assigned
let colours = [
    "#5e81ac",
    "#bf616a",
    "#d08770",
    "#ebcb8b",
    "#a3be8c",
    "#b48ead",
];

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html")
})

/**
 *   Gets a users name and colour from their id
 *   @param { String } id
 *   @returns { Promise<{String, String}> }
 */
let getUserInfo = (id) => {
    return new Promise((resolve, reject) => {
        let user = users.filter((u) => u.id == id);
        if (user.length == 0)
            resolve({ name: "undefined", colour: SERVER_COLOUR });
        resolve({ name: user[0].name, colour: user[0].colour });
    });
};

/**
 *   Returns a random colour from the list and makes sure there's no repeats
 *   @returns { Promise<String> }
 */
let randomColour = () => {
    return new Promise((resolve, reject) => {
        colour = colours[Math.floor(Math.random() * colours.length)];
        colours = colours.filter((c) => c != colour);
        if (colour == undefined) reject(new Error("Colour is Undefined"));
        resolve(colour);
    });
};

/**
 *  Registers a user and gives them a random colour
 *  @param { String } name
 *  @param { String } id
 *  @returns { Promise<{String, String}> }
 */
let registerUser = (name, id) => {
    return new Promise((resolve, reject) => {
        randomColour()
            .then((colour) => {
                users.push({ id: id, name: name, colour: colour });
                resolve({
                    text: `Welcome, ${name}!`,
                    colour: SERVER_COLOUR,
                });
            })
            .catch((e) => reject(e));
    });
};

/**
 *  Gets a random challenge and tries to make sure its not a repeat
 *  @returns { Promise<{String, String}> }
 */
let getChallenge = () => {
    return new Promise((resolve, reject) => {
        let challenge =
            challenges[Math.floor(Math.random() * challenges.length)];
        challenges = challenges.filter((c) => c != challenge);
        if (challenges.length == 0) challenges = allChallenges;
        resolve({
            text: challenge,
            colour: SERVER_COLOUR,
        });
        reject(new Error("Failed to get challenge"));
    });
};

/**
 * Sends the messages to other devices and looks for a challenge
 * @param {{String, String}} msg { text, id }
 * @returns { Promise<{String, String}> }
 */
let broadcastMessage = (msg) => {
    return new Promise((resolve, reject) => {
        getUserInfo(msg.id)
            .then(({ name, colour }) => {
                if (PASSPHRASE.test(msg.text)) {
                    resolve({
                        challenge: getChallenge(),
                        msg: {
                            text: `${name}: ${msg.text}`,
                            colour: colour,
                        },
                    });
                } else {
                    resolve({
                        msg: {
                            text: `${name}: ${msg.text}`,
                            colour: colour,
                        },
                    });
                }
                reject(new Error("Failed to process message"));
            })
            .catch((e) => reject(e));
    });
};

/**
 * Takes a user off the list and returns the colour to the pool
 * @param {String} id
 * @returns {Boolean}
 */
let deregister = (id) => {
    return new Promise((resolve, reject) => {
        getUserInfo(id)
            .then(({ colour }) => {
                colours.push(colour);
                users = users.filter((user) => user.id != id);
                resolve();
                reject(new Error("Failed to deregister user"));
            })
            .catch((e) => reject(e));
    });
};

io.on("connection", (socket) => {
    // This first section handles registering new users, their first text input
    // will register as their user name and they are assigned a random colour
    let userid = uuid();
    socket.emit("register", userid);
    socket.on("register", (name) => {
        registerUser(name, userid)
            .then((msg) => io.emit("chat message", msg))
            .catch((e) => console.error(e));
    });

    socket.on("chat message", (msg) => {
        broadcastMessage(msg)
            .then((result) => {
                io.emit("chat message", result.msg);
                if (result.challenge != undefined)
                    result.challenge
                        .then((res) => io.emit("chat message", res))
                        .catch((e) => console.error(e));
            })
            .catch((e) => console.error(e));
    });

    socket.on("disconnect", () => {
        deregister(userid);
    });
});

http.listen(process.env.PORT || 3000, () => {
    console.log(`Listening on port 4{process.env.PORT || 3000}`);
});
