//var editor; // use a global for the submit and return data rendering in the examples

$(document).ready(function() {

    // check token
    if($.cookie('token') == null)   {
        window.location.href = "login.html"
    }


    // Предварительное получение данных, а затем выполнение всего прочего
    $.when($.GetUserName(), $.GetResourcesList(), $.GetTariffsList()).done(function(){
        // Populate options in form selectors
        // populateOptions();

    });


    var table_tariffs = $('#table_tariffs').DataTable({
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
                "render": function ( data, type, row ) {
                    return '<div class="function_buttons"><ul><li class="function_edit"><a data-id="' + row.id + '" data-name="' + row.name + '"><span>Edit</span></a></li><li class="function_delete"><a data-id="' + row.id + '" data-name="' + row.name + '" data-counter-id="' + $('#form_counter').attr('data-id') + '"><span>Delete</span></a></li></ul></div>';

                },
                "targets": 6
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
            {data: "price"},
            {
                data: null,
                className: "functions"
            }

        ],
        select: false,
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

                    $.when($.GetResourcesList()).done(function(){
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
                        $('#form_tariff #price').val('');

                        hide_loading_message();
                        show_lightbox();
                    });
                }
            }
        ]
    });




    // On page load: form validation
    jQuery.validator.setDefaults({
        success: 'valid',
        rules: {
            name: {
                required: true
            }
        },
        errorPlacement: function(error, element){
            /*error.insertBefore(element);*/
        },
        highlight: function(element){
            /*$(element).parent('.field_selector').removeClass('valid').addClass('error');*/
            $(element).closest('.validation_container').removeClass('valid').addClass('error');
        },
        unhighlight: function(element){
            /*$(element).parent('.field_selector').addClass('valid').removeClass('error');*/
            $(element).closest('.validation_container').addClass('valid').removeClass('error');
        }
    });
    var form_tariff = $('#form_tariff');
    form_tariff.validate({
        rules: {
            tariff_name: {
                required: true
            },
            res:    {
                required: true
            },
            units: {
                required: true
            },
            price: {
                required: true
            }
        }
    });



    // Add tariff submit form
    $(document).on('submit', '#form_tariff.add', function(e){
        e.preventDefault();
        // Validate form
        var form_tariff = $('#form_tariff');
        if (form_tariff.valid() == true){
            hide_ipad_keyboard();
            var form_data = $('#form_tariff').serialize();
            hide_lightbox();
            show_loading_message();
            var request   = $.ajax({
                url:  $.API_base + '/tariffs',

                beforeSend: function(xhr){
                    xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
                },
                "dataSrc": function ( json ) {
                    if(json.status == "error" && json.code == 401)  {
                        setTimeout(' window.location.href = "login.html"; ', 10);
                    }
                    else {
                        return json.data;
                    }
                },
                cache:        false,
                data:         form_data,
                dataType:     'json',
                type:         'POST'
            });
            request.done(function(output){
                if (output.id > 0){
                    // Reload datable
                    table_tariffs.ajax.reload(function(){
                        hide_loading_message();
                        var tariff_name = $('#tariff_name').val();
                        show_message("Тариф успешно добавлен. ID тарифа: " + output.id, 'success');
                    }, true);
                } else {
                    hide_loading_message();
                    show_message(output.message, 'error');
                }
            });
            request.fail(function(jqXHR, textStatus){
                hide_loading_message();
                show_message('Add request failed: ' + textStatus, 'error');
            });
        }
    });


    // Edit tariff button
    $(document).on('click', '#table_tariffs .function_edit a', function(e){
        e.preventDefault();

        var tariff_id = $(this).data('id');
        show_loading_message();

        $.when($.GetResourcesList(), $.GetTariffsList()).done(function(){
            $('.lightbox_container h2').text('Редактировать тариф');
            $('#form_tariff button').text('Сохранить изменения');
            $('#form_tariff').attr('class', 'form edit');
            $('#form_tariff').attr('data-id', tariff_id);
            $('#form_tariff .field_container label.error').hide();
            $('#form_tariff .field_container').removeClass('valid').removeClass('error');
            $('#form_tariff #res').append($.Resources().Html($.Tarifs().Data(tariff_id).Get('res')));
            $('#form_tariff #tariff_name').val($.Tarifs().Data(tariff_id).Get('name'));
            $('#form_tariff #units').val($.Tarifs().Data(tariff_id).Get('units'));
            $('#form_tariff #price').val($.Tarifs().Data(tariff_id).Get('price'));

            hide_loading_message();
            show_lightbox();
        });
    });

    // Edit tariff submit form
    $(document).on('submit', '#form_tariff.edit', function(e){
        e.preventDefault();
        var tariff_id = $(this).data('id');
        // Validate form
        var form_tariff = $('#form_tariff');
        if (form_tariff.valid() == true){
            hide_ipad_keyboard();
            var form_data = $('#form_tariff').serialize();
            hide_lightbox();
            show_loading_message();
            var request   = $.ajax({
                url:  $.API_base + '/tariffs/' + tariff_id,

                beforeSend: function(xhr){
                    xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
                },
                "dataSrc": function ( json ) {
                    if(json.status == "error" && json.code == 401)  {
                        setTimeout(' window.location.href = "login.html"; ', 10);
                    }
                    else {
                        return json.data;
                    }
                },
                cache:        false,
                data:         form_data,
                dataType:     'json',
                type:         'PUT'
            });
            request.done(function(output){
                if (output.status == "ok"){
                    // Reload datable
                    table_tariffs.ajax.reload(function(){
                        hide_loading_message();
                        var tariff_name = $('#tariff_name').val();
                        show_message("Тариф успешно обновлён. ID тарифа: " + tariff_id, 'success');
                    }, true);
                } else {
                    hide_loading_message();
                    show_message(output.message, 'error');
                }
            });
            request.fail(function(jqXHR, textStatus){
                hide_loading_message();
                show_message('Add request failed: ' + textStatus, 'error');
            });
        }
    });


    // Delete tariff
    $(document).on('click', '#table_tariffs .function_delete a', function(e){
        e.preventDefault();
        var tariff_id = $(this).data('id');
        if (confirm("Вы уверены, что хотите удалить тариф ID = '" + tariff_id + "'?")){
            show_loading_message();
            var id      = $(this).data('id');
            var request   = $.ajax({
                url:          $.API_base + '/tariffs/' + id,
                beforeSend: function(xhr){
                    xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
                },
                cache:        false,
                type:         'DELETE'
            });
            request.done(function(output){
                if (output.status == 'ok'){
                    // Reload datable
                    table_tariffs.ajax.reload(function(){
                        hide_loading_message();
                        show_message("Тариф ID= '" + tariff_id + "' удалён успешно.", 'success');
                    }, true);
                } else {
                    hide_loading_message();
                    show_message('Delete request failed', 'error');
                }
            });
            request.fail(function(jqXHR, textStatus){
                hide_loading_message();
                show_message('Delete request failed: ' + textStatus, 'error');
            });
        }
    });

} );