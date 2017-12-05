// Logout
// How to use: $.Logout();

(function($){
    $.Logout = function() {
        $.ajax({
            type : 'DELETE',
            url  : $.API_base + '/login',
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
        // callback
        console.log("callback GetResourcesList");

        $.ajax({
            type : 'GET',
            url  : $.API_base + '/resources',
            beforeSend: function(xhr){
                xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
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


// GetTariffsList
// How to use: $.GetTariffsList();
// As result - $.Tariffs array is populated.
(function($){
    $.GetTariffsList = function() {
        // callback
        console.log("callback GetTariffsList");
        $.ajax({
            type : 'GET',
            url  : $.API_base + '/tariffs',
            beforeSend: function(xhr){
                xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
            },
            success :  function(response) {
                var i;
                $.Tariffs = new Array();
                for(i = 0; i < response.length; i++){
                    $.Tariffs[i] = { 'label': response[i].name, 'value' : response[i].id };
                }
            },
            error :  function(response) {
                console.log('ERROR GetTariffsList()');
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
            url  : $.API_base + '/info',
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
            url  : $.API_base + '/info',
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
            url  : $.API_base + '/estates/' + estId,
            beforeSend: function(xhr){
                xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
                console.log('before ' + $.cookie('token'));
            },
            success :  function(response) {
                //console.log(response);
                return response;
            },
            error :  function(response) {
                console.log('ERROR GetEstate()');
                console.log(JSON.stringify(response));
            }
        });
    }

})(jQuery);

// -----------------
// For adding table rows dinamically we use this solution:
// https://stackoverflow.com/a/24490396

//Compose template string
String.prototype.compose = (function (){
    var re = /\{{(.+?)\}}/g;
    return function (o){
        return this.replace(re, function (_, k){
            return typeof o[k] != 'undefined' ? o[k] : '';
        });
    }
}());

// How to use:
//var tbody = $('#myTable').children('tbody');
//var table = tbody.length ? tbody : $('#myTable');
//var row = '<tr>'+
//    '<td>{{id}}</td>'+
//    '<td>{{name}}</td>'+
//    '<td>{{phone}}</td>'+
//    '</tr>';
//
//
////Add row
//table.append(row.compose({
//    'id': 3,
//    'name': 'Lee',
//    'phone': '123 456 789'
//}));
// -----------------


// Формирование <TITLE> Breadcrumbs и заголовков страниц
// Анализируем URI и на основе этого получаем и обновляем нелбходимые данные в заголовках HTML страницы
$(document).ready(function() {
    var uri = new URI(window.location);
// ЕСЛИ dom_details.html
// ЕСЛИ kvartira_details.html
// ЕСЛИ counter_details.html

    switch(uri.filename())  {
        case("dom_details.html"):
        case("kvartira_details.html"): {
            $.ajax({
                type : 'GET',
                url  : $.API_base + '/estates/' + $.GET("estate_id"),
                beforeSend: function(xhr){
                    xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
                },
                success :  function(response) {
                    if(response.id > 0)  {
                        $(".dom_address").html(response.address);
                        $("title").html("Дома и сектора | Дома | " + response.address);
                        $.cookie('estate_address', response.address);
                        $.cookie('estate_id', response.id);
                    }
                    else {
                        console.log('NO $(".dom_address") updates');
                    }
                },
                error :  function(response) {
                    console.log('ERROR GetResourcesList()');
                    console.log(JSON.stringify(response));
                }
            });
            break;
        }
        case("***.html"): {

            break;
        }

        default: ;
    }
});





