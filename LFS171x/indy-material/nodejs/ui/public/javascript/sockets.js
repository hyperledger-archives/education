let socket;

$(function () {
    if(window.WebSocket){
        socket = io({
            transports: ['websocket']
        });

        socket.on('chat message', function(msg){
            $('#testMessages').append($('<li>').text(msg));
            // window.scrollTo(0, document.body.scrollHeight);
        });

        socket.on('sovrin message', function(msg) {
            msg = JSON.parse(msg);

            if(messageParsers[msg.type]) {
                return messageParsers[msg.type](msg.message);
            } else {
                return defaultMessageParser(msg);
            }
        })
    } else {
        alert("Your browser does not support WebSockets. Please upgrade your browser.");
    }

});








let messageParsers = {};

messageParsers["urn:sovrin:agent:message_type:sovrin.org/ui/new_message"] = function(msg) {
    $('#messages').append(```
<div class="center w3-padding">
    <div class="w3-card w3-container" >
        <p>From: blah</p>
        <p>Type: blah type</p>
        <p>Received blah timestamp</p>
        <div>
            <p>Message:</p>
                <p>${msg.message}</p>
            <br><br>
        </div>
    </div>
</div>
```);
};

function defaultMessageParser(msg) {
    alert(`You received a message of unsupported type: ${msg}`);
}


function sendSovrinMessage(messageType, form) {
    let elements = {};
    for(let element of form.elements) {
        if(element.type !== "submit") {
            elements[element.name] = element.value;
        }
    }
    socket.emit('sovrin message', JSON.stringify({
        type: messageType,
        elements: elements
    }));
}