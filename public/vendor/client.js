(function($, window, undefined) {
	$(document).ready(function() {
		//var socket = io.connect('http://192.168.0.200:3700');
		var socket = io.connect('http://localhost:3700');
		var cid = null;
		var clientserving = $('#clientserving');



		$.supersized({

			// Functionality
			start_slide             :   1,			// Start slide (0 is random)
			new_window				:	1,			// Image links open in new window/tab
			image_protect			:	1,			// Disables image dragging and right click with Javascript

			// Size & Position
			min_width		        :   0,			// Min width allowed (in pixels)
			min_height		        :   0,			// Min height allowed (in pixels)
			vertical_center         :   1,			// Vertically center background
			horizontal_center       :   1,			// Horizontally center background
			fit_always				:	0,			// Image will never exceed browser width or height (Ignores min. dimensions)
			fit_portrait         	:   1,			// Portrait images will not exceed browser height
			fit_landscape			:   0,			// Landscape images will not exceed browser width

			// Components
			slides 					:  	[			// Slideshow Images
											{image : '/bg/1.jpg'},
											{image : '/bg/2.jpg'},
											{image : '/bg/3.jpg'},
											{image : '/bg/4.jpg'},
											{image : '/bg/5.jpg'},
											{image : '/bg/6.jpg'},
											{image : '/bg/7.jpg'}
										]

		});

		socket.on('ready', function(client) {
			$('#cid-container').hide();
			$('#main2').show();
			clientserving.html(client.queue);
			$('.ft span').html(client.name);
			$('.ft>.pull-left').show();

		});
		socket.on('error', function(err, data) {
			alert(data);
		});
		socket.on('administered', function() {
			$('#mymodal').modal('hide');
		});
		socket.on('nextcb', function(queue) {
			clientserving.html(queue);
		});



		// input id and connect
		$('#connect').on('click', function() {
			cid = $('#cid').val();
			socket.emit('login', cid);
		});

		// when client clicks the next in queue
		$('#next').on('click', function() {
			//$(this).button('loading');
			socket.emit('next');
		});

		// when client clicks the call again queue
		$('#again').on('click', function() {
			socket.emit('again');
		});

		// when client clicks on the override button
		$('#override').on('click', function() {
			// show the overide form
			$('#administer').show();
		});
		$('#set').on('click', function() {
			data = {
				"password" : $('#password').val(),
				"queue" : $('#queue').val()
			};
			socket.emit('administer', data);
		});

	});
})(jQuery, window, undefined);