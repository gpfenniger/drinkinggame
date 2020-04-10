import React, { useState } from "react";
import MessageForm from "./MessageForm";
import MessageDisplay from "./MessageDisplay";
const socket = require("socket.io-client")();

let App = () => {
    let [id, setid] = useState("");

    socket.on("register", (id) => {
        setid(id);
    });

    return (
        <>
            <h1>Machine Spirit of the Drinking God</h1>
            <MessageDisplay s={socket} />
            <MessageForm s={socket} id={id} />
        </>
    );
};

export default App;
