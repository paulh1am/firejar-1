// CUSTOM JS FILE //

// FOR cross domain (using heroku api) change ajax calls to include urlRoot and crossdomain*
//  var urlRoot = https://fjar-off-land.herokuapp.com/
//  crossDomain: true,
//      dataType: 'jsonp',

$( document ).ready(function() {
  console.log(usersession);
  current_user = usersession[0];

  console.log(user_projects);
  console.log(user_jars);
  


     

  //get location
  

  //connect socket
  
//**BEGIN WATCHLOCATION CODE



  

 

  var file_name="";



  file_url = "";

  loaded = false;

 // Doing S3 upload when it's added to the file_input form*

  (function() {
    $("#file_input").change(function(){
      var prefix = current_user._id + Date.now().toString();
      init_upload(prefix);
    })
  })();


  

    // add form button event
    // when the form is submitted (with a new jar), the below runs
  jQuery("#addForm").submit(function(e){

    e.preventDefault();

    // init_upload(); // do the upload **
    //then add the url to the Jar URL ..

    

    console.log('submitted');
  	// first, let's pull out all the values
  	// the name form field value
  	var title = jQuery("#title").val();
  	var tags = jQuery("#tags").val();
    var text = jQuery("#text").val();
    var project = jQuery("#project").val();
    var GPS3 = GPS2.join();
  	var SSID = "";//GRAB THE LOCATION Var
    var UDID = "";//GRAB THE LOCATION Var
    var owner = current_user._id;

    if (loaded){
    
      var url = "https://s3.amazonaws.com/jar-1/"+jQuery("#url").val();
    } else{
      var url = jQuery("#url").val();
    }
    

  	// make sure we have a location

  	// if(!location || location=="") return alert('We need a location!');
        
  	// POST the data from above to our API create route
    jQuery.ajax({
    	url : '/api/create',
    	dataType : 'json',
    	type : 'POST',
    	// we send the data in a data object (with key/value pairs)
    	data : {
    		title: title,
        text: text,
    		tags: tags,
        GPS: GPS3,
        SSID: SSID,
        UDID: UDID,
        url: url,
        owner: owner,
        project: project
    		
    	},
      // ADD THE LOCATION DATA (from the webRTC)
    	success : function(response){
    		if(response.status=="OK"){
  	  		// success
  	  		console.log(response);
  	  		// re-render the map
  	  		console.log('old map rerender');
  	  		// now, clear the input fields
  	  		jQuery("#addForm input").val('');
          jQuery("#addForm textarea").val('');
          document.getElementById("preview").src =''
          socket.emit('fetch', mappzy);
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

  	// prevents the form from submitting normally
    loaded = false;
    return false;
  });

jQuery("#addProjectForm").submit(function(e){

    e.preventDefault();

    // init_upload(); // do the upload **
    //then add the url to the Jar URL ..

    console.log('submitted PROJ');
    // first, let's pull out all the values
    // the name form field value
    var title = jQuery("#proj_title").val();
    var text = jQuery("#proj_text").val();
    var tags = jQuery("#proj_tags").val();
    var owner = current_user._id;
    
  
        
    // POST the data from above to our API create route
    jQuery.ajax({
      url : '/api/createProj',
      dataType : 'json',
      type : 'POST',
      // we send the data in a data object (with key/value pairs)
      data : {
        title: title,
        text: text,
        tags: tags,
        owner: owner
        
        
      },
      // ADD THE LOCATION DATA (from the webRTC)
      success : function(response){
        if(response.status=="OK"){
          // success
          console.log(response);
          // re-render the map
          console.log('PROJECT IN!');
          // now, clear the input fields
          jQuery("#addProjectForm input").val('');
          // document.getElementById("preview").src =''
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

    // prevents the form from submitting normally
    loaded = false;
    return false;
  });



//********// THE SOCKET PART //********//

});
// END DOCUMENT READY






function deleteJar(event){
	var targetedId = event.target.id;
	console.log('the jar to delete is ' + targetedId);

	// now, let's call the delete route with AJAX
	jQuery.ajax({
		url : '/api/delete/'+targetedId,
		dataType : 'json',
		success : function(response) {
			// now, let's re-render the jars

			socket.emit('fetch', mappzy);

		}
	})

	event.preventDefault();
}



// Function to carry out the actual PUT request to S3 using the signed request from the app.

function upload_file(file, signed_request, url){
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", signed_request);
    xhr.setRequestHeader('x-amz-acl', 'public-read');
    xhr.onload = function() {
        if (xhr.status === 200) {
            document.getElementById("preview").src = url;            
            
        }
    };
    xhr.onerror = function() {
        alert("Could not upload file."); 
    };
    xhr.send(file);
}

/*
    Function to get the temporary signed request from the app.
    If request successful, continue to upload the file using this signed
    request.
*/
function get_signed_request(file, prefix){
    var xhr = new XMLHttpRequest();
    var file_name = prefix+file.name;
    xhr.open("GET", "/sign_s3?file_name="+file_name+"&file_type="+file.type);
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4){
            if(xhr.status === 200){
                var response = JSON.parse(xhr.responseText);
                upload_file(file, response.signed_request, response.url);
            }
            else{
                alert("Could not get signed URL.");
            }
        }
    };
    xhr.send();
}
/*
   Function called when file input updated. If there is a file selected, then
   start upload procedure by asking for a signed request from the app.
*/
function init_upload(prefix){
    loaded = true;
    console.log("here");
     var files = document.getElementById("file_input").files;
     console.log(files);
    var file = files[0];
    file_name= prefix + file.name;
    file_url = "https://s3.amazonaws.com/jar-1/"+ file_name;
     document.getElementById("preview").src = file_url;
    $('#url').val(file_name);
    if(file == null){
        alert("No file selected.");
        return;
    }
    get_signed_request(file, prefix);
}




