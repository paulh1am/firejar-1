

$( document ).ready(function() {
  ion.sound({
      sounds: [
          {
              name: "water_droplet"
          }
      ],
      volume: 0.5,
      path: "/sounds/",
      preload: true
  });
   


      crd = null;

       map = L.map('map').setView([40.75,-74.0059], 12);
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 18,
    id: 'ph1am.pppj01g0',
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
    map.removeLayer(marker);
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
       var options2 = {timeout:5000};
       geoLoc = navigator.geolocation;
       watchID = geoLoc.watchPosition(showLocation, errorHandler, options2);
       console.log('assigned watchID');
    }
    
    else{
       alert("Sorry, browser does not support geolocation!");
    }
 }


 

 

  var file_name="";



  file_url = "";

  loaded = false;

 // Doing S3 upload when it's added to the file_input form*

  (function() {
    $("#file_input").change(function(){
      var prefix = ((Math.random() * 60).toString() + 1) + Date.now().toString();
      console.log('DO UPLOAD');
      init_upload(prefix);
    })
  })();
  (function() {
    $("#p_file_input").change(function(){
      var prefix = ((Math.random() * 60).toString() + 1) + Date.now().toString();
      console.log('DO Proj img UPLOAD');
      // init_upload(prefix);
    })
  })();



//********// THE SOCKET PART //********//
  function fetchBridge(location){
    socket.emit('fetchbridge', location);
  }

  socket.on('connect', function(data) {
        console.log("connect2");
      });
  socket.on('you', function(data) {
        console.log(data);
        socket.emit('fetchBridge', mappzy);
        // socket.emit('nearby', location);
        
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

  jQuery("#current").click(function(e){
    console.log('MEEEE');
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

  

});
// END DOCUMENT READY



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






var j_marker = "."
function renderJars(jars){

  // first, make sure the #jar-holder is empty
  
  // jQuery('.jar_clear').remove();
  map.removeLayer(j_marker);
 
 
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
    }else if (fileExtension == ''){
      filt_type = 'none';
    }

    console.log (file_type);

    if(jar.project=="bridge"){
      linetext="";
      if (jar.text.length >= 1){
        linetext= (jar.text[0]).replace(/\n/g,"<br>");
      }
      var jar_id = '#'+jar._id;
      //only render the jar div if it's new
      if ($(jar_id).length<1){

      var htmlToAdd = '<div class="col-md-4 jar jar_clear" id="'+jar._id+'">'+
      '<h1 class="name" id="'+jar.id+'">'+jar.title+ '</h1>';



        if(file_type == 'image'){
          htmlToAdd += 
            '<img class="jar-image" src="'+jar.url+'">';
        
        }else if(file_type == 'audio'){
          htmlToAdd += '<audio id="'+i+'"src="'+jar.url+'" controls >'+
          'Your browser does not support the </audio>'
        
        }else if(file_type == 'video'){
          htmlToAdd += '<video width="320" height="240" src="'+jar.url+'"preload controls >'+
          'Your browser does not support the </video>'
        }

        htmlToAdd += '<ul>'+
              '<li>Location: <span class="location">'+jar.GPS.lat+','+jar.GPS.lon+'</span></li>'+
              '<div class="jarText"><p>'+ linetext +'</p></div>'+

              '<li>Tags: <span class="tags">'+jar.tags+'</span></li>'+
              

              '<li class="hide id">'+jar.id+'</li>'+
              
            '</ul>'+
            '<a class= "iframe cboxelement" target="_blank" href="/view_jar/'+jar._id+'"><button type="button" class="btn-primary  view_jar" id="'+jar._id+'">Open</button></a>'+
            '<a class= "iframe cboxelement" href="/login"><button type="button" class="btn-primary collect_jar" id="'+'keep_'+jar._id+'">Pick Up</button></a>'+
            
            
          '</div>';
      
      jQuery('#jar-holder').prepend(htmlToAdd);
      ion.sound.play("water_droplet");

      


      $(".iframe").colorbox({iframe:true, width:"95%", height:"100%"});
     
    }

      // }else if(jar.project.length > 1){
      //   var proj_id = '#'+jar.project.replace(' ','_');
      //   var project_url = jar.project_url || ''

      //   if ($(proj_id).length==0){
      //     var htmlToAdd = '<a href="/projects/'+ jar.project.replace(' ','_')+'"><div class="col-md-4 jar project" id="'+jar.project.replace(' ','_')+'" style="background-image:url('+ project_url +')" >'+
      //       '<h2 class="name">'+jar.project+ '</h1> <p>FireJar project</p></div></a>'
      //     jQuery('#project-holder').prepend(htmlToAdd);
      //   }
    }

  
    var orangeIcon = L.icon({
      iconUrl: '/images/orange.png',
      

      iconSize:     [20, 20], // size of the icon
      
      iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
      
    
    });
    j_marker = L.marker([jar.GPS.lat, jar.GPS.lon], {icon: orangeIcon}).addTo(map);  
   
  }// Jars for each




  autoplay = false;
  playing = false;

  $('input[name="bs1-switch"]').on('switchChange.bootstrapSwitch', function(event, state) {
    
    autoplay= (state);
     // true | false
    $('audio').stop();
    console.log(autoplay);
      if (autoplay == true){
        var playcount = 0;
        var playing = play[playcount];
        play[playcount].play();
        $('audio').on('ended',function(){
          playcount+= 1;
          play[playcount].play();
        })
      } else{
        
        console.log('something');
        for (var i = 0; i < play.length; i++) {
          $('audio')[i].pause();
        };
      }

  });

  var audio= $('audio');
  play = []
  for (var i = 0; i < audio.length; i++) {
     
      track = $('#'+i);
      nmbr = ""
      play.push(track[0]);
    
  };

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




