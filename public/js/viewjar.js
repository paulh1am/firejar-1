$.getScript("/js/main.js");
$( document ).ready(function() {
   loaded = false;
  console.log('has');
  $('.addNote').click(function(e){
    console.log('add Note');
    $('.addNoteForm').show();
  });
  console.log('reaaady');


      $("#file_input").change(function(){
        var prefix = ((Math.random() * 60).toString() + 1) + Date.now().toString();
        console.log('DO UPLOAD');
        init_upload(prefix);
      })

  jQuery("#addNoteForm").submit(function(e){

    e.preventDefault();






    noteParent = theJar._id;


    // init_upload(); // do the upload **
    //then add the url to the Jar URL ..

    

    console.log('submitted');
    // first, let's pull out all the values
    // the name form field value
    var title = jQuery("#title").val();
    

    if (loaded){
    
      var url = "https://s3.amazonaws.com/jar-1/"+jQuery("#url").val();
    } else{
      var url = jQuery("#url").val();
    }

    var text = jQuery("#text").val();
    var linetext= (text).replace(/\n/g,"<br>");

    var htmlToAdd = '<div class="noteJar">'+'<h3>'+title+'</h3>'+
      '<image class="note-image jar-image" src="'+url+ '"></div>'
      +'<div class="jarText"><p>'+ linetext +'</p></div>'
    console.log(htmlToAdd);
    $('.notes').prepend(htmlToAdd);
    // make sure we have a location

    // if(!location || location=="") return alert('We need a location!');
        
    // POST the data from above to our API create route
    jQuery.ajax({
      url : '/api/createNote',
      dataType : 'json',
      type : 'POST',
      // we send the data in a data object (with key/value pairs)
      data : {
        title: title,
        text: text,
        url: url,
        parent: noteParent
        
      },
      // ADD THE LOCATION DATA (from the webRTC)
      success : function(response){
        if(response.status=="OK"){
          // success
          console.log(response);
          
          // now, clear the input fields
          jQuery("#addForm input").val('');
          document.getElementById("preview").src =''
          // socket.emit('fetch', mappzy);
        }
        else {
          alert("something went wrong");
        }
      },
      error : function(err){
        // do error checking
        alert("something went wrong");
        console.error(err);
      }
    }); 
    $("#addNoteForm input").val('');
    $('.addNote').hide();
    // prevents the form from submitting normally
    loaded = false;
    return false;
  });


})