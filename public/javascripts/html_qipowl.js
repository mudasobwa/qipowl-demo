function parseIt() {
  $.post( "/html/parse", { text: $('#text').val() } )
    .done(function( data ) {
      $('#result').html (data)
    });
}
function deleteMappingKey(key) {
  $.ajax({
    url: '/html/mapping/' + key,
    type: 'DELETE',
    success: function(result) {
      fillMapping();
      parseIt();
    }
  });
}
function addMappingKey(section,key,value,enclosure) {
  if (!enclosure) enclosure = 'void'
  $.ajax({
    url: '/html/mapping/' + section + '/' + key + '/' + value + '/' + enclosure,
    type: 'PUT',
    success: function(result) {
      fillMapping();
      parseIt();
    }
  });
}

function fillControl(data) {
  $("#syntaxrules").empty();
  $("#syntaxrules").append("<br><div id='syntaxrulesdiv' class='tab-content'></div>");
  var tabs = ["<li class='active'><a href='#mapping-show-hide' data-toggle='tab'>extend syntax</a></li>"];
  var control =
    '<form id="newmapping" class="form-inline" role="form">' +
    '  <div class="form-group">' +
    '    <label class="sr-only" for="mapping-new-key">Key to add</label>' +
    '    <input class="form-control" id="mapping-new-key" name="key" placeholder="Key (e.g., “×”)">' +
    '  </div>' +
    '  <div class="form-group">' +
    '    <label class="sr-only" for="mapping-new-value">Value for key</label>' +
    '    <input class="form-control" id="mapping-new-value" name="value" placeholder="Value for key">' +
    '  </div>' +
    '  <div class="form-group">' +
    '    <label class="sr-only" for="mapping-new-enclosure">Enclosure for key</label>' +
    '    <input class="form-control" id="mapping-new-enclosure" name="enclosure" placeholder="Enclosure">' +
    '  </div>' +
    '  <div class="form-group">' +
    '    <select class="form-control" id="mapping-new-section" name="section">';
    $.each( data, function( key, val ) {
      if (key != 'custom') control += '      <option>' + key + '</option>';
    });
    control +=
    '    </select>' +
    '  </div>' +
    '  <div class="form-group">' +
    '    <button type="submit" class="btn btn-submit">Add!</button>' +
    '  </div>' +
    '</form>';
  var divs = ["<div class='tab-pane fade active in' id='mapping-show-hide'><br>" + control + "</div>"];
  $.each( data, function( key, val ) {
    tabs.push( "<li><a href='#" + key + "' data-toggle='tab'>" + key + "</a></li>" );
    var div = "<div class='tab-pane fade' id='" + key + "'>" +
          "<table class='table table-condensed table-striped mapping' id='" + key + "-table'>" +
          "<thead><tr><td width='40%'>Key</td><td width='40%'>Value</td><td>Action</td></tr></thead><tbody>";
    $.each( val, function( k, v ) {
      if (!(typeof v === 'string')) {
        v = JSON.stringify(v);
      }
      v = v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      delBtn = "<a href='javascript:deleteMappingKey(\"" + k + "\")' class='btn btn-primary btn-xs' role='button'>—</a>";
      div += "<tr><td>" + k + "</td><td>" + v + "</td><td>" + delBtn + "</td></tr>"
    });
    div += "</tbody></table></div>";
    divs.push(div)
  });

  $( "<ul/>", {
    "class": "nav nav-tabs",
    "id": "syntaxresultul",
    html: tabs.join( "" )
  }).appendTo( "#syntaxrules" );

  $( "<div/>", {
    "class": "tab-content",
    "id": "syntaxresultdiv",
    html: divs.join( "" )
  }).appendTo( "#syntaxrules" );
}
function onBarButton(caption) {
  $("#text").insertAtCaret(" " + caption + " ");
}
function createButton(bar, val, title) {
  if (val.length != 1) return
  btn = $( "<button/>", {
    "class" : "btn btn-default",
    "style" : "font-size: 18px; font-face: monospace;",
    "title" : title,
    "id" : "id_" + val,
    html: val
  });
  btn.click(function() { onBarButton(val); });
  btn.appendTo(bar);
}
function fillToolBar(data) {
  $("#buttonsbar").empty();
  var bar = $( "<div/>", {
    "class": "",
    "id": "toolbar"
  });
  $.each( data, function( key, val ) {
    if (key != 'self' && key != 'custom') {
      $.each( val, function( k, v ) {
        if (k.substr(0, 1) != '✿') {
          tg = v['tag'] || v;
          if (v['class']) tg += "#" + v['class'];
          createButton(bar, k, tg);
        }
      });
    }
  });
  bar.appendTo( "#buttonsbar" );
}
function fillMapping() {
  $.getJSON( "/html/mapping", { } )
    .done(function( data ) {
      fillToolBar(data);
      fillControl(data);
      $( "#newmapping" ).submit(function(event) {
        event.preventDefault();

        var $form = $(this),
            key = $form.find('input[name="key"]').val(),
            value = $form.find('input[name="value"]').val(),
            enclosure = $form.find('input[name="enclosure"]').val(),
            section = $form.find('select[name="section"]').val()
        addMappingKey(section,key,value,enclosure);
      });
    });
}
