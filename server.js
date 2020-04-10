const express = require("express");
const uuid = require("uuid").v4;
let app = express();

app.use(express.static("public"));

const http = require("http").createServer(app);
const io = require("socket.io")(http);

let challenges = require("./cards.json");
let users = [];

let getUsername = (id) => {
    let user = users.filter((u) => u.id == id);
    if (user != undefined) return user[0].name;
    return "undefined";
};

io.on("connection", (socket) => {
    let userid = uuid();
    socket.emit("register", userid);
    socket.on("register", (name) => {
        users.push({ id: userid, name: name });
        io.emit("chat message", `Welcome, ${name}!`);
    });

    console.log("a user connected");
    socket.on("chat message", (msg) => {
        console.log(`Message: ${msg.text}`);
        io.emit("chat message", `${getUsername(msg.id)}: ${msg.text}`);
        if (/hit me/i.test(msg.text)) io.emit("chat message", challenges[0]);
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
        users = users.filter((user) => user.id != userid);
    });
});

http.listen(3000, () => {
    console.log("Listening on port 3000");
});
