import React, { useState } from "react";

let MessageForm = (props) => {
    let [first, setFirst] = useState(false);

    let sendMessage = (e) => {
        e.preventDefault();
        if (first)
            props.s.emit("chat message", {
                id: props.id,
                text: e.target[0].value,
            });
        else {
            props.s.emit("register", e.target[0].value);
            setFirst(true);
        }
    };

    return (
        <form onSubmit={sendMessage}>
            <input type="text"></input>
            <button>Send</button>
        </form>
    );
};

export default MessageForm;
