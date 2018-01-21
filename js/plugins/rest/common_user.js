
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
                if(response.role == 4) $("span[data-field='role']").html(response.name + '<b class="caret"></b>');
            },
            error :  function(response) {
                console.log('ERROR GetGeneralInfo()');
                console.log(JSON.stringify(response));
            }
        });
    }

})(jQuery);

/*// GetUserName
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
                /!*$.each( response, function( key, value ) {
                    $("span[data-field='" + key + "']").html(value);
                });*!/
                if(response.role == 4) $("span[data-field='role']").html(response.name + '<b class="caret"></b>');
            },
            error :  function(response) {
                console.log('ERROR GetUserName()');
                console.log(JSON.stringify(response));
            }
        });
    }

})(jQuery);*/

// GetGeneralInfo_Home
// How to use: $.GetAbonentInfo();
// On success - <span data-field="key">value</span> are populated
var abo_counters_template_home = '<div class="col-lg-3"><a href="doma_sectora.html" style="color: white;!important">'
    + '<div class="widget style1 navy-bg"><div class="row">'
    + '<div class="col-xs-4"><i class="fa fa-tachometer fa-4x" aria-hidden="true"></i></div>'
    + '<div class="col-xs-8 text-right"><span class="abonent_resource_name">{{res_name}}</span>'
    + '<h2 class="font-bold"><span class="abonent_res_counters" style="float: right;">{{res_counters}}</span></h2><span style="font-size: 12px; padding: 15px 25px 0 0; display: block;">Cчётчиков: </span>'
    + '</div></div></div></a></div>';
(function($){
    $.GetGeneralInfo_Home = function() {
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
                            $("span[data-field='role']").html(response.name + '<b class="caret"></b>');
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





