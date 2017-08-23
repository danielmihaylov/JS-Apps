$(() => {
    renderCatTemplate();

    function renderCatTemplate() {
        let allCats = $(cats);
        let catsT = $('#cats-template').html();
        let catT = $('#cat-template').html();
        Handlebars.registerPartial('cats',catT);
        let template = Handlebars.compile(catsT);

        let context = {
            allCats
        };

        $('#allCats').html(template(context));

        $('.btn-primary').click(viewStatusDetails);

        function viewStatusDetails() {
            let catParent = $(this).parent();
            let btnText = $(this);
            if(btnText.text() === 'Show status code'){
                btnText.text('Hide status code');
            }else {
                btnText.text('Show status code');
            }
            $(catParent).find('div').toggle();
        }
    }
});
