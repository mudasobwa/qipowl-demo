function typoIt() {
  $.post( "/typo/parse", { text: $('#text').val() } )
    .done(function( data ) {
      $('#result').html (data)
    });
}
