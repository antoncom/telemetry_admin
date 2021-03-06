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
                if(response.role == 4) $("span[data-field='role']").html('Абонент<b class="caret"></b>');


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


// GetAbonentInfo
// How to use: $.GetAbonentInfo();
// On success - <span data-field="key">value</span> are populated
var abo_counters_template_home = '<div class="col-lg-3"><a href="doma_sectora.html" style="color: white;!important">'
    + '<div class="widget style1 navy-bg"><div class="row">'
    + '<div class="col-xs-4"><i class="fa fa-tachometer fa-4x" aria-hidden="true"></i></div>'
    + '<div class="col-xs-8 text-right"><span class="abonent_resource_name">{{res_name}}</span>'
    + '<h2 class="font-bold"><span class="abonent_res_counters" style="float: right;">{{res_counters}}</span></h2><span style="font-size: 12px; padding: 15px 25px 0 0; display: block;">Cчётчиков: </span>'
    + '</div></div></div></a></div>';
(function($){
    $.GetAbonentInfo = function() {
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
                    switch(key) {
                        case('name'):
                        case('address'):
                        case('objects'):    {
                            $("span[data-field='" + key + "']").html(value);
                            break;
                        }
                        case('role'):    {
                            if(response.role == 4) $("span[data-field='role']").html('Абонент<b class="caret"></b>');
                            console.log($("span[data-field='role']"));
                            break;
                        }
                        case('counters'):    {
                            var abo_home_widgets = $('#abo_home_widgets');

                            $.each( value, function( index, obj ) {
                                abo_home_widgets.append(abo_counters_template_home.compose({
                                    'res_name': obj.resource,
                                    'res_counters': obj.count
                                }));
                            });
                            break;
                        }
                        default:;
                    }
                });
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
        case("kvartira_details.html"):
        case("counter_details.html"):
        case("equipment_details.html"): {
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

    // TODO
    // Добавить получение номера квартиры по URL-параметру kvaty_id
    // Таким образом полный адрес квартиры получать в одном месте (только здесь) и передавать его на страницы через coookie
    // Получение адреса дома и номера квартиры реализовать в виде последовательно выполняемых функций.

});





