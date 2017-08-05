function startApp() {
    $('header').find('a').show();

    function showView(view) {
        $('section').hide();
        switch (view){
            case 'home': $('#viewHome').show();
                break;
            case 'login': $('#viewLogin').show();
                break;
            case 'register': $('#viewRegister').show();
                break;
            case 'ads': $('#viewAds').show();
                break;
            case 'createAd': $('#viewCreateAd').show();
                break;
            case 'editAd': $('#viewEditAd').show();
                break;
        }
    }

    function navigateTo(e) {
        $('section').hide();
        let target = $(e.target).attr('data-target');
        $('#' + target).show();
    }
    //attach eventlisteners
    $('header').find('a[data-target]').click(navigateTo);
    $('#buttonLoginUser').click(login);
    let requester = (()=>{
        const baseUrl = 'https://baas.kinvey.com/';
        const appKey = 'kid_r1oy4mQwb';
        const appSecret = 'bce69088689a45efb164f3c1aa205c14';

        function makeAuth(type) {
            if(type === 'basic'){
                return 'Basic' + btoa(appKey + appSecret);
            }else {
                return 'Kinvey ' + localStorage.getItem('authtoken');
            }
        }

        function makeRequest(method, module, url,auth) {
            let req = {
                url:baseUrl + module + appKey + '/' + url,
                method,
                headers:{
                    'Authorization': makeAuth(auth)
                }
            };
        }

        function get(module,url,auth) {
            return $.ajax(makeRequest('GET',module,url,auth));
        }

        function post(module,url,data,auth) {
            let req = makeRequest('POST',module,url,auth);
            req.data = data;
            return $.ajax(req);
        }

        function update(module,url,data,auth) {
            let req = makeRequest('PUT',module,url,auth);
            req.data = data;
            return $.ajax(req);
        }

        function remove(module,url,auth) {
            return $.ajax(makeRequest('DELETE',module,url,auth));
        }
        return {
            get,post,update,remove
        }
    })();
    
    function login() {
        let form = $('#formLogin');
        let username = form.find('input[name="username"]').val();
        let password = form.find('input[name="passwd"]').val();
        
    }
}