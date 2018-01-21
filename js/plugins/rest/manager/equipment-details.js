$(document).ready(function(){


    // Populate html table with Quarter data
    $.ajax({
        type : 'GET',
        url  : $.API_base + '/quarters/' + $.GET("kvart_id"),
        beforeSend: function(xhr){
            xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
        },
        "dataSrc": function ( json ) {
            if(json.status == "error" && json.code == 401)  {
                //console.log("LOHIN FAILED");
                setTimeout(' window.location.href = "login.html"; ', 10);
            }
            else {
                return json.data;
            }
        },
        success :  function(response) {

            // Данные в таблице для жилых и нежилых помещений
            var labels_types12 = {
                type: "Тип:",
                address: "Адрес:",
                area: "Площадь помещения:",
                owner: "Собственник:",
                phone: "Телефон:",
                tenants: "Число прописанных:",
                created: "Дата заведения карточки:",
                login: "Логин:",
                counters: "Число приборов учёта:"
            };

            // Данные в таблице для "Счётчики ОДУ" и "Прочее обрудование"
            var labels_types34 = {
                type: "Тип:",
                address: "Адрес:",
                created: "Дата заведения карточки:"
            };

            // Получаем объект "response" только с нужными свойствами
            if(response.type == 3 || response.type == 4) var labels = labels_types34;
            else var labels = labels_types12;
            var response_reduced = Object.keys(labels).reduce(function(o, k) { o[k] = response[k]; return o; }, {});

            var tbody = $('#quarter_details').children('tbody');
            var quarter_table = tbody.length ? tbody : $('#quarter_details');
            var row = '<tr>'+
                '<th>{{name}}</th>'+
                '<td>{{value}}</td>'+
                '</tr>';

            $.each(response_reduced, function(key, value) {
                if(key == 'type') {
                    switch(value){
                        case(1): {
                            value = "Жилая";
                            $("#quarter_subheader").text("Данные квартиры / частного дома");
                            break;
                        }
                        case(2): {
                            value = "Нежилая";
                            $("#quarter_subheader").text("Данные помещения");
                            break;
                        }
                        case(3): {
                            value = "Счётчик ОДУ";
                            $("#quarter_subheader").text("Данные счётчиков ОДУ");
                            break;
                        }
                        case(4): {
                            value = "Оборудование";
                            $("#quarter_subheader").text("Данные оборудования");
                            break;
                        }
                        default:;
                    }
                }
                if(key=='created') {
                    value = value.substring(0,10);
                    value = value.replace(/-/g,".");
                }
                if(key=='address')  {
                    if(value> 0)    {
                        $.cookie('estate_homenum', value);
                        value = $.cookie('estate_address') + ', кв. ' + value;
                    }
                    else {
                        value = $.cookie('estate_address');
                    }
                }
                if(key=='area')  {
                    value = value + " м²";
                }

                // Добавляем строку таблицы с данными
                quarter_table.append(row.compose({
                    'name': labels[key],
                    'value': value
                }));
            });
        },
        error :  function(response) {
            console.log('ERROR GetEstate()');
            console.log(JSON.stringify(response));
        }
    });


    // On page load: datatable

    dataSet = "";

    var table_equipment = $('#table_equipment').dataTable({
        "columnDefs": [
            {
                "render": function ( data, type, row ) {
                    return '<div class="function_buttons"><ul><li class="function_edit"><a data-id="' + row.id + '" data-name="' + row.name + '"><span>Edit</span></a></li><li class="function_delete"><a data-id="' + row.id + '" data-name="' + row.name + '" data-equipment-id="' + $('#form_equipment').attr('data-id') + '"><span>Delete</span></a></li></ul></div>';
                },
                "targets": 2
            }
         ],
        "language": {
            "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Russian.json"
        },
        "oLanguage": {
            "oPaginate": {
                "sFirst":       " ",
                "sPrevious":    " ",
                "sNext":        " ",
                "sLast":        " ",
            },
            "sLengthMenu":    "Число строк: _MENU_",
            "sInfo":          "Total of _TOTAL_ records (showing _START_ to _END_)",
            "sInfoFiltered":  "(filtered from _MAX_ total records)"
        },
        pageLength: 25,
        responsive: true,
        dom: 'Tgt',
        ajax: {
            "url": $.API_base + "/equipment?quarter_id=" + $.GET("kvart_id") + "&table=1",
            "beforeSend": function (xhr) {
                xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
            },
            "dataSrc": function ( json ) {
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
            {data: "name"},
            {
                data: null,
                className: "functions"
                //defaultContent: '<div class="function_buttons"><ul><li class="function_edit"><a data-id=""><span>Edit</span></a></li><li class="function_delete"><a><span>Delete</span></a></li></ul></div>'
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
    var form_equipment = $('#form_equipment');
    form_equipment.validate({
        rules: {
            name: {
                required: true
            }
        }
    });

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

    // Add equipment button
    $(document).on('click', '#add_equipment', function(e){
        e.preventDefault();

        $('.lightbox_container h2').text('Добавить оборудование');
        $('#form_equipment button').text('Сохранить');
        $('#form_equipment').attr('class', 'form add');
        $('#form_equipment').attr('data-id', '');
        $('#form_equipment .field_container label.error').hide();
        $('#form_equipment .field_container label.error').hide();
        $('#form_equipment .field_container').removeClass('valid').removeClass('error');

        $('#form_equipment #quarter_id').val($.GET("kvart_id"));
        $('#form_equipment #name').val('');
        $('#form_equipment #model').val('');
        $('#form_equipment #rfid').val('');
        $('#form_equipment #channel_num').val('');
        $('#form_equipment #contact_type').val('0');
        $('#form_equipment #alert_type').val('');
        $('#form_equipment #phone').val('');

        show_lightbox();
    });

    // Edit equipment button
    $(document).on('click', '.function_edit a', function(e){
        e.preventDefault();
        // Get equipment information from database
        show_loading_message();
        var id      = $(this).data('id');
        var request = $.ajax({
            url: $.API_base + "/equipment/" + id,
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
            type:         'GET'
        });
        request.done(function(output){
            if (output.id > 0){
                $('.lightbox_container h2').text('Редактировать оборудование');
                $('#form_equipment button').text('Сохранить');
                $('#form_equipment').attr('class', 'form edit');
                $('#form_equipment').attr('data-id', id);
                $('#form_equipment .field_container label.error').hide();
                $('#form_equipment .field_container').removeClass('valid').removeClass('error');
                $('#form_equipment #equipment_id').val(output.id);
                $('#form_equipment #name').val(output.name);
                $('#form_equipment #model').val(output.model);
                $('#form_equipment #rfid').val(output.rfid);
                $('#form_equipment #contact_type').val(output.contact_type);
                $('#form_equipment #alert_type').val(output.alert_type);
                hide_loading_message();
                show_lightbox();
            } else {
                hide_loading_message();
                show_message('Information request failed', 'error');
            }
        });
        request.fail(function(jqXHR, textStatus){
            hide_loading_message();
            show_message('Information request failed: ' + textStatus, 'error');
        });
    });

    // Edit equipment submit form
    $(document).on('submit', '#form_equipment.edit', function(e){
        e.preventDefault();
        // Validate form
        if (form_equipment.valid() == true){
            // Send company information to database
            hide_ipad_keyboard();
            hide_lightbox();
            show_loading_message();
            var form_data = $('#form_equipment').serialize();
            var id      = $(this).data('id');
            var request   = $.ajax({
                url:          $.API_base + '/equipment/' + id,
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
                    table_equipment.api().ajax.reload(function(){
                        hide_loading_message();
                        var equipment_name = $('#name').val();
                        show_message("Оборудование '" + equipment_name + "' успешно обновлено. ID оборудования: " + id, 'success');
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

    // Add equipment submit form
    $(document).on('submit', '#form_equipment.add', function(e){
        e.preventDefault();
        // Validate form
        if (form_equipment.valid() == true){
            // Send company information to database
            hide_ipad_keyboard();
            hide_lightbox();
            show_loading_message();
            var form_data = $('#form_equipment').serialize();
            var request   = $.ajax({
                url:          $.API_base + '/equipment',
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
                    table_equipment.api().ajax.reload(function(){
                        hide_loading_message();
                        var equipment_name = $('#name').val();
                        show_message("Счётчик '" + equipment_name + "' успешно добавлен. ID оборудования: " + output.id, 'success');
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


    // Delete equipment
    $(document).on('click', '#table_equipment .function_delete a', function(e){
        e.preventDefault();
        var equipment_id = $(this).data('id');
        if (confirm("Вы уверены, что хотите удалить оборудование ID = '" + equipment_id + "'?")){
            show_loading_message();
            var id      = $(this).data('id');
            var request   = $.ajax({
                url:          $.API_base + '/equipment/' + id,
                beforeSend: function(xhr){
                    xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
                },
                cache:        false,
                type:         'DELETE'
            });
            request.done(function(output){
                if (output.status == 'ok'){
                    // Reload datable

                    table_equipment.api().ajax.reload(function(){
                        hide_loading_message();
                        show_message("Оборудование ID= '" + equipment_id + "' удалёно успешно.", 'success');
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
});