function event() {
    $('#btnLoad').click(loadContacts);
    $('#btnCreate').click(createContact);
    let url = "https://phonebook-nakov.firebaseio.com/phonebook";
    function loadContacts() {
        $('#phonebook').empty();
        $.get(url + '.json')
            .then(displayContacts)
            .catch(displayError);
    }

    function displayContacts(contacts) {
        for(let key in contacts){
            let person = contacts[key]['person'];
            let phone = contacts[key]['phone'];

            $('#phonebook')
                .append($('<li>').text(person + ': ' + phone + ' ')
                .append($('<button>').text('Delete').click(function () {
                    deleteContacts(key);
                })));

        }
    }

    function displayError(err) {
        $('#phonebook').append($('<li>').text('Error'));
    }

    function createContact() {
        let newContact = JSON.stringify({
            person: $('#person').val(),
            phone: $('#phone').val()
        });
        $.post(url + '.json', newContact)
            .then(loadContacts)
            .catch(displayError);

        $('#person').val('');
        $('#phone').val('');
    }

    function deleteContacts(key) {
        let req = {
            method: 'DELETE',
            url: url + '/' + key + '.json'
        };
        $.ajax(req)
            .then(loadContacts)
            .catch(displayError);
    }
}
