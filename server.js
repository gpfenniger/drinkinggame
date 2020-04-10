const express = require("express");
const uuid = require("uuid").v4;
let app = express();

app.use(express.static("public"));

const http = require("http").createServer(app);
const io = require("socket.io")(http);

const SERVER_COLOUR = "#8FBCBB";
let allChallenges = require("./cards.json");
let challenges = allChallenges;
let users = [];
let colours = [
    "#5e81ac",
    "#bf616a",
    "#d08770",
    "#ebcb8b",
    "#a3be8c",
    "#b48ead",
];

let getUserInfo = (id) => {
    let user = users.filter((u) => u.id == id);
    if (user[0] != undefined)
        return { name: user[0].name, colour: user[0].colour };
    return { name: "undefined", colour: "blue" };
};

let randomColour = () => {
    colour = colours[Math.floor(Math.random() * colours.length)];
    colours = colours.filter((c) => c != colour);
    return colour;
};

io.on("connection", (socket) => {
    let userid = uuid();
    socket.emit("register", userid);
    socket.on("register", (name) => {
        users.push({ id: userid, name: name, colour: randomColour() });
        io.emit("chat message", {
            text: `Welcome, ${name}!`,
            colour: SERVER_COLOUR,
        });
    });

    console.log("a user connected");
    socket.on("chat message", (msg) => {
        console.log(`Message: ${msg.text}`);
        let { name, colour } = getUserInfo(msg.id);
        io.emit("chat message", {
            text: `${name}: ${msg.text}`,
            colour: colour,
        });

        if (/hit me/i.test(msg.text)) {
            let challenge =
                challenges[Math.floor(Math.random() * challenges.length)];
            io.emit("chat message", {
                text: challenge,
                colour: SERVER_COLOUR,
            });
            challenges = challenges.filter((c) => c != challenge);
            if (challenges.length == 0) {
                challenges = allChallenges;
                io.emit("chat message", {
                    text: "Shuffling Challenges",
                    colour: SERVER_COLOUR,
                });
            }
        }
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
        let { colour } = getUserInfo(userid);
        colours.push(colour);
        users = users.filter((user) => user.id != userid);
    });
});

http.listen(3000, () => {
    console.log("Listening on port 3000");
});
