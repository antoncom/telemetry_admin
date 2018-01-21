var editor; // use a global for the submit and return data rendering in the examples

$(document).ready(function() {

    // check token
    if($.cookie('token') == null)   {
        window.location.href = "../../../../login.html"
    }

    $.GetUserName();

    editor = new $.fn.dataTable.Editor( {
        idSrc: "id",
        ajax: {
            create: {
                type: 'POST',
                url:  $.API_base + '/tariffs',
                headers: { 'X-Auth-Token': $.cookie('token') },
                data: function ( d ) {
                    var dd = Object();
                    dd.res = d.data[0].res;
                    dd.res_name = d.data[0].res_name;
                    dd.name = d.data[0].name;
                    dd.units = d.data[0].units;
                    dd.price = d.data[0].price;
                    dd.action = d.action;
                    return (dd);
                }
            },
            edit: {
                type: 'PUT',
                url:  $.API_base + '/tariffs/_id_',
                headers: { 'X-Auth-Token': $.cookie('token') },
                data: function ( d ) {
                    var dd = Object();
                    dd.res = d.data[editor.val( 'id' )].id;
                    dd.res = d.data[editor.val( 'id' )].res;
                    dd.res_name = d.data[editor.val( 'id' )].res_name;
                    dd.name = d.data[editor.val( 'id' )].name;
                    dd.units = d.data[editor.val( 'id' )].units;
                    dd.price = d.data[editor.val( 'id' )].price;
                    dd.action = d.action;
                    return(dd);
                },
                dataType: "json"
            },
            remove: {
                type: 'DELETE',
                url:  $.API_base + '/tariffs/_id_',
                headers: { 'X-Auth-Token': $.cookie('token') },
                /*data: function ( d ) {
                 console.log('DATA');
                 console.log(d);
                 var dd = Object();
                 dd.res = d.data[editor.val( 'id' )].id;
                 dd.res = d.data[editor.val( 'id' )].res;
                 dd.res_name = d.data[editor.val( 'id' )].res_name;
                 dd.name = d.data[editor.val( 'id' )].name;
                 dd.units = d.data[editor.val( 'id' )].units;
                 dd.price = d.data[editor.val( 'id' )].price;
                 dd.action = d.action;
                 return(dd);
                 },
                 dataType: "json"*/
            }
        },
        table: "#example",
        fields: [ {
            label: "АйДи",
            name: "id",
            type: "hidden"
        }, {
            label: "Энергоресурс",
            name: "res",
            type: "select"
        }, {
            label: "Название энергоресурса",
            name: "res_name",
            type: "hidden"
        }, {
            label: "Название тарифа:",
            name: "name"
        }, {
            label: "Единица измерения:",
            name: "units"
        }, {
            label: "Стоимость:",
            name: "price"
        }
        ],
        i18n: {
            create: {
                button: "Добавить",
                title:  "Добавить новый тариф",
                submit: "Добавить тариф"
            },
            edit: {
                button: "Редактировать",
                title:  "Редактировать тариф",
                submit: "Редактировать тариф"
            },
            remove: {
                button: "Удалить",
                title:  "Удалить тариф",
                submit: "Удалить тариф",
                confirm: {
                    _: "Подтвердить удаление?",
                    1: "Подтвердить удаление?"
                }
            }
        }
    } );


    // $.Resources is populated
    $.GetResourcesList();

    // update 'res' selector into the editor popup
    editor.on( 'initCreate', function ( e) {
        editor.field('res').update($.Resources );
    });

    editor.on( 'initEdit', function ( e) {
        editor.field('res').update($.Resources );
    });


    editor.on( 'preSubmit', function ( e) {
        editor.field( 'res_name' ).set( editor.get( 'res' ));
    });



    editor.on('close', function(e) {
        $('#example').DataTable().ajax.reload();
    });


    $('#example').DataTable({
        "columnDefs": [
            {
                "targets": [ 0 ],
                "visible": false,
                "searchable": false
            },
            {
                "targets": [ 1 ],
                "visible": false,
                "searchable": false
            }
        ],
        "language": {
            "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Russian.json"
        },
        pageLength: 25,
        responsive: true,
        dom: '<"html5buttons"B>Tfgt<"bottom"lp>',
        ajax: {
            "url": $.API_base + "/tariffs?table=1",
            "beforeSend": function (xhr) {
                console.log('token = ' + $.cookie('token'));
                xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
            },
            "dataSrc": function ( json ) {
                console.log(json);
                if(json.status == "error" && json.code == 401)  {
                    setTimeout(' window.location.href = "login.html"; ', 10);
                }
                else {
                    return json.data;
                }
            }
        },
        columns: [
            {data: "id"},
            {data: "res"},
            {data: "res_name"},
            {data: "name"},
            {data: "units"},
            {data: "price"}
        ],
        select: true,
        buttons: [
            {extend: "create", editor: editor},
            {extend: "edit", editor: editor},
            {extend: "remove", editor: editor},
            {extend: 'excel', title: 'ExampleFile'},
            {extend: 'pdf', title: 'ExampleFile'},
            {
                extend: 'print',
                customize: function (win) {
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');

                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                }
            }
        ]
    });

} );