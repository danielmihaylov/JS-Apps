function startApp() {
    const appKey = 'kid_r1oy4mQwb';
    const appSecret = 'bce69088689a45efb164f3c1aa205c14';
    const baseUrl = 'https://baas.kinvey.com';

    homeView();
    hideLinkHeader();
    $('section').show();


    $(document).on({
        ajaxStart: function () {
            $("#loadingBox").show();
            $("button, input[type='button']").prop('disabled', true);
        },
        ajaxStop: function () {
            $("#loadingBox").hide();
            $("button, input[type='button']").prop('disabled', false);
        }
    });

    $("#loadingBox, #infoBox, #errorBox").click(function () {
        $(this).hide();
    });

    $("#linkHome").click(homeView);
    $("#linkLogin").click(loginView);
    $("#linkRegister").click(registrationView);
    $("#linkLogout").click(logout);
    $("#linkListAds").click(listAdsView);
    $("#linkCreateAd").click(createAdView);


    function homeView() {
        $.get('./templates/homeTemplate.html')
            .then(function (data) {
                $('#main').html(data)
            });

    }

    function loginView() {
        $.get('./templates/login-registerTemplate.html')
            .then(function (data) {
                let template = Handlebars.compile(data);
                $('#main').html(template({type: 'Login', btId: 'buttonLoginUser'}));
                $('#formLogin').trigger('reset');
                $('#buttonLoginUser').click(login);
            });
    }

    function registrationView() {
        $.get('./templates/login-registerTemplate.html')
            .then(function (data) {
                let template = Handlebars.compile(data);
                $('#main').html(template({type: 'Register', btId: 'buttonRegisterUser'}));
                $('#formRegister').trigger('reset');
                $('#buttonRegisterUser').click(register);
            });
    }

    function listAdsView() {
        $.get('./templates/adsTemplate.html')
            .then(function (data) {
                $.get('./templates/storeBoxTemplate.html')
                    .then(function (boxTemplate) {
                        Handlebars.registerPartial('adBox', boxTemplate);
                        let template = Handlebars.compile(data);
                        $.ajax({
                            url: baseUrl + '/appdata/' + appKey + '/prodavachnik/',
                            method: 'GET',
                            headers: {
                                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
                            },
                            success: successListAds,
                            error: handleError,
                        });
                        function successListAds(ads) {
                            for (let ad of ads) {
                                ad.isAuthor = ad._acl.creator === sessionStorage.getItem('userId');
                            }

                            let context = {
                                ads
                            };
                            $('#main').html(template(context));
                            $('#boxControler #deleteAd').click(deleteAd);
                            $('#boxControler #editAd').click(editAdView);
                            $('.storeBox #readMore').click(readMoreView);
                        }
                    });

            });
    }

    function createAdView() {
        $.get('./templates/createAdTemplate.html')
            .then(function (data) {
                let form = $.get('./templates/create-edit-formTemplate.html')
                    .then(function (formData) {
                        Handlebars.registerPartial('form', formData);
                        let template = Handlebars.compile(data);
                        $('#main').html(template({type: 'Create', btnId: 'buttonCreateAd'}));
                        $('#formCreateAd').trigger('reset');
                        $('#buttonCreateAd').click(createAd);
                    });

            });
    }

    function editAdView() {
        let id = $(this).parent().parent().parent().attr('data-id');

        $.ajax({
            method: 'GET',
            url: baseUrl + '/appdata/' + appKey + '/prodavachnik/' + id,
            headers: {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
            },
            success: successGetAd,
            error: handleError
        });

        function successGetAd(ad) {
            $.get('./templates/editStoreTemplate.html')
                .then(function (data) {
                    let form = $.get('./templates/create-edit-formTemplate.html')
                        .then(function (formData) {
                            let context = {
                                type: 'Edit',
                                btnId: 'buttonEditAd',
                                title: ad.title,
                                description: ad.description,
                                img: ad.img,
                                price: ad.price,
                            };
                            Handlebars.registerPartial('form', formData);
                            let template = Handlebars.compile(data);
                            $('#main').html(template(context));
                            $("#buttonEditAd").click(() => editAd(ad._id, ad.date, ad.publisher));
                        });
                });
        }

    }

    function hideLinkHeader() {
        $("#linkHome").show();
        $("#menu").find("#linkHome").show();
        if (sessionStorage.getItem('authToken')) {
            $("#linkLogout").show();
            $("#linkListAds").show();
            $("#linkCreateAd").show();
            $("#linkLogin").hide();
            $("#linkRegister").hide();
        } else {
            $("#linkLogout").hide();
            $("#linkListAds").hide();
            $("#linkCreateAd").hide();
            $("#linkLogin").show();
            $("#linkRegister").show();
        }
    }

    function saveSessionStorage(data) {
        sessionStorage.setItem('userName', data.username);
        sessionStorage.setItem('userId', data._id);
        sessionStorage.setItem('authToken', data._kmd.authtoken);
    }

    function readMoreView(ad) {
        let id = $(this).parent().attr('data-id');
        $.ajax({
            method: 'GET',
            url: baseUrl + '/appdata/' + appKey + '/prodavachnik/' + id,
            headers: {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
            },
            success: successGetReadMore,
            error: handleError
        });

        function successGetReadMore(ad) {
            $.get('./templates/readMoreTemplate.html')
                .then(function (data) {
                    $('#main').html(data);
                    readMore(ad);
                });
            function readMore(ad) {
                $('#viewReadMore').find('.readMore').text('');

                $(".imgContent").append(`<img src="${ad.img}">`);
                $("#readMoreTitle").text(ad.title);
                $("#readMoreDescription").text(ad.description);
                $("#readMorePublisher").text(ad.publisher);
                $("#readMoreDate").text(ad.date);
            }
        }
    }


    function deleteAd() {
        let id = $(this).parent().parent().parent().attr('data-id');
        $.ajax({
            method: 'DELETE',
            url: baseUrl + '/appdata/' + appKey + '/prodavachnik/' + id,
            headers: {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            },
            success: successDeleteAd,
            error: handleError
        });
        function successDeleteAd() {
            showInfo("Deleted ad success!");
            listAdsView();
        }
    }

    function createAd() {
        let createForm = $("#formCreateAd");
        let date = ( "0" + parseInt(new Date().getMonth() + 1)).slice(-2) + "/"
            + ("0" + new Date().getDate()).slice(-2) + "/" + new Date().getFullYear();
        let publisher = sessionStorage.getItem('userName');
        let description = createForm.find('[name="description"]').val();
        let title = createForm.find('[name="title"]').val();
        let img = createForm.find('[name="image"]').val();
        let price = createForm.find('[name="price"]').val();

        let curAd = {
            title,
            publisher,
            description,
            img,
            price,
            date
        };

        if (title.length == 0) {
            showError("Title cannot be empty!");
            return;
        }
        if (price.length == 0) {
            showError("Price cannot be empty!");
            return;
        }

        $.ajax({
            method: 'POST',
            url: baseUrl + '/appdata/' + appKey + "/prodavachnik",
            headers: {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(curAd),
            success: successCreateAd,
            error: handleError
        });
        function successCreateAd() {
            listAdsView();
            showInfo('Success created ad!');
        }
    }

    function editAd(id, date, userName) {
        let editForm = $("#formEditAd");
        let publisher = userName;
        let description = editForm.find('[name="description"]').val();
        let title = editForm.find('[name="title"]').val();
        let img = editForm.find('[name="image"]').val();
        let price = editForm.find('[name="price"]').val();

        let curAd = {
            title,
            publisher,
            description,
            img,
            price,
            date
        };
        if (title.length == 0) {
            showError("Title cannot be empty!");
            return;
        }
        if (price.length == 0) {
            showError("Price cannot be empty!");
            return;
        }
        $.ajax({
            method: 'PUT',
            url: baseUrl + '/appdata/' + appKey + "/prodavachnik/" + id,
            headers: {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(curAd),
            success: successEditAd,
            error: handleError
        });
        function successEditAd() {
            showInfo('Success edit ad!');
            listAdsView();
        }
    }

    function login() {
        let formLogin = $("#formLogin");
        let username = formLogin.find(`input[name="username"]`).val();
        let password = formLogin.find(`input[name="passwd"]`).val();

        $.ajax({
            method: "POST",
            url: baseUrl + "/user/" + appKey + "/login",
            headers: {
                'Authorization': 'Basic ' + btoa(appKey + ":" + appSecret),
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({username, password}),
            success: successLogin,
            error: handleError
        });

        function successLogin(data) {
            saveSessionStorage(data);
            listAdsView();
            hideLinkHeader();
            showInfo("Login success!");
        }
    }

    function logout() {
        $.ajax({
            method: 'POST',
            url: baseUrl + '/user/' + appKey + "/_logout",
            headers: {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            },
            success: successLogout,
            error: handleError
        });

        function successLogout(a) {
            sessionStorage.clear();
            showInfo("Logout success!");
            hideLinkHeader();
            homeView();
        }
    }

    function register() {
        let formLogin = $("#formRegister");
        let username = formLogin.find(`input[name="username"]`).val();
        let password = formLogin.find(`input[name="passwd"]`).val();

        if (username.length == 0) {
            showError("Username cannot be empty!");
            return;
        }
        if (password.length == 0) {
            showError("Password cannot be empty!");
        } else {
            $.ajax({
                url: baseUrl + "/user/" + appKey,
                method: "POST",
                headers: {
                    'Authorization': 'Basic ' + btoa(appKey + ":" + appSecret),
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({username, password}),
                success: successRegistration,
                error: handleError
            });
        }


        function successRegistration(data) {
            saveSessionStorage(data);
            listAdsView();
            hideLinkHeader();
            showInfo("Registration success!");
        }
    }


    function handleError(response) {
        let errorMsg = JSON.stringify(response);
        if (response.readyState === 0)
            errorMsg = "Cannot connect due to network error.";
        if (response.responseJSON &&
            response.responseJSON.description)
            errorMsg = response.responseJSON.description;
        showError(errorMsg);
    }

    function showInfo(message) {
        $('#infoBox').text(message).fadeIn(500);
        setTimeout(function () {
            $('#infoBox').fadeOut();
        }, 2000);
    }

    function showError(message) {
        $('#errorBox').text(message);
        $('#errorBox').show();
    }
}