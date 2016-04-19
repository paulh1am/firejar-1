// CUSTOM JS FILE //

// FOR cross domain (using heroku api) change ajax calls to include urlRoot and crossdomain*
//  var urlRoot = https://fjar-off-land.herokuapp.com/
//  crossDomain: true,
//      dataType: 'jsonp',

$( document ).ready(function() {
      crd = null;

      var map = L.map('map').setView([40.75,-74.0059], 12);
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'ph1am.io3m04c0',
    accessToken: 'pk.eyJ1IjoicGgxYW0iLCJhIjoiV01wMkVDQSJ9.HGSWGdj2lTGJLxMcg4C9mA'
  }).addTo(map);


  var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  //get location
  navigator.geolocation.getCurrentPosition(success, error, options);

  //connect socket
  socket = io.connect();

  var marker = "~";
   mappzy = [];
  GPS2 = [];
  function success(pos) {
      crd = pos.coords;
    $('#where').text(crd.latitude +", "+ crd.longitude);
    console.log('Your current position is:');
    console.log('Latitude : ' + crd.latitude);
    console.log('Longitude: ' + crd.longitude);
    console.log('More or less ' + crd.accuracy + ' meters.');
    
    


     marker = L.marker([crd.latitude, crd.longitude]).addTo(map);
    //marker.bindPopup("<div id='containerz'>...</div>")//.openPopup();


    mappzy = [crd.latitude,crd.longitude];
    map.setView(mappzy, 17);
    console.log("DoMarker")
    socket.emit('mapmarker', mappzy);
    console.log("sentMarker")
    
      GPS2.push(mappzy[0]).toString();
       GPS2.push(mappzy[1]).toString();


    
  };

  function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
  };


 

  var file_name="";



  file_url = "";

  loaded = false;

 // Doing S3 upload when it's added to the file_input form*

  (function() {
    document.getElementById("file_input").onchange = init_upload;
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
    var GPS3 = GPS2.join();
  	var SSID = "";//GRAB THE LOCATION Var
    var UDID = "";//GRAB THE LOCATION Var

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
    		tags: tags,
        GPS: GPS3,
        SSID: SSID,
        UDID: UDID,
        url: url,
        owner: "5714e0b0d5c65a85125ff476",
        project:"bridge"
    		
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

  // get Jars JSON from /api/get
  // loop through and populate the map with markers
  var renderPlaces = function() {
  	console.log('old render places');
  	

  	jQuery.ajax({
  		url : '/api/get',
  		dataType : 'json',
  		success : function(response) {

  			console.log(response);
  			jars = response.jars;
  			// first clear any existing markers, because we will re-add below
  			// clearMarkers();
  			markers = [];

  			// now, loop through the jars and add them as markers to the map
  			for(var i=0;i<jars.length;i++){

  				var latLng = {
  					lat: jars[i].GPS.lat, 
  					lng: jars[i].GPS.lon
  				}

  				// make and place map maker.
  				var marker = "map marker";

  				
  				// keep track of markers
  				markers.push(marker);
  			}

  			// now, render the jar image/data
  			renderJars(jars);

  		}
  	})
  };

  // edit form button event
  // when the form is submitted (with a new jar edit), the below runs
  

//********// THE SOCKET PART //********//
function fetchJars(location){
  socket.emit('fetch', location);
}

socket.on('connect', function(data) {
      console.log("connect2");
    });
socket.on('you', function(data) {
      console.log(data);
      socket.emit('fetch', mappzy);
      
    });
socket.on('Jars', function(data) {
      jarr = data;
      console.log(jarr);
      console.log('jars');
      renderJars(jarr);
      
    });

});
// END DOCUMENT READY



function renderJars(jars){

	// first, make sure the #jar-holder is empty
	jQuery('#jar-holder').empty();
  
 
 
	// loop through all the jars and add them in the jar-holder div
	for(var i=0;i<jars.length;i++){
    var jar = jars[i];
    var fileExtension = jar.url.replace(/^.*\./, '');
    var file_type = '';

    console.log(jar.url);
    console.log (fileExtension);

    if (fileExtension == 'jpg'|| fileExtension =='jpeg'|| fileExtension =='png'){
      file_type = 'image';
    }else if (fileExtension == 'mp3'|| fileExtension =='ogg' || fileExtension == 'wav'){
      file_type = 'audio';
    }
    console.log (file_type);
    if(file_type == 'image'){
  		var htmlToAdd = '<div class="col-md-4 jar">'+
  			
  			'<h1 class="name">'+jar.title+ '</h1>'+
        '<img class="jar-image" src="'+jar.url+'">'+
  			'<ul>'+
  				'<li>Location: <span class="location">'+jar.GPS.lat+','+jar.GPS.lon+'</span></li>'+

  				'<li>Tags: <span class="tags">'+jar.tags+'</span></li>'+
          '<li>Tags: <span class="owner">'+jar.owner+'</span></li>'+

          '<li class="hide id">'+jar.id+'</li>'+
  			'</ul>'+
        

  			'<button type="button" id="'+jar._id+'" onclick="deleteJar(event)">Delete Jar</button>'+
  			'<button type="button" data-toggle="modal" data-target="#editModal"">Edit Jar</button>'+
  		'</div>';

  		
    }else if(file_type == 'audio'){
      var htmlToAdd = '<div class="col-md-4 jar">'+
      '<h1 class="name">'+jar.title+ '</h1>'+
      '<audio src="'+jar.url+'" controls autoplay loop>'+
      'Your browser does not support the </audio>'+
      
          '<li>Location: <span class="location">'+jar.GPS.lat+','+jar.GPS.lon+'</span></li>'+

          '<li>Tags: <span class="tags">'+jar.tags+'</span></li>'+
          '<li>Tags: <span class="owner">'+jar.owner+'</span></li>'+

          '<li class="hide id">'+jar.id+'</li>'+
        '</ul>'


	  }
    jQuery('#jar-holder').prepend(htmlToAdd);
  }
}

jQuery('#editModal').on('show.bs.modal', function (e) {
  // let's get access to what we just clicked on
  var clickedButton = e.relatedTarget;
  // now let's get its parent
	var parent = jQuery(clickedButton).parent();

  // now, let's get the values of the jar that we're wanting to edit
  // we do this by targeting specific spans within the parent and pulling out the text

  // var name = $(parent).find('.name').text();
  // var age = $(parent).find('.age').text();
  // var weight = $(parent).find('.weight').text();
  // var tags = $(parent).find('.tags').text();
  // var breed = $(parent).find('.breed').text();
  // var url = $(parent).find('.url').attr('src');
  // var location = $(parent).find('.location').text();
  // var id = $(parent).find('.id').text();

  // now let's set the value of the edit fields to those values
 
 // 	jQuery("#edit-name").val(name);
	// jQuery("#edit-age").val(age);
	// jQuery("#editWeight").val(weight);
	// jQuery("#edit-tags").val(tags);
	// jQuery("#edit-breed").val(breed);
	// jQuery("#edit-url").val(url);
	// jQuery("#edit-location").val(location);
	// jQuery("#edit-id").val(id);

})


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

function clearMarkers(){
  for (var i = 0; i < markers.length; i++) {
    console.log('clear markers out');// clears the markers
  }	
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
function get_signed_request(file){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/sign_s3?file_name="+file.name+"&file_type="+file.type);
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
function init_upload(){
    loaded = true;
    console.log("here");
    var files = document.getElementById("file_input").files;
    var file = files[0];
    file_name= file.name;
    file_url = "https://s3.amazonaws.com/jar-1/"+ file_name;
     document.getElementById("preview").src = file_url;
    $('#url').val(file_name);
    if(file == null){
        alert("No file selected.");
        return;
    }
    get_signed_request(file);
}



