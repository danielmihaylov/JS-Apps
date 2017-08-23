async function attachEvents() {
    let context = {
        towns: []
    };

    let town = await $.get('./templates/town.html');
    Handlebars.registerPartial('liTown', town);
    let template = Handlebars.compile(town);

    $('#btnLoadTowns').click(showTowns);

    function showTowns() {
        context.towns = [];
        let towns = $('#towns').val().split(', ').forEach(e => context.towns.push({name: e}));
        let html = template(context);
        $('#root').html(html);
    }
}