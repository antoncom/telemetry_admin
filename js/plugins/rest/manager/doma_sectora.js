
$(document).ready(function() {

    // check token
    if($.cookie('token') == null)   {
        window.location.href = "login.html"
    }

    $.GetUserName();


    var table_estates = $('#table_estates').DataTable({
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
                    // Если в доме нет ни одного помещения, счётчика, оборудования, то делаем доступной кнопку Delete
                    var staff = data.resident + data.nonresident + data.counters + data.equipment;
                    var edit_link = '<div class="function_buttons"><ul><li class="function_edit"><a data-id="' + row.id + '" data-address="' + row.address + '"><span>Edit</span></a></li>';
                    var delete_link = '<li class="function_delete"><a data-id="' + row.id + '" data-address="' + row.address + '" data-counter-id="' + $('#form_counter').attr('data-id') + '"><span>Delete</span></a></li></ul></div>';
                    var links = '';
                    if (staff == 0) links = edit_link + delete_link;
                    else links = edit_link + '</ul></div>';
                    return links;
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
                action: function (e, dt, node, config) {
                    //show_loading_message();

                    $('.lightbox_container h2').text('Добавить дом');
                    $('#form_doma_sectora button').text('Сохранить');
                    $('#form_doma_sectora').attr('class', 'form add');
                    $('#form_doma_sectora').attr('data-id', '');
                    $('#form_doma_sectora .field_container label.error').hide();
                    $('#form_doma_sectora .field_container label.error').hide();
                    $('#form_doma_sectora .field_container').removeClass('valid').removeClass('error');
                    $('#form_doma_sectora #type').val();
                    $('#form_doma_sectora #address').val('');

                    //hide_loading_message();
                    show_lightbox();
                }
            }
        ]
    });

    // On page load: form validation
    jQuery.validator.setDefaults({
        errorPlacement: function(error, element){
            error.insertBefore(element);
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
    var form_doma_sectora = $('#form_doma_sectora');
    // format correct spaces
    $("input#address").on({
        change: function() {
            // remove double spaces etc.
            this.value = this.value.replace(/ {1,}/g," ");
            // remove spaces from both end of string
            this.value = this.value.trim();
            // remove spaces before punctuation
            this.value = this.value.replace(/\s+([.,!":])/g, '$1')
        }
    });

    form_doma_sectora.validate({
        // this is for "remote" option
        // it avoids ajax request on each onkeyup event
        // ajax request will run only onblur
        // Example: https://stackoverflow.com/questions/27612695/jquery-validate-remote-onblur-only-but-allow-onkeyup-for-rest
        onkeyup: function(element, event) {
            if ($(element).attr('name') == "address") {
                return false; // disable onkeyup for your element named as "name"
            } else { // else use the default on everything else
                if ( event.which === 9 && this.elementValue( element ) === "" ) {
                    return;
                } else if ( element.name in this.submitted || element === this.lastElement ) {
                    this.element( element );
                }
            }
        },
        onfocusin: function(element, event)   {
            // unhighlight input element
            $(element).parent().parent('.validation_container').removeClass('error');
            $(element).siblings('label.error').remove();
        },
        rules: {
            address: {
                required: true,
                minlength: 8,
                remote: { // Валидация адреса (проверка на существование адреса в БД)
                    url:  $.API_base + '/estates',
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
                    data: {
                        'address': 1
                    },
                    dataType:     'json',
                    dataFilter: function (data) {
                        var json = $.parseJSON(data);
                        if($.EstateAddressRemoteValid($('#form_doma_sectora #address').val(), json) == "false")
                            return JSON.stringify("Данный адрес уже присутствет в системе!");
                        else
                            return JSON.stringify("true");
                    },
                    type:         'GET'
                }
            }
        },
        messages: {
            address: {
                required: "Это поле обязательно для заполнения!",
                minlength: jQuery.validator.format("Введите как минимум {0} символов.")
            }
        }
    });

    // Add estate address submit form
    $(document).on('submit', '#form_doma_sectora.add', function(e){
        e.preventDefault();
        // Validate form
        var form = $('#form_doma_sectora');
        if (form.valid() == true){
            hide_ipad_keyboard();
            var form_data = form.serialize();
            hide_lightbox();
            show_loading_message();
            var request   = $.ajax({
                url:  $.API_base + '/estates',

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
                    table_estates.ajax.reload(function(){
                        hide_loading_message();
                        show_message("Дом успешно добавлен. ID дома: " + output.id, 'success');
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


    // Edit estate button
    $(document).on('click', '#table_estates .function_edit a', function(e){
        e.preventDefault();

        var estate_id = $(this).data('id');
        var estate_address = $(this).data('address');

        $('.lightbox_container h2').text('Редактировать адрес');
        $('#form_doma_sectora button').text('Сохранить');
        $('#form_doma_sectora').attr('class', 'form edit');
        $('#form_doma_sectora').attr('data-id', '');
        $('#form_doma_sectora .field_container label.error').hide();
        $('#form_doma_sectora .field_container label.error').hide();
        $('#form_doma_sectora .field_container').removeClass('valid').removeClass('error');
        $('#form_doma_sectora #estate_id').val(estate_id);
        $('#form_doma_sectora #address').val(estate_address);

            show_lightbox();
    });

    // Edit estate submit form
    $(document).on('submit', '#form_doma_sectora.edit', function(e){
        e.preventDefault();
        var estate_id = $('#form_doma_sectora #estate_id').val();
        var estate_address = $('#form_doma_sectora #address').val();
        // Validate form
        var form = $('#form_doma_sectora');
        if (form.valid() == true){
            hide_ipad_keyboard();
            var form_data = $('#form_doma_sectora').serialize();
            hide_lightbox();
            show_loading_message();
            var request   = $.ajax({
                url:  $.API_base + '/estates/' + estate_id,
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
                    table_estates.ajax.reload(function(){
                        hide_loading_message();
                        show_message("Адрес успешно обновлён: " + estate_address, 'success');
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

    // Delete address
    $(document).on('click', '#table_estates .function_delete a', function(e){
        e.preventDefault();
        var estate_id = $(this).data('id');
        var estate_address = $(this).data('address');
        if (confirm("Вы уверены, что хотите удалить адрес: '" + estate_address + "'?")){
            show_loading_message();
            var id      = $(this).data('id');
            var request   = $.ajax({
                url:          $.API_base + '/estates/' + id,
                beforeSend: function(xhr){
                    xhr.setRequestHeader('X-Auth-Token', $.cookie('token'));
                },
                cache:        false,
                type:         'DELETE'
            });
            request.done(function(output){
                if (output.status == 'ok'){
                    // Reload datable
                    table_estates.ajax.reload(function(){
                        hide_loading_message();
                        show_message("Адрес успешно удалён: '" + estate_address + "'.", 'success');
                    }, true);
                } else {
                    hide_loading_message();
                    show_message('Delete address request failed', 'error');
                }
            });
            request.fail(function(jqXHR, textStatus){
                hide_loading_message();
                show_message('Delete address request failed: ' + textStatus, 'error');
            });
        }
    });

} );