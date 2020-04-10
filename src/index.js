import "./style.css";
$(function () {
    const socket = io();
    let userid = "";
    let first = false;

    $("form").submit((e) => {
        e.preventDefault(); // prevents page reloading
        if (first) {
            socket.emit("chat message", {
                id: userid,
                text: $("#m").val(),
            });
        } else {
            socket.emit("register", $("#m").val());
            first = true;
        }
        $("#m").val("");
        return false;
    });

    socket.on("register", function (id) {
        userid = id;
    });

    socket.on("chat message", function (msg) {
        $("#messages").append(
            $("<li>").text(msg.text).css("border-left-color", msg.colour)
        );
    });
});
