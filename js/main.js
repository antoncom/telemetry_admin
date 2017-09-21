 $(document).ready(function() {
        $('#example').DataTable( {
            "scrollX": true,
            "dom": '<"top"i>rt<"bottom"flp><"clear">',
            "language": {
                "lengthMenu": "Показывать: _MENU_ записей",
                "zeroRecords": "Nothing found - sorry",
                "info": "Showing page _PAGE_ of _PAGES_",
                "infoEmpty": "No records available",
                "infoFiltered": "(filtered from _MAX_ total records)",
                "paginate": {
                    "first":      "В начало",
                    "last":       "В конец",
                    "next":       "Дальше",
                    "previous":   "Назад"
                },
            }
        });
    });


  $( function() {
    $( "#tabs" ).tabs();
  });