(function($, window, undefined) {
	//var socket = io.connect('http://192.168.0.200:3700');
	var socket = io.connect('http://localhost:3700');

	$(document).ready(function() {
		var template = Handlebars.compile($('#template').html());

		$.supersized({

			// Functionality
			start_slide             :   0,			// Start slide (0 is random)
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

		var formatDate = function(d) {
			var weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
			var monthname = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			var text = '';
			text += weekday[d.getDay()] + ", ";
			text += monthname[d.getMonth()] + " ";
			text += d.getDate() + ", ";
			text += d.getFullYear();
			return text;
		};

		var formatTime = function() {
			var d = new Date();
			var h = d.getHours();
			var m = d.getMinutes();
			m = (m<10) ? '0' + m : m;
			var text = '';
			var ampm = 'AM';
			var ampm = (h >= 12) ? 'PM' : 'AM';
			h  = (h >= 13) ? h-12 : h;

			text += h + ":" + m + " " + ampm;
			return text;

		};


		// date and time
		var d = new Date();
		$('#date').text(formatDate(d));
		$('#time').text(formatTime());
		setInterval(function() {
			$('#time').text(formatTime());
		}, 60000);

		var servinglist = $('ul#servinglist');
		var alert = $('#alert');

		var audio = new Audio();
		audio.setAttribute('src', '/vendor/beep.wav');
		audio.load();

		// when client connects/disconnects
		socket.on('clientupdate', function(data) {
			$('ul#servinglist').html(template(data));
		});

		// when client clicks Next
		socket.on('call', function(data) {
			//audio.pause();
			audio.currentTime = 0.5;
			audio.play();
			$('#nowserving').text(data.queue);
			$('#clientno').text(data.id);
			alert.stop().fadeIn(10).delay(3000).fadeOut(50, function() {
				$('#queue'+data.id).addClass('active');
				//audio.pause();
			});
		});

		// when client clicks Call again
		socket.on('againcb', function(data) {
			//audio.pause();
			audio.currentTime = 0.5;
			audio.play();
			$('#queue'+data.id).addClass('blink').stop().delay(3000).fadeIn(10, function() {
				$(this).removeClass('blink');
				//audio.pause();
			});
		});
		socket.on('announce', function(data) {
			$('#announcements .marquee').text(data).marquee({
				speed: 10000,
				delayBeforeStart: 0,
				duplicated: true,
				direction: 'left'
			});
		});
	});
})(jQuery, window, undefined);