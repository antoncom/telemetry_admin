
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

// selector = '#form_counter #res', e.g. html selector of <select>
function populateResourcesSelect(selector)   {
    // Poulate resources
    if($(selector + ' option').length <= 1)    {
        $.each($.Resources,function(key, value)
        {
            $(selector).append('<option value="' + value.value + '">' + value.label + '</option>');
        });
    }
}





