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

    // Populate html table with Quarter data
    $.ajax({
        type : 'GET',
        url  : $.API_base + '/quarters/' + $.GET("kvart_id"),
        beforeSend: function(xhr){
            xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
            console.log('before ' + $.cookie('token'));
        },
        success :  function(response) {
            //console.log(response);

            $.each(response, function(key, value) {
                //console.log("KEY=" + key + " VALUE=" + value);
                if(key == 'type') {
                    switch(value){
                        case(1): value = "Жилая";
                            break;
                        case(2): value = "Нежилая";
                            break;
                        case(3): value = "Счётчик ОДУ";
                            break;
                        case(4): value = "Оборудование";
                            break;
                        default:;
                    }
                }
                if(key=='created') {
                    value = value.substring(0,10);
                    value = value.replace(/-/g,".");
                }
                $('table[data=quarter] tr td dd[data-editor-field='+key).text(value);

            });
            //return response;
        },
        error :  function(response) {
            console.log('ERROR GetEstate()');
            console.log(JSON.stringify(response));
        }
    });

    // $.Resources is populated
    $.GetResourcesList();

    // $.Tariffs is populated
    $.GetTariffsList();

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
                        $('#res').append('<option value="' + value.value + '">' + value.label + '</option>');
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
                    return '<div class="function_buttons"><ul><li class="function_edit"><a data-id="' + row.id + '"><span>Edit</span></a></li><li class="function_delete"><a data-id="' + row.id + '"><span>Delete</span></a></li></ul></div>';

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
        dom: '<"html5buttons"B>Tfgt<"bottom"lp>',
        ajax: {
            "url": $.API_base + "/counters?quarter_id=" + $.GET("kvart_id") + "&table=1",

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
            {data: "name"},
            {data: "model"},
            {data: "verification"},
            {data: "active"},
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
            fiscal_year: {
                required: true,
                min:      2000,
                max:      2025
            }
        },
        errorPlacement: function(error, element){
            error.insertBefore(element);
        },
        highlight: function(element){
            $(element).parent('.field_container').removeClass('valid').addClass('error');
        },
        unhighlight: function(element){
            $(element).parent('.field_container').addClass('valid').removeClass('error');
        }
    });
    var form_counter = $('#form_counter');
    form_counter.validate();

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

    // Add counter button
    $(document).on('click', '#add_counter', function(e){
        e.preventDefault();

        $('.lightbox_content h2').text('Добавить счётчик');
        $('#form_counter button').text('Добавить счётчик');
        $('#form_counter').attr('class', 'form add');
        $('#form_counter').attr('data-id', '');
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
                cache:        false,
                data:         form_data,
                dataType:     'json',
                type:         'POST'
            });
            request.done(function(output){
                console.log(output.id);
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
    $(document).on('click', '.function_edit a', function(e){
        e.preventDefault();

        // Populate options in form selectors
        populateOptions();

        // Get counter information from database
        show_loading_message();
        var id      = $(this).data('id');
        var request   = $.ajax({
            url:          $.API_base + '/counters/' + id,
            beforeSend: function(xhr){
                xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
            },
            cache:        false,
            type:         'GET'
        });
        request.done(function(output){
            if (output.id > 0){
                console.log(output);
                $('.lightbox_content h2').text('Редактировать счётчик');
                $('#form_counter button').text('Редактировать счётчик');
                $('#form_counter').attr('class', 'form edit');
                $('#form_counter').attr('data-id', id);
                $('#form_counter .field_container label.error').hide();
                $('#form_counter .field_container').removeClass('valid').removeClass('error');
                $('#form_counter #res').val(output.res);
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
                //$("#form_counter #tariff1 option").filter(function() {
                //    return this.text == output.tariff1;
                //}).attr('selected', true);
                //$("#form_counter #tariff2 option").filter(function() {
                //    return this.text == output.tariff2;
                //}).attr('selected', true);
                //$("#form_counter #tariff3 option").filter(function() {
                //    return this.text == output.tariff3;
                //}).attr('selected', true);
                //$("#form_counter #tariff4 option").filter(function() {
                //    return this.text == output.tariff4;
                //}).attr('selected', true);
                $('#form_counter #tariff2').val(output.tariff2);
                $('#form_counter #tariff3').val(output.tariff3);
                $('#form_counter #tariff4').val(output.tariff4);

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
            var id        = $('#form_counter').attr('data-id');
            var form_data = $('#form_counter').serialize();
            var request   = $.ajax({
                url:          $.API_base + '/counters/' + id,
                beforeSend: function(xhr){
                    xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
                },
                cache:        false,
                data:         form_data,
                dataType:     'json',
                type:         'PUT'
            });
            request.done(function(output){
                if (output.status == 'ok'){
                    // Reload datable
                    table_counters.api().ajax.reload(function(){
                        hide_loading_message();
                        var counter_name = $('#name').val();
                        show_message("Счётчик '" + counter_name + "' ID = " + id + " успешно оновлен.", 'success');
                    }, true);
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
    $(document).on('click', '.function_delete a', function(e){
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
});