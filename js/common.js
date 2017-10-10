// Logout
// How to use: $.Logout();
(function($){
    $.Logout = function() {
        $.ajax({
            type : 'DELETE',
            url  : 'https://hometest.appix.ru/api/login',
            beforeSend: function(xhr){
                xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
            },
            success :  function(response) {
                $.removeCookie('token');
                $.removeCookie('role');
                setTimeout(' window.location.href = "login.html"; ', 10);
            },
            error :  function(response) {
                console.log('ERROR LOGOUT');
                console.log(JSON.stringify(response));
            }
        });
    }

})(jQuery);

// GetResourcesList
// How to use: $.GetResourcesList();
// As result - $.Resources array is populated.
(function($){
    $.GetResourcesList = function() {
        $.ajax({
            type : 'GET',
            url  : 'https://hometest.appix.ru/api/resources',
            beforeSend: function(xhr){
                xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
                console.log('before ' + $.cookie('token'));
            },
            success :  function(response) {
                var i;
                $.Resources = new Array();
                for(i = 0; i < response.length; i++){
                    $.Resources[i] = { 'label': response[i].name, 'value' : response[i].id };
                }
            },
            error :  function(response) {
                console.log('ERROR GetResourcesList()');
                console.log(JSON.stringify(response));
            }
        });
    }

})(jQuery);


// GetGeneralInfo
// How to use: $.GetGeneralInfo();
// On success - <span data-field="key">value</span> are populated at the home page
(function($){
    $.GetGeneralInfo = function() {
        $.ajax({
            type : 'GET',
            url  : 'https://hometest.appix.ru/api/info',
            "data": {
                "counters": "1"
            },
            "dataType": "json",
            beforeSend: function(xhr){
                xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
            },
            success :  function(response) {
                $.each( response, function( key, value ) {
                    $("span[data-field='" + key + "']").html(value);
                });
                if(response.role == 2) $("span[data-field='role']").html('Менеджер<b class="caret"></b>');
                if(response.role == 1) $("span[data-field='role']").html('Администратор<b class="caret"></b>');
            },
            error :  function(response) {
                console.log('ERROR GetGeneralInfo()');
                console.log(JSON.stringify(response));
            }
        });
    }

})(jQuery);

// GetUserName
// How to use: $.GetUserName();
// On success - <span data-field="key">value</span> are populated
(function($){
    $.GetUserName = function() {
        $.ajax({
            type : 'GET',
            url  : 'https://hometest.appix.ru/api/info',
            "data": {
                "counters": "0"
            },
            "dataType": "json",
            beforeSend: function(xhr){
                xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
            },
            success :  function(response) {
                $.each( response, function( key, value ) {
                    $("span[data-field='" + key + "']").html(value);
                });
                if(response.role == 2) $("span[data-field='role']").html('Менеджер<b class="caret"></b>');
                if(response.role == 1) $("span[data-field='role']").html('Администратор<b class="caret"></b>');
            },
            error :  function(response) {
                console.log('ERROR GetUserName()');
                console.log(JSON.stringify(response));
            }
        });
    }

})(jQuery);


// Referrer - to redirect after login
var pathname = window.location.pathname;
var href = window.location.href;
if(pathname.search(/login.html/i) == -1)    {
    $.cookie('referrer', href);
}

// Get estate_id
(function($){
    $.GET = function(sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                return sParameterName[1];
            }
        }
    }
})(jQuery);

// Get Estate data
(function($){
    $.GetEstate = function(estId) {
        $.ajax({
            type : 'GET',
            url  : 'https://hometest.appix.ru/api/estates/' + estId,
            beforeSend: function(xhr){
                xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
                console.log('before ' + $.cookie('token'));
            },
            success :  function(response) {
                //console.log(response);
                return response;
            },
            error :  function(response) {
                console.log('ERROR GetResourcesList()');
                console.log(JSON.stringify(response));
            }
        });
    }

})(jQuery);

