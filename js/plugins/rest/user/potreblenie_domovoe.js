
$(document).ready(function() {

    // check token
    if($.cookie('token') == null)   {
        window.location.href = "login.html"
    }

    $.GetGeneralInfo();


    var table_consumption = $('#table_consumption').DataTable({
        "language": {
            "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Russian.json"
        },
        pageLength: 25,
        responsive: true,
        dom: '<"html5buttons"B>Tfgt<"bottom"lp>',
        ajax: {
            "url": $.API_base + "/consumption?table=1&type=2",
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
            {data: "date"},
            {data: "res_name"},
            {data: "total"},
            {data: "sum"},
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
                text: 'Построить график',
                action: function (e, dt, node, config) {
                    // code here
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
    var form_consumption = $('#form_consumption');

    form_consumption.validate({
        rules: {
            res: {
                required: true
            },
            period: {
                required: true
            }
        },
        messages: {
            res: {
                required: "Это поле обязательно для заполнения!"
            },
            period: {
                required: "Это поле обязательно для заполнения!"
            }

        }
    });

    // Add estate address submit form
    $(document).on('submit', '#form_consumption', function(e){
        e.preventDefault();
        // Validate form
        var form = $('#form_consumption');
        if (form.valid() == true){
            hide_ipad_keyboard();
            var form_data = form.serialize();
            console.log(form_data);

            // TODO
            // get data from the form, place to the request

            show_loading_message();
            var request   = $.ajax({
                url:  $.API_base + '/consumption',

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
                type:         'GET'
            });
            request.done(function(output){
                if (output.id > 0){
                    hide_loading_message();

                } else {
                    hide_loading_message();
                    show_message(output.message, 'error');
                }
            });
            request.fail(function(jqXHR, textStatus){
                hide_loading_message();
                show_message('Request failed: ' + textStatus, 'error');
            });
        }
    });





// Предварительное получение данных, а затем выполнение всего прочего
    $.when($.GetResourcesList()).done(function(){

        // Сформировать radio-опции на основе списка ресурсов
        var resources_radio = $('#resources_radio').children().first();
        var radio = '<div class="i-checks"><label class=""><div class="iradio_square-green" style="position: relative;"><input type="radio" value="{{res_id}}" name="res" style="position: absolute; opacity: 0;"><ins class="iCheck-helper" style="position: absolute; top: 0%; left: 0%; display: block; width: 100%; height: 100%; margin: 0px; padding: 0px; background: rgb(255, 255, 255); border: 0px; opacity: 0;"></ins></div> <i></i> {{res_name}} </label></div>';
        var length = $.Resources.defaults.data.length;
        $.each($.Resources.defaults.data, function(i, obj)  {
            // Вписываем radio во вторую колонку если больше половины уже вписано в первую колонку
            if (i+1 > (Math.floor(length / 2) + Math.ceil(length % 2)))   {
                resources_radio = $('#resources_radio').children().last();
            }
            resources_radio.append(radio.compose({
                'res_id': obj.id,
                'res_name': obj.name
            }));
        });


        $('.i-checks').iCheck({
            checkboxClass: 'icheckbox_square-green',
            radioClass: 'iradio_square-green',
        });

        $('.i-checks input[name="res"][value="0"]').iCheck('check');


        $('.i-checks.daterange input').on('ifChecked', function(event){
            $('#datepicker').show();
        });

        $('.i-checks.daterange input').on('ifUnchecked', function(event){
            $('#datepicker').hide();
        });

        $('.i-checks.datemonth input').on('ifChecked', function(event){
            $('#date_month').show();
        });

        $('.i-checks.datemonth input').on('ifUnchecked', function(event){
            $('#date_month').hide();
        });

        $('.i-checks.dateday input').on('ifChecked', function(event){
            $('#date_day').show();
        });


        $('.i-checks.dateday input').on('ifUnchecked', function(event){
            $('#date_day').hide();
        });

        $('#date_day').datepicker({
            todayBtn: "linked",
            keyboardNavigation: false,
            forceParse: false,
            calendarWeeks: true,
            autoclose: true,
            format: 'dd-mm-yyyy'
        });

        $('#date_month').datepicker({
            minViewMode: 1,
            keyboardNavigation: false,
            forceParse: false,
            forceParse: false,
            autoclose: true,
            todayHighlight: true,
            format: 'mm-yyyy'
        });

        $('#daterange').datepicker({
            keyboardNavigation: false,
            forceParse: false,
            autoclose: true
        });


        $('input[name="daterange"]').daterangepicker({
            format: 'DD-MM-YYYY'
        });

        $('#reportrange span').html(moment().subtract(29, 'days').format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));

        $('#reportrange').daterangepicker({
            format: 'DD/MM/YYYY',
            startDate: moment().subtract(29, 'days'),
            endDate: moment(),
            minDate: '01/01/2012',
            maxDate: '12/31/2015',
            dateLimit: { days: 60 },
            showDropdowns: true,
            showWeekNumbers: true,
            timePicker: false,
            timePickerIncrement: 1,
            timePicker12Hour: true,
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            opens: 'right',
            drops: 'down',
            buttonClasses: ['btn', 'btn-sm'],
            applyClass: 'btn-primary',
            cancelClass: 'btn-default',
            separator: ' to ',
            locale: {
                applyLabel: 'Submit',
                cancelLabel: 'Cancel',
                fromLabel: 'From',
                toLabel: 'To',
                customRangeLabel: 'Custom',
                daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr','Sa'],
                monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                firstDay: 1
            }
        }, function(start, end, label) {
            console.log(start.toISOString(), end.toISOString(), label);
            $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        });

    });



} );