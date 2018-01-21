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
                var i;
                $.Resources = new Array();
                for(i = 0; i < response.length; i++){
                    $.Resources[i] = { 'label': response[i].name, 'value' : response[i].id };
                }
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
                var i;
                $.Tariffs = new Array();
                for(i = 0; i < response.length; i++){
                    $.Tariffs[i] = { 'label': response[i].name, 'value' : response[i].id };
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





