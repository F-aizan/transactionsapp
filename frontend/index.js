import $, { ajax } from 'jquery'

$('#loaddata').on('click', () => {
    ajax({
        url:'http://localhost:3000',
        method:'GET',
        dataType: 'json',
        success: function(data) {
            $("#data").text(JSON.stringify(data))
        },
        error: function(xhr, status, error) {
            $("#data").text("error occurred")
        }
    })    
})
