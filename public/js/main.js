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
  


      crd = null;

       map = L.map('map').setView([40.75,-74.0059], 12);
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
  

  //connect socket
  socket = io.connect();

  marker = "~";
  mappzy = [];
  GPS2 = [];

  function updateUserSession(pos){
    console.log("setting location");
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
  }


  // navigator.geolocation.getCurrentPosition(success, error, options);
  
  function success(pos) {
    updateUserSession(pos);
     
  };

  function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
  };
//END INITIAL LOCATION AJAXE

//**BEGIN WATCHLOCATION CODE

var watchID;
var geoLoc;
 getLocationUpdate();
 function showLocation(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    console.log("WATCHING : Latitude : " + latitude + " Longitude: " + longitude);
    updateUserSession(position);
 }
 
 function errorHandler(err) {
    if(err.code == 1) {
       alert("Error: Access is denied!");
    }
    
    else if( err.code == 2) {
       // alert("Error: Position is unavailable!");
       navigator.geolocation.getCurrentPosition(success, error, options);
    }
 }
 
 function getLocationUpdate(){
  console.log('trying');
    if(navigator.geolocation){
      console.log('got GEO and trying');
       // timeout at 60000 milliseconds (60 seconds)
       var options2 = {timeout:10000};
       geoLoc = navigator.geolocation;
       watchID = geoLoc.watchPosition(showLocation, errorHandler, options2);
       console.log('assigned watchID');
    }
    
    else{
       alert("Sorry, browser does not support geolocation!");
    }
 }


  // function watchPosition(){
  //   var watchID = navigator.geolocation.watchPosition(function(position) {

  //     updateUserSession(position.coords.latitude, position.coords.longitude);

  //   });

  // }

  

 

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

var startRecording = document.getElementById('start-recording');
var stopRecording = document.getElementById('stop-recording');
var audioPreview = document.getElementById('audio-preview');

var recordAudio;
startRecording.onclick = function () {
  
    startRecording.disabled = true;
    navigator.getUserMedia({
        audio: true
    }, function (stream) {
        audioPreview.src = window.URL.createObjectURL(stream);
        // audioPreview.play();

        recordAudio = RecordRTC(stream, {
            bufferSize: 16384
        });

        recordAudio.startRecording();

        stopRecording.disabled = false;
    }, function (){console.warn("Error getting audio stream from getUserMedia")});
};

var fileName;
stopRecording.onclick = function () {
    startRecording.disabled = false;
    stopRecording.disabled = true;

    fileName = Math.round(Math.random() * 99999999) + 99999999;

    recordAudio.stopRecording();

    recordAudio.getDataURL(function (audioDataURL) {
        var files = {
            audio: {
                name: fileName + '.wav',
                type: 'audio/wav',
                contents: audioDataURL
            }
        };

        audioPreview.src = '';
        audioPreview.poster = '/ajax-loader.gif';

        xhr('/upload', JSON.stringify(files), function (fileName) {
            var href = location.href.substr(0, location.href.lastIndexOf('/') + 1);
            audioPreview.src = href + 'uploads/' + fileName;
            audioPreview.play();
        });
    });
};

function xhr(url, data, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            callback(request.responseText);
        }
    };
    request.open('POST', url);
    request.send(data);
}

//********// THE SOCKET PART //********//
function fetchJars(location){
  socket.emit('fetch', location);
}

socket.on('connect', function(data) {
      console.log("connected . . ");
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

  map.on('click', addMarker);

function addMarker(e){
    // Add marker to map at click location; add popup window
    console.log('CLLLLLICK??')
    // var newMarker = new L.marker(e.latlng).addTo(map);
    form_coords = e.latlng.lat+','+e.latlng.lng;
    form_coords = form_coords.split(',');
    console.log(form_coords);
    $('#where').text(form_coords);
    map.removeLayer(marker);
    marker = L.marker([form_coords[0],form_coords[1]]).addTo(map);

       mappzy = form_coords;
       map.setView(mappzy, 17);
    
    console.log("custom gps");
    socket.emit('mapmarker', mappzy);
    console.log("sent custom gps");
      GPS2 =  [];
      GPS2.push(mappzy[0]).toString();
       GPS2.push(mappzy[1]).toString();

}

});
// END DOCUMENT READY

  jQuery("#current").click(function(e){

    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };
      

      console.log('submitted location');
      navigator.geolocation.getCurrentPosition(success, error, options);


   
    function success(pos) {
        var crd = pos.coords;
      $('#gps').val(crd.latitude +", "+ crd.longitude);
      console.log('Your current position is:');
      console.log('Latitude : ' + crd.latitude);
      console.log('Longitude: ' + crd.longitude);
      console.log('More or less ' + crd.accuracy + ' meters.');
      
      //*do this on click #submit_location *
      // mappzy = [crd.latitude,crd.longitude];
      //   GPS2.push(mappzy[0]).toString();
      //    GPS2.push(mappzy[1]).toString();

    };

    function error(err) {
      console.warn('ERROR(' + err.code + '): ' + err.message);
    };
  });




  jQuery("#submit_location").click(function(e){
    setLocation(e);


  });

function setLocation(e){
  e.preventDefault();
    console.log('location form ..');
    console.log($('#gps').val());
    form_coords = $('#gps').val().split(',');

    $('#where').text(form_coords);
    map.removeLayer(marker);
    marker = L.marker([form_coords[0],form_coords[1]]).addTo(map);

       mappzy = form_coords;
       map.setView(mappzy, 17);
    
    console.log("custom gps");
    socket.emit('mapmarker', mappzy);
    console.log("sent custom gps");
      GPS2 =  [];
      GPS2.push(mappzy[0]).toString();
       GPS2.push(mappzy[1]).toString();
}






function renderJars(jars){

	// first, make sure the #jar-holder is empty
	jQuery('#jar-holder').empty();
  
 
 
	// loop through all the jars and add them in the jar-holder div
	for(var i=0;i<jars.length;i++){
    var jar = jars[i];
    var fileExtension = jar.url.replace(/^.*\./, '').toLowerCase();
    var file_type = '';

    console.log(jar.url);
    console.log (fileExtension);

    if (fileExtension == 'jpg'|| fileExtension =='jpeg'|| fileExtension =='png'){
      file_type = 'image';
    }else if (fileExtension == 'mp3' || fileExtension =='m4a'|| fileExtension == 'wav'){
      file_type = 'audio';
    }else if (fileExtension == 'mov' || fileExtension =='ogg'|| fileExtension =='m4a' || fileExtension == '3gp'){
      file_type = 'video';
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
      '<audio src="'+jar.url+'" controls >'+
      'Your browser does not support the </audio>'+
      
          '<li>Location: <span class="location">'+jar.GPS.lat+','+jar.GPS.lon+'</span></li>'+

          '<li>Tags: <span class="tags">'+jar.tags+'</span></li>'+
          '<li>Tags: <span class="owner">'+jar.owner+'</span></li>'+

          '<li class="hide id">'+jar.id+'</li>'+
        '</ul>'+
        '<button type="button" id="'+jar._id+'" onclick="deleteJar(event)">Delete Jar</button>'+
        '<button type="button" data-toggle="modal" data-target="#editModal">Edit Jar</button>'+
      '</div>';


	  }else if(file_type == 'video'){
      var htmlToAdd = '<div class="col-md-4 jar">'+
      '<h1 class="name">'+jar.title+ '</h1>'+
      '<video width="320" height="240" src="'+jar.url+'"preload controls >'+
      'Your browser does not support the </video>'+
      
          '<li>Location: <span class="location">'+jar.GPS.lat+','+jar.GPS.lon+'</span></li>'+

          '<li>Tags: <span class="tags">'+jar.tags+'</span></li>'+
          '<li>Tags: <span class="owner">'+jar.owner+'</span></li>'+

          '<li class="hide id">'+jar.id+'</li>'+
        '</ul>'+
        '<button type="button" id="'+jar._id+'" onclick="deleteJar(event)">Delete Jar</button>'+
        '<button type="button" data-toggle="modal" data-target="#editModal">Edit Jar</button>'+
      '</div>';


    }
    jQuery('#jar-holder').prepend(htmlToAdd);
  }
}




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



