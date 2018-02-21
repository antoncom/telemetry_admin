//var editor; // use a global for the submit and return data rendering in the examples

$(document).ready(function() {

    // check token
    if($.cookie('token') == null)   {
        window.location.href = "login.html"
    }

    $.GetUserName();


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
            },
            {
                "targets": [ 3 ],
                "visible": false,
                "searchable": false
            },
            {
                "render": function ( data, type, row ) {
                    return '<a href="dom_details.html?estate_id=' + row.id + '">' + data + '</a>';
                },
                "targets": 2
            },
            {
                "render": function ( data, type, row ) {
                    return '<div class="function_buttons"><ul><li class="function_edit"><a data-id="' + row.id + '" data-name="' + row.name + '"><span>Edit</span></a></li><li class="function_delete"><a data-id="' + row.id + '" data-name="' + row.name + '" data-counter-id="' + $('#form_counter').attr('data-id') + '"><span>Delete</span></a></li></ul></div>';

                },
                "targets": 8
            }
        ],
        "language": {
            "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Russian.json"
        },
        pageLength: 25,
        responsive: true,
        dom: '<"html5buttons"B>Tfgt<"bottom"lp>',
        ajax: {
            "url": $.API_base + "/estates?table=1",
            "beforeSend": function (xhr) {
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
            {data: "type"},
            {data: "address"},
            {data: "name"},
            {data: "resident"},
            {data: "nonresident"},
            {data: "counters"},
            {data: "equipment"},
            {
                data: null,
                className: "functions"
            }
        ],
        select: true,
        buttons: [
            'excelHtml5',
            'csvHtml5',
            'pdfHtml5',
            {
                extend: 'print',
                customize: function (win) {
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');

                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                }
            },
            {
                text: 'Add',
                action: function ( e, dt, node, config ) {
                    show_loading_message();

                    /*$.when($.GetResourcesList()).done(function(){
                     $('.lightbox_container h2').text('Добавить тариф');
                     $('#form_tariff button').text('Сохранить');
                     $('#form_tariff').attr('class', 'form add');
                     $('#form_tariff').attr('data-id', '');
                     $('#form_tariff .field_container label.error').hide();
                     $('#form_tariff .field_container label.error').hide();
                     $('#form_tariff .field_container').removeClass('valid').removeClass('error');
                     $('#form_tariff #res').append($.Resources().Html());
                     $('#form_tariff #tariff_name').val('');
                     $('#form_tariff #units').val('');
                     $('#form_tariff #price').val('');*/

                    hide_loading_message();
                    show_lightbox();
                }
            }
        ]
    });

} );