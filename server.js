const express = require('express')
let app = express()

app.use(express.static('public'))

const http = require("http").createServer(app)
const io = require("socket.io")(http)

io.on("connection", socket => {
    socket.broadcast.emit("Hello!")
    console.log("a user connected")
    socket.on("chat message", msg => {
        console.log(`Message: ${msg}`)
        io.emit('chat message', msg)
    })
    socket.on("disconnect", () => {
        console.log("user disconnected")
    })
})

http.listen(3000, () => {
    console.log("Listening on port 3000")
})