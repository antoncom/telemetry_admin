$(document).ready(function(){

    $( function() {
        $( "#verified_until" ).datepicker();
        $( "#verified_until" ).datepicker( "option", "dateFormat", "yy-mm-dd" );

        $( "#verification" ).datepicker();
        $( "#verification" ).datepicker( "option", "dateFormat", "yy-mm-dd" );

/*
        $( "#prod_year" ).datepicker();
        $( "#prod_year" ).datepicker( "option", "dateFormat", "yy" );
*/

        $( "#comm_date" ).datepicker();
        $( "#comm_date" ).datepicker( "option", "dateFormat", "yy-mm-dd" );

        $( "#decomm_date" ).datepicker();
        $( "#decomm_date" ).datepicker( "option", "dateFormat", "yy-mm-dd" );
    } );


    // $.Resources is populated
    $.GetResourcesList();

    // $.Tariffs is populated
    $.GetTariffsList();

    populateCounterData();
    reloadTelemetreadersTable();

    function populateCounterData()  {
        // Populate html table with Counter data
        $.ajax({
            type : 'GET',
            url  : $.API_base + '/counters/' + $.GET("counter_id"),
            beforeSend: function(xhr){
                xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
            },
            success :  function(response) {
                $.each(response, function(key, value) {
                    switch(key) {
                        case("res"):    {
                            $.each($.Resources,function(k, v) {
                                if (v.value == value)    {
                                    value = v.label;
                                    return false;
                                }
                            });
                            break;
                        }
                        case("tariff1"):
                        case("tariff2"):
                        case("tariff3"):
                        case("tariff4"):   {
                            if(value == null) {value = "–"; break; }
                            $.each($.Tariffs,function(k, v) {
                                if (v.value == value)    {
                                    value = v.label;
                                    return false;
                                }
                            });
                            break;
                        }

                        default:    {
                            if(value == null) value = "";
                            if(key == "active") value = (value) ? "Активный" : "Неактивный";
                            break;
                        }
                    }

                    if(key=='created') {
                        value = value.substring(0,10);
                        value = value.replace(/-/g,".");
                    }
                    if(key=='address')  {
                        value = $.cookie('estate_address') + ', кв. ' + value;
                    }
                    if(key=='area')  {
                        value = value + " м²";
                    }

                    $('table[data=counter] tr td[data-editor-field='+key).text(value);

                    if(key=='files')  {
                        // Populate table of files
                        table_counter_files.fnClearTable();
                        if(value.length > 0) table_counter_files.fnAddData(value);
                    }


                });
                //return response;
                hide_loading_message();

                // callback
                var $dfStep3 = new $.Deferred();
                console.log("callback populateCounterData");
                $dfStep3.resolve();
                return $dfStep3.promise();
            },
            error :  function(response) {
                console.log('ERROR GetEstate()');
                console.log(JSON.stringify(response));
            }
        });
    }




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



    // On page load: datatable

    // Counter files table
    var table_counter_files = $('#table_counter_files').dataTable({
        "language": {
            "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Russian.json"
        },
        responsive: true,
        dom: 'Tgt',
        //data: output.files,
        data: null,
        "columnDefs": [
            {
                "render": function ( data, type, row ) {
                    return '<div class="function_buttons"><ul><li class="function_delete"><a data-id="' + row.id + '" data-name="' + row.name + '" data-counter-id="' + $('#form_counter').attr('data-id') + '"><span>Delete</span></a></li></ul></div>';

                },
                "targets": 2
            }
        ],
        columns: [
            {
                title: "name",
                data: "name"
            },
            {
                title: "size",
                data: "size"
            },

            {
                title: "del",
                data: null,
                className: "functions"
                //defaultContent: '<div class="function_buttons"><ul><li class="function_edit"><a data-id=""><span>Edit</span></a></li><li class="function_delete"><a data-id="' + row.id + '"><span>Delete</span></a></li></ul></div>'
            }
        ]
    });

    dataSet = "";

    // Counter files readers
    var table_counter_readers = $('#table_counter_readers').dataTable({
        "language": {
            "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Russian.json"
        },
        responsive: true,
        dom: 'Tgt',
        data: null,
        "columnDefs": [
            {
                "render": function ( data, type, row ) {
                    return '<div class="function_buttons"><ul><li class="function_delete"><a data-id="' + row.id + '"><span>Delete</span></a></li></ul></div>';

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
        form_counter.validate({
            rules: {
                res: {
                    required: true
                },
                name: {
                    required: true
                }
            }
        });
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


    // Edit counter button
    $(document).on('click', '#edit_counter', function(e){
        e.preventDefault();

        // Populate options in form selectors
        populateOptions();

        // Get counter information from database
        show_loading_message();
        var id      = $.GET('counter_id')
        var request   = $.ajax({
            url:          $.API_base + '/counters/' + id,
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
                $('.lightbox_container h2').text('Редактировать счётчик');
                $('#form_counter button').text('Сохранить изменения');
                $('#form_counter').attr('class', 'form edit');
                $('#form_counter').attr('data-id', id);
                $('#form_counter .field_container label.error').hide();
                $('#form_counter .field_container').removeClass('valid').removeClass('error');
                var resName = "";
                $.each($.Resources,function(k, v) {
                    if (v.value == output.res)    {
                        resName = v.label;
                        return false;
                    }
                });
                $('#form_counter #res').text(resName);

                $('#form_counter #name').val(output.name);
                $('#form_counter #model').val(output.model);
                $('#form_counter #verification').val(output.verification);
                $('#form_counter #verified_until').val(output.verified_until);
                $('#form_counter #active').val(output.active);
                if(output.active) $('#form_counter #active').val(1);
                else $('#form_counter #active').val(0);
                $('#form_counter #factory_num').val(output.factory_num);
                $('#form_counter #headquarters').val(output.headquarters);
                $('#form_counter #prod_year').val(output.prod_year);
                $('#form_counter #class').val(output.class);
                $('#form_counter #seals').val(output.seals);
                $('#form_counter #seal_num').val(output.seal_num);
                $('#form_counter #inventory_num').val(output.inventory_num);
                $('#form_counter #comm_date').val(output.comm_date);
                $('#form_counter #decomm_date').val(output.decomm_date);
                $('#form_counter #initial_value').val(output.initial_value);
                $('#form_counter #final_value').val(output.final_value);
                $('#form_counter #responsible').val(output.responsible);
                $('#form_counter #tariff1').val(output.tariff1);
                $('#form_counter #tariff2').val(output.tariff2);
                $('#form_counter #tariff3').val(output.tariff3);
                $('#form_counter #tariff4').val(output.tariff4);



                // Populate table of files
                //table_counter_files.fnClearTable();
                //if(output.files.length > 0) table_counter_files.fnAddData(output.files);


                // Populate table of telemetry readeers
                //reloadTelemetreadersTable();



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

    // Edit counter submit form
    $(document).on('submit', '#form_counter.edit', function(e){
        e.preventDefault();

        // Validate form
        if (form_counter.valid() == true){
            // Send counter information to database
            hide_ipad_keyboard();
            hide_lightbox();
            show_loading_message();
            var id        = $.GET('counter_id');
            var form_data = $('#form_counter').serialize();
            var request   = $.ajax({
                url:          $.API_base + '/counters/' + id,
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
                if (output.status == 'ok'){

                    populateCounterData();
                    //hide_loading_message();
                    var counter_name = $('#name').val();
                    show_message("Счётчик '" + counter_name + "' ID = " + id + " успешно обновлён.", 'success');

                    /*// Reload datable
                    table_counters.api().ajax.reload(function(){
                        hide_loading_message();
                        var counter_name = $('#name').val();
                        show_message("Счётчик '" + counter_name + "' ID = " + id + " успешно обновлён.", 'success');
                    }, true);*/
                } else {
                    hide_loading_message();
                    show_message(output.message, 'error');
                }
            });
            request.fail(function(jqXHR, textStatus){
                hide_loading_message();
                show_message('Edit request failed: ' + textStatus, 'error');
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
                "dataSrc": function ( json ) {
                    if(json.status == "error" && json.code == 401)  {
                        setTimeout(' window.location.href = "login.html"; ', 10);
                    }
                    else {
                        return json.data;
                    }
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


    // File UPLOAD

    // Обновление таблицы со списком файлов счётчика
    // Активируется при добавлении, удалении файла счётчика
    function reloadFilesTable() {

        // Update files list
        // Get counter information from database
        var counter_id = $.GET("counter_id");
        show_loading_message();
        var request   = $.ajax({
            url:          $.API_base + '/counters/' + counter_id,
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
                table_counter_files.fnClearTable();
                if(output.files.length > 0) table_counter_files.fnAddData(output.files);

                hide_loading_message();
                //show_lightbox();
            } else {
                if(output.status == "error" && output.code == 401)  {
                    setTimeout(' window.location.href = "login.html"; ', 10);
                }
                else {
                    hide_loading_message();
                    show_message('Information request failed: reloadFilesTable()', 'error');
                }
            }
        });
    };

    // Reload telemetry readers table
    function reloadTelemetreadersTable() {
        var counter_id = $.GET('counter_id');
        show_loading_message();
        var request   = $.ajax({
            url:          $.API_base + '/readers?counter_id=' + counter_id,
            beforeSend: function(xhr){
                xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
            },
            cache:        false,
            type:         'GET'
        });
        request.done(function(output){
            if (output.id >= 0){ // reader exists or list of readers is empty
                table_counter_readers.fnClearTable();
                // reader exists
                if (output.id > 0) {
                    table_counter_readers.fnAddData(output);
                    $( "#rfid" ).prop( "disabled", true );
                    $( "#add_reader" ).prop( "disabled", true );
                    $( "#rfid").val('');
                    $('#form_reader').hide()
                }

                // callback
                var $dfStep4 = new $.Deferred();
                console.log("callback reloadTelemetreadersTable");
                $dfStep4.resolve();
                return $dfStep4.promise();

                hide_loading_message();
            } else {
                if(output.status == "error" && output.code == 401)  {
                    setTimeout(' window.location.href = "login.html"; ', 10);
                }
                else {
                    hide_loading_message();
                    show_message('Information request failed: reloadTelemetreadersTable()', 'error');
                }
            }
        });
    };

    // Upload files for counter
    Dropzone.options.dropzoneForm = {
        url: "https://hometest.appix.ru/api/files",
        maxFilesize: 5,
        //dictDefaultMessage: '<span class="text-center"><span class="font-lg visible-xs-block visible-sm-block visible-lg-block"><span class="font-lg"><i class="fa fa-caret-right text-danger"></i> Drop files <span class="font-xs">to upload</span></span><span>&nbsp&nbsp<h4 class="display-inline"> (Or Click)</h4></span>',
        dictResponseError: 'Error uploading file!',
        previewTemplate: '<div class="dz-preview"></div>',
        headers: {
            'X-Auth-Token': $.cookie('token'),
            'Cache-Control': null,
            'X-Requested-With': null
        },
        init: function() {
            this.on("sending", function(file, xhr, formData){
                var counter_id = $.GET('counter_id');
                formData.append("counter_id", counter_id);
                formData.append("title", file.upload.filename);
                formData.append("fileName", "file");

            }),
            this.on("success", function(file, xhr){
                reloadFilesTable();
            })
        }
    };





    // Delete file for counter
    $(document).on('click', '#table_counter_files .function_delete a', function(e){
        e.preventDefault();
        var file_name = $(this).data('name');
        var counter_id      = $.GET("counter_id");
        if (confirm("Вы уверены, что хотите удалить файл счётчика '" + file_name + "'?")){
            show_loading_message();
            var id      = $(this).data('id');
            var request   = $.ajax({
                url:          $.API_base + '/files/' + id,
                beforeSend: function(xhr){
                    xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
                },
                cache:        false,
                type:         'DELETE'
            });
            request.done(function(output){
                if (output.status == 'ok'){

                    reloadFilesTable();
                    show_message("Файл '" + file_name + "' удалён успешно.", 'success');
                } else {
                    hide_loading_message();
                    show_message('Delete request failed: no status=ok', 'error');
                }
            });
            request.fail(function(jqXHR, textStatus){
                hide_loading_message();
                show_message('Delete request failed: ' + textStatus, 'error');
            });
        }
    });


    // ADD TELEMETRY READER
   /* $(document).on('submit', '#form_reader', function(e) {
        e.preventDefault();

        // Validate form
        var form_reader = $('#form_reader');
        form_reader.validate();
        if (form_reader.valid() == true){
            // Send RFID information to database

            show_loading_message();
            var counter_id        = $.GET('counter_id');
            var form_data = $('#form_reader').serialize();
            var request   = $.ajax({
                url:          $.API_base + '/readers',
                beforeSend: function(xhr){
                    xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
                },
                cache:        false,
                data:         form_data,
                dataType:     'json',
                type:         'POST'
            });
            request.done(function(output){
                if (output.id > 0){

                    // Reload RFID datatable
                    reloadTelemetreadersTable();
                    show_message("Считыватель ID=" + output.id + " успешно добавлен.", 'success');
                } else {
                    hide_loading_message();
                    show_message(output.message, 'error');
                }
            });
            request.fail(function(jqXHR, textStatus){
                hide_loading_message();
                show_message('Edit request failed: ADD READER ' + textStatus, 'error');
            });
        }
    });*/

    // ON ADD_READER BUTTON
    $(document).on('click', '#add_reader', function(e){
        e.preventDefault();
        var rfid = $('#rfid').val();

            show_loading_message();
        var counter_id        = $.GET('counter_id');
        var form_data = $('#form_reader').serialize();
        form_data += '&counter_id=' + counter_id;

        console.log(form_data);
        var request   = $.ajax({
            url:          $.API_base + '/readers',
            beforeSend: function(xhr){
                xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
            },
            cache:        false,
            data:         form_data,
            dataType:     'json',
            type:         'POST'
        });
        request.done(function(output){
            if (output.id > 0){
                // Reload RFID datatable
                reloadTelemetreadersTable();
                show_message("Считыватель ID=" + output.id + " успешно добавлен.", 'success');

            } else {
                hide_loading_message();
                show_message(output.message, 'error');
            }
        });
        request.fail(function(jqXHR, textStatus){
            hide_loading_message();
            show_message('Edit request failed: ADD READER ' + textStatus, 'error');
        });

    });


    // Delete reader
    $(document).on('click', '#table_counter_readers .function_delete a', function(e){
        e.preventDefault();
        var reader_id = $(this).data('id');
        if (confirm("Вы уверены, что хотите удалить считыватель ID = '" + reader_id + "'?")){
            show_loading_message();
            var request   = $.ajax({
                url:          $.API_base + '/readers/' + reader_id,
                beforeSend: function(xhr){
                    xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
                },
                cache:        false,
                type:         'DELETE'
            });
            request.done(function(output){
                if (output.status == 'ok'){
                    // Reload datable
                    reloadTelemetreadersTable();
                        hide_loading_message();
                        show_message("Считыватель ID= '" + reader_id + "' удалён успешно.", 'success');
                    $( "#rfid" ).prop( "disabled", false );
                    $( "#add_reader" ).prop( "disabled", false );
                    $('#form_reader').show();
                } else {
                    hide_loading_message();
                    show_message('Delete request failed', 'error');
                }
            });
            request.fail(function(jqXHR, textStatus){
                hide_loading_message();
                show_message('Delete request failed: Delete reader' + textStatus, 'error');
            });
        }
    });


});