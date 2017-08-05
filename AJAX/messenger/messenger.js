function event() {
    let url = 'https://messanger-6eff2.firebaseio.com/messenger';

    function loadMessage() {
        $.get(url + '.json').then(displayMessages);
    }

    function displayMessages(messages) {
        $('#messages').empty();
        let orderedMessages = {};

        messages = Object.keys(messages).sort((a,b) => a.timestamp - b.timestamp)
            .forEach(k => orderedMessages[k] = messages[k]);
        for(let message of Object.keys(orderedMessages)){
            $('#messages').append(`${orderedMessages[message]['author']}: ${orderedMessages[message]['content']}\n`);
        }
    }

    function createMessage() {
        let data = {
            author:$('#author').val(),
            content:$('#content').val(),
            timestamp: Date.now()
        };
        $.post(url + '.json',JSON.stringify(data)).then(loadMessage);
    }
    $('#submit').click(createMessage);
    $('#refresh').click(loadMessage);

    loadMessage();
}