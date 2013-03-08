function updateCanvas(img,canvas){

	canvas.width = img.width; 
	canvas.height = img.height;
	
	var ctx = canvas.getContext('2d');

	ctx.drawImage(img,0,0);
}

function processUploads(files){
	//console.log('processUploads');
	if(files.length && files instanceof FileList){
		var uploadedFile = files[0];
		if(uploadedFile.type.match(/image.*/)){ //check MIME type to see if file is image
			var img = document.createElement("img");
			var file_reader = new FileReader();
			img.onload = function() { updateCanvas(img,document.getElementById("imageCanvas")) };
			file_reader.onload = function(evt) {img.src = evt.target.result;};
			file_reader.readAsDataURL(uploadedFile);
			return true;
		}
		else{
			alert("Please upload a valid image file.");
			return false;
		}
	}
	return false;
}

function readParameters(){
	var params = {};

	$("div.slider").each(function(){
		var key = $(this).data("name");
		var value = $(this).slider("value");
		params[key] = value;
	});

	//console.log(params);
	return params;
}

$(document).ready(function(){

		$("#imageDrop").on("dragover",function(evt) {
			evt.preventDefault();
			//console.log("on dragover");
		});

		$.event.props.push("dataTransfer");

		$("#imageDrop").on("drop",function(evt) {
			evt.preventDefault();
			//console.log("on drop");
			var validImg = processUploads(evt.dataTransfer.files);
			if(validImg){
				$(this).fadeOut('slow',function(){
				$("#imageCanvas").fadeIn('slow');
				});
			}
		});

		$("#selectFilter").on("change",function(){
			var filter = $(this).children("option:selected").data("filter");
			var filter_file = "js/filters/"+$(this).children("option:selected").data("file");

			yepnope({ //load selected filter if not already loaded
				test: window[filter],
				nope: filter_file,
				complete: function(){
					//console.log("loading filter "+filter+" from "+filter_file);
					var selectedFilter = eval('new ' + filter);
					var template_properties = $("#template_properties").html(); //Mustache template handle

					$("div.filter-property").remove(); //don't mix options from different filters

					for(var property in selectedFilter.valueRanges){					
						var label = property.charAt(0).toUpperCase()+property.slice(1); //capitalize
						var value_default = selectedFilter.defaultValues[property];

						selectedFilter.valueRanges[property].name = property;
						selectedFilter.valueRanges[property].label = label;
						selectedFilter.valueRanges[property].value = value_default; 

						var generatedHTML = Mustache.render(template_properties,selectedFilter.valueRanges[property]);
						$("form").append(generatedHTML);
						
					}
					//jQuery-UI for the sliders
					$("div.slider").each(function(){
						$(this).slider({
							min : $(this).data("min"),
							max : $(this).data("max"),
							value : $(this).data("value_default")
						});
					});
				}
			});
		});

		$("#applyFilter").on("click",function(evt){
			evt.preventDefault();

			var canvas = document.getElementById("imageCanvas");
			var ctx = canvas.getContext("2d");
			var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
			var filter = eval("new "+$("#selectFilter").children("option:selected").data("filter")+"()");
			var params = readParameters();

			filter.filter(imgData,params);
			ctx.putImageData(imgData,0,0);
		});

		$("#reset").on("click",function(evt){
			evt.preventDefault();
			$('#imageCanvas').fadeOut('slow', function() {
                $('#imageDrop').fadeIn('slow');
            });
		});

		//console.log("document ready");
});