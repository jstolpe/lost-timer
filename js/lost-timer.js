/**
 * Lost Timer
 *
 * Handle all lost countdown timer functionality.
 *
 * @package		lost-timer
 * @author		Justin Stolpe
 * @link		https://github.com/jstolpe/lost-timer
 * @version     1.0.0
 */
var lostTimer = ( function() {
	/**
	 * Constructor function
	 *
	 * @param Object args
	 * 		str mode 	        (optional|defaults to 'live') mode to load timer in
	 * 		str initialSeconds 	(optional|defaults to 108) seconds to start the timer at
	 * 		str height       	(optional|defaults to 200) height of the timer
	 * 		fun onTick       	(optional) run custom javascript on timer tick down
	 *
	 * @return void
	 */
	var lostTimer = function( args ) {
		// give us our self
		var self = this;

		// html container class the timer will populate
		self.containerClass = 'lost-timer';
		self.containerClassCss = '.' + self.containerClass;

		// check if mode or no
		self.theNumbersString = '4 8 15 16 23 42';

		// check if mode or no
		self.mode = 'mode' in args ? args.mode : 'live';

		// store the initial seconds default to 108 minutes
		self.initialSeconds = 'initialSeconds' in args ? args.initialSeconds : ( 60 * 108 );

		// default height to 200 if not specified
		self.height = 'height' in args ? args.height : 200;
		self.width = self.height * .6;

		if ( typeof args.onTick !== 'undefined' ) { // bind custom function
			self.onTick = args.onTick;
	    }

		// create lost timer html and populate it to the container
		self.drawTimer();

		// update height/width/font-size/margin-left according to the height
		$( self.containerClassCss + ' .lost-flipper' ).css( 'height', self.height + 'px' );
		$( self.containerClassCss + ' .lost-flipper' ).css( 'width', self.width + 'px' );
		$( self.containerClassCss + ' .lost-flipper' ).css( 'font-size', ( self.height * .8 ) + 'px' );
		$( self.containerClassCss + ' .lost-timer-side-right' ).css( 'margin-left', ( self.width / 6 ) + 'px' );

		// setup audio for use
		self.setupAudio();

		// set the timer
		self.initializeTimer( args.initialSeconds );

		// start the timer countdown
        self.startTimer();
	};

	/**
	 * Draw the timer html to the dom
	 *
	 * @return void
	 */
	lostTimer.prototype.drawTimer = function() {
		// give us our self
		var self = this;

		// generate html for the timer
		var timerHtml = '<div class="lost-timer-side lost-timer-side-left">' + 
			self.getTimerNumberSlotHtml( 1 ) +
			self.getTimerNumberSlotHtml( 2 ) +
			self.getTimerNumberSlotHtml( 3 ) +
		'</div>' + 
		'<div class="lost-timer-side lost-timer-side-right">' + 
			self.getTimerNumberSlotHtml( 4 ) +
			self.getTimerNumberSlotHtml( 5 ) +
		'</div>';

		// add html to the container element
		$( self.containerClassCss ).html( timerHtml );

		// add end screen to the body
		$( 'body' ).append( '<div class="lost-timer-end-screen"></div>' );

		if ( 'dev' == self.mode ) {
			var devHtml = '<div class="' + self.containerClass + '-dev">' +
				'<div class="lost-timer-dev-main-text">' +
					'Mode: Dev' +
				'</div>' +
				'<div class="lost-timer-dev-main-text">' +
					'Timer: ' +
					'<span class="' + self.containerClass + '-timer">' +

					'</span>' +
				'</div>' +
				'<div class="' + self.containerClass + '-dev-action ' + self.containerClass + '-dev-action-set" data-seconds="6480">' + 
					'Set Timer to 108 minutes' +
				'</div>' +
				'<div class="' + self.containerClass + '-dev-action ' + self.containerClass + '-dev-action-set" data-seconds="240">' + 
					'Set Timer to 4 minutes' +
				'</div>' +
				'<div class="' + self.containerClass + '-dev-action ' + self.containerClass + '-dev-action-set" data-seconds="60">' + 
					'Set Timer to 1 minute' +
				'</div>' +
				'<div class="' + self.containerClass + '-dev-action ' + self.containerClass + '-dev-action-set" data-seconds="10">' + 
					'Set Timer to 10 seconds' +
				'</div>' +
				'<div class="' + self.containerClass + '-dev-action ' + self.containerClass + '-dev-action-sound">' + 
					'toggle sound' +
				'</div>' +
				'<div class="' + self.containerClass + '-dev-action ' + self.containerClass + '-dev-action-reset">' + 
					'reset timer' +
				'</div>' +
				'<div class="' + self.containerClass + '-dev-action ' + self.containerClass + '-dev-action-glyphs">' + 
					'roll glyphs' +
				'</div>' +
			'</div>';

			// add html to the container element
			$( self.containerClassCss ).append( devHtml );

			$( self.containerClassCss + '-dev-action-reset' ).on( 'click', function () { // on click for timer reset
				self.reset();
			} );

			$( self.containerClassCss + '-dev-action-set' ).on( 'click', function () { // on click for setting the initial seconds
				window.location.href = '?mode=dev&seconds=' + $( this ).data( 'seconds' );
			} );

			$( self.containerClassCss + '-dev-action-glyphs' ).on( 'click', function () { // on click for rolling glyphs
				self.rollGlyphs();
			} );

			$( self.containerClassCss + '-dev-action-sound' ).on( 'click', function() { // on click for toggle sound
				// toggle sound for all timer audio sounds
				var bool = $( '.lost-timer-audio' ).prop( 'muted' );
		        $( '.lost-timer-audio' ).prop( 'muted', !bool );
			} );
		}
	};

	/**
	 * Get html for a numbers slot
	 *
	 * @params int number the number slot to get html for
	 *
	 * @return string
	 */
	lostTimer.prototype.getTimerNumberSlotHtml = function( number ) {
		// deteremine background color
		var backgroundColor = number > 3 ? 'white' : 'black';

		// return html for the timer number slot
		return '<div class="lost-timer-number">' +
			'<div class="lost-timer-number-inner">' +
				'<div class="lost-flipper lost-flipper-bg-' + backgroundColor + ' lost-timer-number-' + number + '">' +
				  	'<span class="lost-flipper-number lost-flipper-next">' +
				  		'<div class="lost-flipper-number-before">' +
				  			'<div class="lost-flipper-number-table">' +
				  				'<div class="lost-flipper-number-table-cell">' +
				  					
				  				'</div>' +
				  			'</div>' +
				  		'</div>' +
				  		'<div class="lost-flipper-number-after lost-flipper-next-after-number">' +
				  			'<div class="lost-flipper-number-table">' +
				  				'<div class="lost-flipper-number-table-cell">' +
				  					
				  				'</div>' +
				  			'</div>' +
				  		'</div>' +
				  	'</span>' +
				  	'<span class="lost-flipper-number lost-flipper-prev">' +
				  		'<div class="lost-flipper-number-before">' +
				  			'<div class="lost-flipper-number-table">' +
				  				'<div class="lost-flipper-number-table-cell">' +
				  					
				  				'</div>' +
				  			'</div>' +
				  		'</div>' +	
				  		'<div class="lost-flipper-number-after">' +
				  			'<div class="lost-flipper-number-table">' +
				  				'<div class="lost-flipper-number-table-cell">' +
				  					
				  				'</div>' +
				  			'</div>' +
				  		'</div>' +
					' </span>' +
				'</div>' +
				'<div class="lost-timer-number-center-bar">' +
						
				'</div>' +
			'</div>' +
		'</div>';
	};

	/**
	 * Setup audio for timer to use
	 *
	 * @return void
	 */
	lostTimer.prototype.setupAudio = function() {
		// get self
		var self = this;

		// path to sounds
		self.soundsFolderPath = 'assets/sounds/';

		self.sounds = [ // sounds we have available
			'alarm',
			'beep',
			'discharge',
			'keypress',
			'reset',
			'spinup',
			'systemfailure',
			'thud',
			'tick',
			'timeout'
		];

		for ( var i = 0; i < self.sounds.length; i++ ) { // loop over sounds
			// create the class name for the audio
			var audioClassName = self.containerClass + '-audio-' + self.sounds[i];

			// html for the audio element
			var audioHtml = '<audio class="' + self.containerClass + '-audio ' + audioClassName + '" src="' + self.soundsFolderPath + self.sounds[i] + '.mp3" type="audio/mp3"></audio>';

			// append audio html to the container
			$( self.containerClassCss ).append( audioHtml );

			if ( 'dev' == self.mode ) { // display sounds with links for clicking and playing
				// sound play link
				var soundHtml = '<div class="lost-timer-dev-action ' + self.containerClass + '-play-' + self.sounds[i] + '">' +
					'play ' + self.sounds[i] +
				'</div>';

				// add to html
				$( self.containerClassCss + '-dev' ).append( soundHtml );

				// onclick for playing the sound
				$( self.containerClassCss + '-play-' + self.sounds[i] ).on( 'click', { sound: self.sounds[i] }, function( event ) {
					self.playAudio( event.data.sound );
				} );
			}
		}
	};

	/**
	 * Play audio file
	 *
	 * @params str key name of the audio file name
	 *
	 * @return void
	 */
	lostTimer.prototype.playAudio = function( key ) {
		// get self
		var self = this;

		// play specified audio by key
		$( self.containerClassCss + '-audio-' + key )[0].play();
	};

	/**
	 * Initialize the timer with the seconds
	 *
	 * @params int initialSeconds seconds to start the timer at
	 *
	 * @return void
	 */
	lostTimer.prototype.initializeTimer = function( initialSeconds ) {
		// give us our self
		var self = this;

		// set total seconds for timer to the initial seconds
		self.totalSeconds = self.initialSeconds;	

		// set minutes/seconds to total seconds
		self.minutes = self.totalSeconds;
		self.seconds = self.totalSeconds;

		// update time vars
		self.updateTimeVars();

		// update the number slots html
		self.updateNumbers( false );		
	};

	/**
	 * Update the timer numbers
	 *
	 * @params boo isRandom true if the numbers should be random or false if numbers should be set
	 *
	 * @return void
	 */
	lostTimer.prototype.updateNumbers = function( isRandom ) {
		// give us our self
		var self = this;

		// min/max numbers for reset numbers to grab at random
		var min = 0;
		var max = 9;

		$( self.containerClassCss + '-number-1 .lost-flipper-number-table-cell' ).html( ( isRandom ? self.getRandomNumber( min, max ) : self.num1 ) );
		$( self.containerClassCss + '-number-2 .lost-flipper-number-table-cell' ).html( ( isRandom ? self.getRandomNumber( min, max ) : self.num2 ) );
		$( self.containerClassCss + '-number-3 .lost-flipper-number-table-cell' ).html( ( isRandom ? self.getRandomNumber( min, max ) : self.num3 ) );
		$( self.containerClassCss + '-number-4 .lost-flipper-number-table-cell' ).html( ( isRandom ? self.getRandomNumber( min, max ) : self.num4 ) );
		$( self.containerClassCss + '-number-5 .lost-flipper-number-table-cell' ).html( ( isRandom ? self.getRandomNumber( min, max ) : self.num5 ) );
	};

	/**
	 * Update timer object variables
	 *
	 * @return void
	 */
	lostTimer.prototype.updateTimeVars = function() {
		// get self
		var self = this;

		// calculate minutes and seconds
        self.minutes = parseInt( self.totalSeconds / 60 );
        self.seconds = parseInt( self.totalSeconds % 60 );

        if ( self.minutes < 100 && self.minutes > 9 ) { // two digit range needing one zero
        	self.minutes = '0' + self.minutes;
        } else { // three digit range needing two zeros
        	self.minutes = self.minutes < 100 ? "00" + self.minutes : self.minutes;
        }

        // set the second adding a zero if needed
        self.seconds = self.seconds < 10 ? "0" + self.seconds : self.seconds;

        // get individual numbers
        self.num1 = parseInt( String( self.minutes ).charAt( 0 ) );
        self.num2 = parseInt( String( self.minutes ).charAt( 1 ) );
        self.num3 = parseInt( String( self.minutes ).charAt( 2 ) );
        self.num4 = parseInt( String( self.seconds ).charAt( 0 ) );
        self.num5 = parseInt( String( self.seconds ).charAt( 1 ) );
	};

	/**
	 * Start the timer countdown
	 *
	 * @return void
	 */
	lostTimer.prototype.startTimer = function() {
		// get self
		var self = this;

		self.timer = setInterval( function () {
			self.onTick();

			if ( 0 == self.seconds || self.totalSeconds < 240 ) { // play ticker below four minutes
				self.playAudio( 'tick' );
			}

			if ( self.totalSeconds < 240 && self.totalSeconds % 2 == 0 && self.totalSeconds > 60 ) { // play beep below four minutes and even number
				self.playAudio( 'beep' );
			}

			if ( // play the alarm when only one minute is left every other second and every second if below ten seconds
				( self.totalSeconds <= 60 && self.totalSeconds % 2 == 0 ) ||
				( self.totalSeconds < 10 )
			) {
				self.playAudio( 'alarm' );
			}

    		self.updateTimeVars();

	        if ( 'dev' == self.mode ) { // update js timer
	       		$( self.containerClassCss + '-timer' ).html( self.minutes + ":" + self.seconds );
	       	}

	        // always try and flip the first three numbers
	        self.flip( '1', self.num1 );
	        self.flip( '2', self.num2 );
	        self.flip( '3', self.num3 );

	        if ( self.totalSeconds < 240 ) { // under four minutes display and flip seconds
	        	self.flip( '4', self.num4 );
	        	self.flip( '5', self.num5 );
	       	} 

	        if ( --self.totalSeconds < 0 ) { // decrement total seconds and check if less than zero
	            // clear the timer interval so it stops
				clearInterval( self.timer );
	            
	            setTimeout( function() { // wait one seconds and then roll glyphs
					self.rollGlyphs();
				}, 1000 );
	        }
	    }, 1000 ); 
	};

	/**
	 * Update the timer numbers
	 *
	 * @params int number number slot to try and flip to the next number
	 * @params int value value for the target flipper
	 *
	 * @return void
	 */
	lostTimer.prototype.flip = function( number, value ) {
		// get self
		var self = this; 

		if ( String( value ) != $( self.containerClassCss + '-number-' + number + ' .lost-flipper-prev .lost-flipper-number-table-cell' ).html() ) { // only flip if next/prev numbers are different
			// clone tranforming elements
	      	var flipperClassName = self.containerClassCss + '-number-' + number;

	      	// update the next number to the value
	      	$( flipperClassName + ' .lost-flipper-next .lost-flipper-number-table-cell' ).html( value );

	      	// save current elements with clone
	        var flipperNext = $( flipperClassName + ' .lost-flipper-next' ).clone();
			var flipperNextAfter = $( flipperClassName + ' .lost-flipper-next .lost-flipper-number-after' ).clone();
			var flipperPrevBefore = $( flipperClassName + ' .lost-flipper-prev .lost-flipper-number-before' ).clone();

			// make flip transform active
			$( flipperClassName + ' .lost-flipper-next' ).addClass( 'lost-flipper-next-active' );
			$( flipperClassName + ' .lost-flipper-next .lost-flipper-number-after' ).addClass( 'lost-flipper-next-after-active' );

			$( flipperClassName + ' .lost-flipper-prev .lost-flipper-number-before' ).addClass( 'lost-flipper-prev-before-active' ).one( 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() { // do things once flip transform is complete
				// replace with the clones so the css transform resets
			   	$( flipperClassName + ' .lost-flipper-next' ).replaceWith( flipperNext );
				$( flipperClassName + ' .lost-flipper-next .lost-flipper-number-after' ).replaceWith( flipperNextAfter );
				$( flipperClassName + ' .lost-flipper-prev .lost-flipper-number-before' ).replaceWith( flipperPrevBefore );

				// update the prev number to the value 
				$( flipperClassName + ' .lost-flipper-prev .lost-flipper-number-table-cell' ).html( value );
			} );
		}
	};

	/**
	 * Get a random number including the min/max passed in
	 *
	 * @params int min minimum value for the random number
	 * @params int max maximum value for the random number
	 *
	 * @return int
	 */
	lostTimer.prototype.getRandomNumber = function( min, max ) {
		// generate random number between min and max and include the max
		return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
	};

	/**
	 * Get html for glyph
	 *
	 * @params int lostTimerNumber number slot
	 * @params boo isRandom if true get random glyph html else get specified glyph 
	 *
	 * @return int
	 */
	lostTimer.prototype.getGlyphHtml = function( lostTimerNumber, isRandom ) {
		// get self
		var self = this;

		// if random get number between 1 and 5 else use the number passed in
		var glyphNumber = isRandom ? self.getRandomNumber( 1, 5 ): lostTimerNumber;

		// set color of the glyph text so we can generate the background color
		var glyphColor = lostTimerNumber > 3 ? 'black' : 'red';

		if ( self.height > 333 ) { // large image
			self.imageSize = 'large';
		} else if ( self.height <= 333 && self.height > 100 ) { // medium image
			self.imageSize = 'medium';
		} else { // small image
			self.imageSize = 'small';
		}

		// html for the glyph to be populated into the number slot
		var glyphHtml = '<div class="lost-timer-glyph-' + glyphColor + '-bg">'+
			'<img class="lost-flipper-hg-img" src="assets/glyphs/h' + glyphNumber + '-' + glyphColor + '-' + self.imageSize + '.png" />' +
		'</div>';

		return glyphHtml;
	};

	/**
	 * Stop glyphs from randomly spinning
	 *
	 * @return void
	 */
	lostTimer.prototype.stopGlyphs = function() {
		// get self
		var self = this;

		// clear glyph intervals
		clearInterval( self.glyphInterval1 );
		clearInterval( self.glyphInterval2 );
		clearInterval( self.glyphInterval3 );
		clearInterval( self.glyphInterval4 );
		clearInterval( self.glyphInterval5 );

		// clear glyph timeouts
		clearTimeout( self.glyphTimeout1 );
		clearTimeout( self.glyphTimeout2 );
		clearTimeout( self.glyphTimeout3 );
		clearTimeout( self.glyphTimeout4 );
		clearTimeout( self.glyphTimeout5 );
	};

	/**
	 * Roll glyphs randomly send timer into displaying random glyphs for each number slot
	 *
	 * @return int
	 */
	lostTimer.prototype.rollGlyphs = function() {
		// get self
		var self = this;

		// stop the timer
		clearInterval( self.timer );

		// play timeout sound
		self.playAudio( 'timeout' );

		self.glyphInterval1 = setInterval( function() { // get and show a random glyph in first number cell
			$( self.containerClassCss + '-number-1 .lost-flipper-number-table-cell' ).html( self.getGlyphHtml( 1, true ) );
		}, 50 );

		self.glyphInterval2 = setInterval( function() { // get and show a random glyph in second number cell
			$( self.containerClassCss + '-number-2 .lost-flipper-number-table-cell' ).html( self.getGlyphHtml( 2, true ) );
		}, 50 );

		self.glyphInterval3 = setInterval( function() { // get and show a random glyph in third number cell
			$( self.containerClassCss + '-number-3 .lost-flipper-number-table-cell' ).html( self.getGlyphHtml( 3, true ) );
		}, 50 );

		self.glyphInterval4 = setInterval( function() { // get and show a random glyph in fourth number cell
			$( self.containerClassCss + '-number-4 .lost-flipper-number-table-cell' ).html( self.getGlyphHtml( 4, true ) );
		}, 50 );

		self.glyphInterval5 =  setInterval( function() { // get and show a random glyph in fifth number cell
			$( self.containerClassCss + '-number-5 .lost-flipper-number-table-cell' ).html( self.getGlyphHtml( 5, true ) );
		}, 50 );		

		self.glyphTimeout1 = setTimeout( function() { // after 10.5 seconds
			// stop glyph flipping
			clearInterval( self.glyphInterval1 );

			// lock in glyph image
			$( self.containerClassCss + '-number-1 .lost-flipper-number-table-cell' ).html( self.getGlyphHtml( 1, false ) );
		}, 10500 );

		self.glyphTimeout2 = setTimeout( function() { // after 12 seconds
			// stop glyph flipping
			clearInterval( self.glyphInterval2 );

			// lock in glyph image
			$( self.containerClassCss + '-number-2 .lost-flipper-number-table-cell' ).html( self.getGlyphHtml( 2, false ) );
	
			// start system failure			
			self.systemFailure();
		}, 12000 );

		self.glyphTimeout3 = setTimeout( function() { // after 7 seconds
			// stop glyph flipping
			clearInterval( self.glyphInterval3 );

			// lock in glyph image
			$( self.containerClassCss + '-number-3 .lost-flipper-number-table-cell' ).html( self.getGlyphHtml( 3, false ) );
		}, 7000 );

		self.glyphTimeout4 = setTimeout( function() { // after 6 seconds
			// stop glyph flipping
			clearInterval( self.glyphInterval4 );

			// lock in glyph image
			$( self.containerClassCss + '-number-4 .lost-flipper-number-table-cell' ).html( self.getGlyphHtml( 4, false ) );
		}, 6000 );

		self.glyphTimeout5 = setTimeout( function() { // after 8.5 seconds
			// stop glyph flipping
			clearInterval( self.glyphInterval5 );

			// lock in glyph image
			$( self.containerClassCss + '-number-5 .lost-flipper-number-table-cell' ).html( self.getGlyphHtml( 5, false ) );
		}, 8500 );
	};

	/**
	 * System failure when the glyphs lock in place and the world starts ending
	 *
	 * @return void
	 */
	lostTimer.prototype.systemFailure = function() {
		// get self
		var self = this;

		// play spinup and dischard sounds
		self.playAudio( 'spinup' );
		self.playAudio( 'discharge' );
		
		self.systemFailureInterval = setInterval( function () { // play system failure every second
			self.playAudio( 'systemfailure' );

			// make the body shake
			$( 'body' ).addClass( 'lost-timer-shake' );
		}, 1000 );

		self.systemFailureTimout = setTimeout( function() { // stop system failure sound after 36 seconds
			clearInterval( self.systemFailureInterval );

			// make the body sstop hake
			$( 'body' ).removeClass( 'lost-timer-shake' );
		}, 36000 );

		self.thudTimeout = setTimeout( function() { //  play lost thud after 46 seconds game over
			// show and fade in white screen
			$( '.lost-timer-end-screen' ).show();
			$( '.lost-timer-end-screen' ).animate( { opacity: 1 }, 500 );

			self.playAudio( 'thud' );
		}, 46000 );
	};

	/**
	 * Reset the timer to the initial seconds
	 *
	 * @return int
	 */
	lostTimer.prototype.reset = function() {
		// get self
		var self = this;
		
		$( self.containerClassCss + ' audio' ).each( function() { // loop over all audio
			// pause track and reset its time to the beginning
		    this.pause();
		    this.currentTime = 0;
		} ); 

		// clear intervals timer and system failure
		clearInterval( self.systemFailureInterval );
		clearInterval( self.timer );

		// clear timeouts system failure and thud
		clearTimeout( self.systemFailureTimout );
		clearTimeout( self.thudTimeout );

		// play flipping reset sound
		self.playAudio( 'reset' );

		// make the body stop hake
		$( 'body' ).removeClass( 'lost-timer-shake' );

		// hide white end screen
		$( '.lost-timer-end-screen' ).hide();
		$( '.lost-timer-end-screen' ).css( 'opacity', 0 );

		// stop all glyphs
		self.stopGlyphs();

		// count times we play reset animation
		var count = 0;
		
		resetAnimate = setInterval( function () { // randomly display number in each spot until reset sound is complete
			// update the number slots html
			self.updateNumbers( true );

			if ( ++count > 10 ) { // after 10 times stop reset initialize and start timer
	            clearInterval( resetAnimate );
	            self.initializeTimer( self.initialSeconds );
            	self.startTimer();
	        }
		}, 120 );
    };

	// return it
	return lostTimer;
} )();