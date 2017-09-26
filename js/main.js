 

    $(document).ready(function(){
        $.fn.dataTable.ext.buttons.add = {
            className: 'buttons-add'
        };

        $.fn.dataTable.ext.buttons.edit = {
            className: 'buttons-edit'
        };

        $.fn.dataTable.ext.buttons.delete = {
            className: 'buttons-delete'
        };

        var selected = [];
        $('#example').DataTable({
            select: {
                style: 'os'
            },
           "scrollX": true,
            "language": {
                "lengthMenu": "Показывать: _MENU_ записей",
                "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Russian.json",
                "search":         "Поиск:",
                "paginate": {
                    "first":      "В начало",
                    "last":       "В конец",
                    "next":       "Дальше",
                    "previous":   "Назад"
                },
            },
            pageLength: 25,
            responsive: true,
            dom: '<"html5buttons"B>Tfgt<"bottom"lp>',
            buttons: [
                {
                    extend: 'add',
                    text: 'Добавить дом',
                    action: function() {
                        $('a.dt-button.buttons-add').bind('click',function() {
                            $('#myModal').modal();
                        });
                    }
                },
                {
                    extend: 'edit',
                    text: 'Редактировать дом',
                    action: function() {
                        $('a.dt-button.buttons-edit').bind('click',function() {
                            $('#myModal2').modal();
                        });
                    }
                },
                {
                    extend: 'selected',
                    text: 'Удалить дом',
                    action: function() {
                        $('a.dt-button.buttons-selected').bind('click',function() {
                            $('#myModal3').modal();
                        });
                    }
                },
                {
                    extend: 'copy',
                    text: 'Copy',
                    exportOptions: {
                        modifier: {
                            page: 'current'
                        }
                    }
                },
                 {
                    extend: 'csv',
                    text: 'CSV',
                    exportOptions: {
                        modifier: {
                            search: 'none'
                        }
                    }
                },
                {extend: 'excel', title: 'ExampleFile'},
                {extend: 'pdf', title: 'ExampleFile'},

                {extend: 'print',
                    customize: function (win){
                        $(win.document.body).addClass('white-bg');
                        $(win.document.body).css('font-size', '10px');

                        $(win.document.body).find('table')
                                .addClass('compact')
                                .css('font-size', 'inherit');
                    }
                }
            ]
        });
    });
      
 
$(document).ready(function() {
   
     $( function() {
        $( "#tabs" ).tabs();
      });
  });