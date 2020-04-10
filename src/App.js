import React, { useState } from "react";
const socket = require("socket.io-client")();

let App = () => {
    let [messages, setMessages] = useState([]);

    socket.on("chat message", (msg) => {
        let newMessages = messages.concat([msg]);
        setMessages(newMessages);
    });

    let sendMessage = (e) => {
        e.preventDefault();
        socket.emit("chat message", e.target[0].value);
    };

    return (
        <>
            <h1>Messenger</h1>
            <ul>
                {messages.map((message, index) => (
                    <li key={index}>{message}</li>
                ))}
            </ul>
            <form onSubmit={sendMessage}>
                <input type="text"></input>
                <button>Send</button>
            </form>
        </>
    );
};

export default App;
