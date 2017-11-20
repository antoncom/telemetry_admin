$(document).ready(function(){

    // $.Resources is populated
    $.GetResourcesList();

    // $.Tariffs is populated
    $.GetTariffsList();

    // On page load: datatable
    var table_counters = $('#table_counters').dataTable({
        "columnDefs": [
             {
             "targets": [ 0 ],
             "visible": false,
             "searchable": false
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
            "url": "https://hometest.appix.ru/api/counters?quarter_id=49&table=1",
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
            {data: "active"}
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


    /*
    * {data: "id"},
     {data: "res"},
     {data: "name"},
     {data: "model"},
     {data: "verification"},
     {data: "active"}
    * */
    // Add company button
    $(document).on('click', '#add_counter', function(e){
        e.preventDefault();
        console.log("Tariffs:");
        console.log($.Tariffs);

        $.each($.Resources,function(key, value)
        {
            $('#res').append('<option value="' + value.value + '">' + value.label + '</option>');
            console.log(value.label + "=" + value.value);
        });

        $.each($.Tariffs,function(key, value)
        {
            $('.tariff').append('<option value="' + value.value + '">' + value.label + '</option>');
            console.log(value.label + "=" + value.value);
        });

        $('.lightbox_content h2').text('Добавить счётчик');
        $('#form_counter button').text('Добавить счётчик');
        $('#form_counter').attr('class', 'form add');
        $('#form_counter').attr('data-id', '');
        $('#form_counter .field_container label.error').hide();
        $('#form_counter .field_container').removeClass('valid').removeClass('error');
        //$('#form_counter #res').val('');
        $('#form_counter #name').val('');
        $('#form_counter #model').val('');
        $('#form_counter #verification').val('');
        $('#form_counter #verified_until').val('');
        $('#form_counter #active').val('');
        $('#form_counter #factory_num').val('');
        $('#form_counter #headquarters').val('');
        $('#form_counter #prod_year').val('');
        $('#form_counter #class').val('');
        $('#form_counter #seals').val('');
        $('#form_counter #seal_num').val('');
        $('#form_counter #inventory_num').val('');
        $('#form_counter #comm_date').val('');
        $('#form_counter #decomm_date').val('');
        $('#form_counter #initial_val').val('');
        $('#form_counter #final_val').val('');
        $('#form_counter #responsible').val('');
        $('#form_counter #tariff1').val('');
        $('#form_counter #tariff2').val('');
        $('#form_counter #tariff3').val('');
        $('#form_counter #tariff4').val('');

        show_lightbox();
    });

    // Add company submit form
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
                url:          'https://hometest.appix.ru/api/counters',
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

    // Edit company button
    $(document).on('click', '.function_edit a', function(e){
        e.preventDefault();
        // Get company information from database
        show_loading_message();
        var id      = $(this).data('id');
        var request = $.ajax({
            url:          'data.php?job=get_company',
            cache:        false,
            data:         'id=' + id,
            dataType:     'json',
            contentType:  'application/json; charset=utf-8',
            type:         'get'
        });
        request.done(function(output){
            if (output.result == 'success'){
                $('.lightbox_content h2').text('Edit company');
                $('#form_counter button').text('Edit company');
                $('#form_counter').attr('class', 'form edit');
                $('#form_counter').attr('data-id', id);
                $('#form_counter .field_container label.error').hide();
                $('#form_counter .field_container').removeClass('valid').removeClass('error');
                $('#form_counter #rank').val(output.data[0].rank);
                $('#form_counter #company_name').val(output.data[0].company_name);
                $('#form_counter #industries').val(output.data[0].industries);
                $('#form_counter #revenue').val(output.data[0].revenue);
                $('#form_counter #fiscal_year').val(output.data[0].fiscal_year);
                $('#form_counter #employees').val(output.data[0].employees);
                $('#form_counter #market_cap').val(output.data[0].market_cap);
                $('#form_counter #headquarters').val(output.data[0].headquarters);
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

    // Edit company submit form
    $(document).on('submit', '#form_counter.edit', function(e){
        e.preventDefault();
        // Validate form
        if (form_counter.valid() == true){
            // Send company information to database
            hide_ipad_keyboard();
            hide_lightbox();
            show_loading_message();
            var id        = $('#form_counter').attr('data-id');
            var form_data = $('#form_counter').serialize();
            var request   = $.ajax({
                url:          'data.php?job=edit_company&id=' + id,
                cache:        false,
                data:         form_data,
                dataType:     'json',
                contentType:  'application/json; charset=utf-8',
                type:         'get'
            });
            request.done(function(output){
                if (output.result == 'success'){
                    // Reload datable
                    table_companies.api().ajax.reload(function(){
                        hide_loading_message();
                        var company_name = $('#company_name').val();
                        show_message("Company '" + company_name + "' edited successfully.", 'success');
                    }, true);
                } else {
                    hide_loading_message();
                    show_message('Edit request failed', 'error');
                }
            });
            request.fail(function(jqXHR, textStatus){
                hide_loading_message();
                show_message('Edit request failed: ' + textStatus, 'error');
            });
        }
    });

    // Delete company
    $(document).on('click', '.function_delete a', function(e){
        e.preventDefault();
        var company_name = $(this).data('name');
        if (confirm("Are you sure you want to delete '" + company_name + "'?")){
            show_loading_message();
            var id      = $(this).data('id');
            var request = $.ajax({
                url:          'data.php?job=delete_company&id=' + id,
                cache:        false,
                dataType:     'json',
                contentType:  'application/json; charset=utf-8',
                type:         'get'
            });
            request.done(function(output){
                if (output.result == 'success'){
                    // Reload datable
                    table_companies.api().ajax.reload(function(){
                        hide_loading_message();
                        show_message("Company '" + company_name + "' deleted successfully.", 'success');
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