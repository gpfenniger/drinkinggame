import React, { useState } from "react";

let MessageDisplay = (props) => {
    let [messages, setMessages] = useState([]);

    props.s.on("chat message", (msg) => {
        let newMessages = messages.concat([msg]);
        setMessages(newMessages);
    });

    return (
        <ul>
            <li>
                Send a message by using the input bar below. Your first message
                will register as your name
            </li>
            <li>
                Send the phrase 'hit me' in your message to display a drinking
                challenge
            </li>
            {messages.map((message, index) => (
                <li key={index}>{message}</li>
            ))}
        </ul>
    );
};

export default MessageDisplay;
