// remove whitespace from both end of string
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

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


// Referrer - to redirect after login
var pathname = window.location.pathname;
var href = window.location.href;
if(pathname.search(/login.html/i) == -1)    {
    $.cookie('referrer', href);
}


// GetResourcesList
// How to use: $.GetResourcesList();
// As result - $.Resources array is populated.
(function($){
    $.GetResourcesList = function() {
        var def = new $.Deferred();
        $.ajax({
            type : 'GET',
            url  : $.API_base + '/resources',
            beforeSend: function(xhr){
                xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
            },
            success :  function(response) {
                // Save response
                $.Resources(response).Store();
                // done
                console.log("DONE GetResourcesList");
                def.resolve();
            },
            error :  function(response) {
                console.log('ERROR GetResourcesList()');
                console.log(JSON.stringify(response));
            }
        });
        return def.promise();
    }

})(jQuery);


// GetTariffsList
// How to use: $.GetTariffsList();
// As result - $.Tariffs array is populated.
(function($){
    $.GetTariffsList = function() {
        var def = new $.Deferred();
        $.ajax({
            type : 'GET',
            //async: false,
            url  : $.API_base + '/tariffs',
            beforeSend: function(xhr){
                xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
            },
            success :  function(response) {
                // Save response
                $.Tarifs(response).Store();

                // Deprecated because of $.Tarifs created instead
                var i;
                $.Tariffs = new Array();
                for(i = 0; i < response.length; i++){
                    // Indexed array was returned earlier
                    //$.Tariffs[i] = { 'label': response[i].name, 'value' : response[i].id };

                    // Associative array is returned instead of indexed array
                    $.Tariffs[response[i].id] = { 'label': response[i].name, 'value' : response[i].id };
                }
                // done
                console.log("DONE GetTariffsList");

                def.resolve();
            },
            error :  function(response) {
                console.log('ERROR GetTariffsList()');
                console.log(JSON.stringify(response));
            }
        });
        return def.promise();
    }

})(jQuery);



// EXAMPLE OF EXTENDED JQUERY OBJECT
// https://stackoverflow.com/questions/7291564/accessing-jquery-custom-object-functions-and-properties

//(function ($) {
//    $.myObject = function (options) {
//        var opts = $.extend({}, $.myObject.defaults, options),
//            privateMethod = function (msg) {
//                alert(opts.start + ': ' + msg);
//            };
//
//        return {
//            publicMethod: function (msg) {
//                privateMethod(msg);
//            }
//        }
//    };
//    $.myObject.defaults = {
//        start: '1'
//    };
//
//})(jQuery);
//
//$(function () {
//    $.myObject().publicMethod('One');
//    $.myObject({'start': '100'}).publicMethod('Two');
//    $.myObject.defaults.start = '1000';
//    $.myObject().publicMethod('Three');
//    $.myObject().privateMethod('Four');
//});

// $.Tarifs()
// HOW TO USE
// $.Tarifs(response).Store(); - save data to $.Tarifs.defaults.data
// Here "response" is object loaded from API

// $.Tarifs(response).Data(); - return data as is
// $.Tarifs().Data(); - return data stored previously with .Store() method.
// $.Tarifs().Data(id); - return Arr with 1 element where id = tarif id

// $.Tarifs(response).Html(); - return <option> list as HTML
// $.Tarifs().Html(); - return <option> list as HTML from data stored previously with .Store() method.
(function ($) {
    $.Tarifs = function (options) {
        var opts = $.extend({}, options),
            htmlPrivateMethod = function (selector) {
                // Create HTML <OPTIONS> for SELECT
                var html = '';
                for(i = 0; i < options.length; i++){
                    html += '<option value="' + options[i].id + '">' + options[i].res_name + '</option>';
                }
                return html;
            },
            dataPrivateMethod = function (id) {
                var arr = new Array();
                for(i = 0; i < options.length; i++){
                    if(id == null)  {
                        arr[options[i].id] = { 'id': options[i].id, 'name' : options[i].name, 'price' : options[i].price, 'res' : options[i].res, 'units' : options[i].units };
                    }
                    else if (id == options[i].id) {
                        arr[options[i].id] = { 'id': options[i].id, 'name' : options[i].name, 'price' : options[i].price, 'res' : options[i].res, 'units' : options[i].units };
                        break;
                    }
                }
                return arr;
            };

        return {
            Html: function (msg) {
                return htmlPrivateMethod(msg);
            },
            Data: function (id) {
                return {
                    Get: function (param) {
                        return $.Tarifs.defaults.data[id][param];
                    }
                }
            },
            Store: function () {
                for(i = 0; i < options.length; i++){
                    $.Tarifs.defaults.data[options[i].id] = {name: options[i].name , price: options[i].price , units: options[i].units , res_name: options[i].res_name , res: options[i].res};
                }
            }
        }
    };
    $.Tarifs.defaults = {
        data: new Array()
    };
})(jQuery);


// $.Resources()
// HOW TO USE
// $.Resources(response).Store(); - save data to $.Resources.defaults.data
// Here "response" is object loaded from API

// $.Resources(response).Data(); - return data as is
// $.Resources().Data(); - return data stored previously with .Store() method.

// $.Resources(response).Html(); - return <option> list as HTML
// $.Resources().Html(); - return <option> list as HTML from data stored previously with .Store() method.
// $.Resources().Html(id); - return <option> list as HTML with selected="selected" attribute pointed with id
(function ($) {
    $.Resources = function (options) {
        var opts = $.extend({}, options),
            htmlPrivateMethod = function (id) {
                // Create HTML <OPTIONS> for SELECT
                var html = '';
                if(options == undefined) options = $.Resources.defaults.data;

                for(i = 0; i < options.length; i++){
                    selected = (options[i].id === id) ? 'selected="selected"' : '';
                    html += '<option value="' + options[i].id + '" ' + selected + '>' + options[i].name + '</option>';
                }
                return html;
            },
            dataPrivateMethod = function (id) {
                var arr = new Array();
                if(typeof options === 'undefined') options = $.Resources.defaults.data;
                for(i = 0; i < options.length; i++){
                    if(id == null)  {
                        arr[options[i].id] = { 'id': options[i].id, 'name' : options[i].name };
                    }
                    else if (id == options[i].id) {
                        arr[options[i].id] = { 'id': options[i].id, 'name' : options[i].name };
                        break;
                    }
                }
                return arr;
            };

        return {
            Html: function (id) {
                return htmlPrivateMethod(id);
            },
            Data: function (msg) {
                return dataPrivateMethod(msg);
            },
            Store: function (msg) {
                $.Resources.defaults.data = options;
            }
        }
    };
    $.Resources.defaults = {
        data: {}
    };
})(jQuery);

// Get data from URL parameters
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


// EstateAddressInUse
(function($){
    $.EstateAddressRemoteValid = function(address, estates) {
        var address_input = address.toLowerCase();
        // remove all spaces
        address_input = address_input.replace(/\s/g, '');
        var address_db = "";
        var out = "true";
        $.each(estates, function(i, value) {
            address_db = value.address.toLowerCase();
            // remove all spaces
            address_db = address_db.replace(/\s/g, '');
            if(address_db === address_input)    {
                out = "false";
                return false; // exit from $.each loop
            }
        });
        return out;
    }
})(jQuery);



//// ************ Lightbox operating general functions ********** /////
// Show message
function show_message(message_text, message_type){
    $('#message').html('<p>' + message_text + '</p>').attr('class', message_type);
    $('#message_container').show();
    if (typeof timeout_message !== 'undefined'){
        window.clearTimeout(timeout_message);
    }
    timeout_message = setTimeout(function(){
        hide_message();
    }, 8000);
}
// Hide message
function hide_message(){
    $('#message').html('').attr('class', '');
    $('#message_container').hide();
}

// Show loading message
function show_loading_message(){
    $('#loading_container').show();
}
// Hide loading message
function hide_loading_message(){
    $('#loading_container').hide();
}

// Show lightbox
function show_lightbox(){
    $('.lightbox_bg').show();
    $('.lightbox_container').show();
}
// Hide lightbox
function hide_lightbox(){
    $('.lightbox_bg').hide();
    $('.lightbox_container').hide();

    // clear all form fields
    $('.lightbox_container form input').each(function (index, el){
        $(el).val('');
    });
    $('.lightbox_container form select').each(function (index, el){
        $(el).html('<option value="">- Нет -</option>');
    });
}
// Lightbox background
$(document).on('click', '.lightbox_bg', function(){
    hide_lightbox();
});
// Lightbox close button
$(document).on('click', '.lightbox_close', function(){
    hide_lightbox();
});
// Escape keyboard key
$(document).keyup(function(e){
    if (e.keyCode == 27){
        hide_lightbox();
    }
});

// Hide iPad keyboard
function hide_ipad_keyboard(){
    document.activeElement.blur();
    $('input').blur();
}

//// END of Lightbox operating general functions ********** /////





