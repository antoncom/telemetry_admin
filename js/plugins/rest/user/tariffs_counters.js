$(document).ready(function(){

    // $.Resources is populated
    $.GetResourcesList();

    // $.Tariffs is populated
    $.GetTariffsList();

    // Предварительное получение данных, а затем выполнение всего прочего
    $.when($.GetResourcesList(), $.GetTariffsList()).done(function() {
        allTheRest();
    });

    function allTheRest()   {
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

                    if(key=='created' && value != undefined) {
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

        var table_counters = $('#table_counters').dataTable({
            "columnDefs": [
                {
                    "targets": [ 0 ],
                    "visible": false,
                    "searchable": false
                },
                {
                    "render": function ( data, type, row ) {
                        var out = "";
                        $.each($.Resources,function(key, value) {
                            if (value.value == data)    {
                                out = value.label;
                                return false;
                            }
                        });
                        return out;
                    },
                    "targets": 1
                },
                {
                    "render": function ( data, type, row ) {
                        return (data) ? "ВКЛ" : "Выкл" ;

                    },
                    "targets": 5
                },
                {
                    "render": function ( data, type, row ) {
                        return '<a class="link" href="counter_details.html?counter_id=' + row.id + '"><span>Просмотр</span></a>';

                    },
                    "targets": 6
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
                "url": $.API_base + "/counters?quarter_id=" + $.GET("kvart_id") + "&table=1",

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
                {data: "res"},
                {data: "name"},
                {data: "model"},
                {data: "verification"},
                {data: "active"},
                {
                    data: null
                }
            ]
        });


        // Counter files table
        var table_counter_files = $('#table_counter_files').dataTable({
            "language": {
                "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Russian.json"
            },
            responsive: true,
            dom: '<"html5buttons"B>Tfgt<"bottom"lp>',
            //data: output.files,
            data: null,
            "columnDefs": [
                {
                    "render": function ( data, type, row ) {
                        return '<div class="function_buttons"><ul><li class="function_edit"><a data-id="' + row.id + '" data-name="' + row.name + '"><span>Edit</span></a></li><li class="function_delete"><a data-id="' + row.id + '" data-name="' + row.name + '" data-counter-id="' + $('#form_counter').attr('data-id') + '"><span>Delete</span></a></li></ul></div>';

                    },
                    "targets": 4
                }
            ],
            columns: [
                {
                    title: "id",
                    data: "id"
                },
                {
                    title: "name",
                    data: "name"
                },
                {
                    title: "title",
                    data: "title"
                },
                {
                    title: "size",
                    data: "size"
                },

                {
                    data: null,
                    className: "functions"
                    //defaultContent: '<div class="function_buttons"><ul><li class="function_edit"><a data-id=""><span>Edit</span></a></li><li class="function_delete"><a data-id="' + row.id + '"><span>Delete</span></a></li></ul></div>'
                }
            ]
        });

        // Counter RFID
        var table_counter_readers = $('#table_counter_readers').dataTable({
            "language": {
                "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Russian.json"
            },
            responsive: true,
            dom: '<"html5buttons"B>Tfgt<"bottom"lp>',
            //data: output.files,
            data: null,
            "columnDefs": [
                {
                    "render": function ( data, type, row ) {
                        return '<div class="function_buttons"><ul><li class="function_edit"><a data-id="' + row.id + '" data-name="' + row.rfid + '"><span>Edit</span></a></li><li class="function_delete"><a data-id="' + row.id + '" data-name="' + row.rfid + '" data-counter-id="' + $('#form_counter').attr('data-id') + '"><span>Delete</span></a></li></ul></div>';

                    },
                    "targets": 2
                }
            ],
            columns: [
                {
                    title: "id",
                    data: "id"
                },
                {
                    title: "RFID",
                    data: "rfid"
                },
                {
                    title: "Ред.",
                    data: null,
                    className: "functions"
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
        var form_counter = $('#form_counter');
        form_counter.validate({
            rules: {
                name: {
                    required: true
                },
                res:    {
                    required: true
                }
            }
        });



        // Add counter button
        $(document).on('click', '#add_counter', function(e){
            e.preventDefault();

            $('.lightbox_container h2').text('Добавить счётчик');
            $('#form_counter button').text('Сохранить');
            $('#form_counter').attr('class', 'form add');
            $('#form_counter').attr('data-id', '');
            $('#form_counter .field_container label.error').hide();
            $('#form_counter .field_container label.error').hide();
            $('#form_counter .field_container').removeClass('valid').removeClass('error');
            $('#form_counter #quarter_id').val($.GET("kvart_id"));

            // Populate options in form selectors
            populateOptions();

            $('#form_counter #name').val('');
            $('#form_counter #model').val('');
            $('#form_counter #verification').val('');
            $('#form_counter #verified_until').val('');
            $('#form_counter #active').val('0');
            $('#form_counter #factory_num').val('');
            $('#form_counter #headquarters').val('');
            //$('#form_counter #prod_year').val('');
            $('#form_counter #class').val('');
            $('#form_counter #seals').val('');
            $('#form_counter #seal_num').val('');
            $('#form_counter #inventory_num').val('');
            $('#form_counter #comm_date').val('');
            $('#form_counter #decomm_date').val('');
            $('#form_counter #initial_value').val('');
            $('#form_counter #final_value').val('');
            $('#form_counter #responsible').val('');
            $('#form_counter #tariff1').val('');
            $('#form_counter #tariff2').val('');
            $('#form_counter #tariff3').val('');
            $('#form_counter #tariff4').val('');

            show_lightbox();
        });

        // Add counter submit form
        $(document).on('submit', '#form_counter.add', function(e){
            e.preventDefault();
            // Validate form
            if (form_counter.valid() == true){
                // Send company information to database
                hide_ipad_keyboard();
                hide_lightbox();
                show_loading_message();
                var form_data = $('#form_counter').serialize();
                var request   = $.ajax({
                    url:          $.API_base + '/counters',
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
                        table_counters.api().ajax.reload(function(){
                            hide_loading_message();
                            var counter_name = $('#name').val();
                            show_message("Счётчик '" + counter_name + "' успешно добавлен. ID счётчика: " + output.id, 'success');
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




        // Delete counter
        $(document).on('click', '#table_counters .function_delete a', function(e){
            e.preventDefault();
            var counter_id = $(this).data('id');
            if (confirm("Вы уверены, что хотите удалить счётчик ID = '" + counter_id + "'?")){
                show_loading_message();
                var id      = $(this).data('id');
                var request   = $.ajax({
                    url:          $.API_base + '/counters/' + id,
                    beforeSend: function(xhr){
                        xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
                    },
                    cache:        false,
                    type:         'DELETE'
                });
                request.done(function(output){
                    if (output.status == 'ok'){
                        // Reload datable

                        table_counters.api().ajax.reload(function(){
                            hide_loading_message();
                            show_message("Счётчик ID= '" + counter_id + "' удалён успешно.", 'success');
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


    } // End allTheRest() Function




    // Populate options in form selectors
    function populateOptions()  {
        // Poulate resources
        if($('#form_counter #res option').length <= 1)    {
            $.each($.Resources,function(key, value)
            {
                $('#form_counter #res').append('<option value="' + value.value + '">' + value.label + '</option>');
            });
        }

        // Populate tariffs
        if($('#tariff1 option').length <= 1)    {
            $.each($.Tariffs,function(key, value)
            {
                $('#form_counter #tariff1').append('<option value="' + value.value + '">' + value.label + '</option>');
                $('#form_counter #tariff2').append('<option value="' + value.value + '">' + value.label + '</option>');
                $('#form_counter #tariff3').append('<option value="' + value.value + '">' + value.label + '</option>');
                $('#form_counter #tariff4').append('<option value="' + value.value + '">' + value.label + '</option>');
            });
        }

        // Popuate Year of production for counter
        if($('#form_counter #prod_year option').length <= 1) {
            var i, yr, now = new Date();
            for (i = 0; i < 30; i++) {
                yr = now.getFullYear() - 10 + i; // or whatever
                $('#form_counter #prod_year').append($('<option/>').val(yr).text(yr));
            }
            ;
        }
    }





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


});