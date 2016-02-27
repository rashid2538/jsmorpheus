( function( $ ) {
	Function.prototype.bind = Function.prototype.bind || function() {
		return $.proxy( this, arguments[ 0 ] );
	};
	Array.prototype.map = Array.prototype.map || function( func ) {
		return $.each( this, function( i, item ) {
			func.call( this, item );
		});
	};
	document.head = document.head || document.getElementsByTagName( 'head' )[ 0 ];
	var App = function( options ) {
		this.configuration = options;
		this.boot();
		return this;
	};
	App.prototype = {
		elementsLoading : 0,
		version : '1.0.0',
		boot : function() {
			console.log( 'booting ...' );
			this.$preloader = $( '#preloader' );
			this.$body = $( '#app' );
			document.title = this.configuration.title || 'Weather Around';
			this.configuration.js && this.configuration.js.map( this.script.bind( this ) );
			this.configuration.css && this.configuration.css.map( this.stylesheet.bind( this ) );
			this.element = document.createElement( 'WEATHER' );
			this.checkLoad();
		}, on : function( type, listener, elem ) {
			$( elem || this.element ).on( type, listener.bind( this ) );
		}, fire : function( type, elem ) {
			$( elem || this.element ).trigger( type );
		}, checkLoad : function() {
			if( this.elementsLoading > 0 ) {
				setTimeout( this.checkLoad.bind( this ), 100 );
				return false;
			}
			this.fire( 'ready' );
		}, showPreloader : function() {
			this.$body.addClass( 'loading' );
			this.$preloader.show();
		}, hidePreloader : function() {
			document.body.classList.remove( 'loading' );
			this.$body.removeClass( 'loading' );
			this.$preloader.hide();
		}, script : function( src ) {
			$( document.createElement( 'script' ) ).on( 'load', this.elementLoaded.bind( this ) ).on( 'error', this.elementFailed.bind( this ) ).appendTo( document.body )[ 0 ].src = src;
			this.elementsLoading++;
		}, elementLoaded : function( e ) {
			console.log( ( e.target.src || e.target.href ) + ' loaded.' );
			this.elementsLoading--;
		}, elementFailed : function( e ) {
			console.error( ( e.target.src || e.target.href ) + ' failed to load!' );
			this.elementsLoading--;
		}, stylesheet : function( href ) {
			$( '<link href="' + href + '" rel="stylesheet" />' ).on( 'load', this.elementLoaded.bind( this ) ).on( 'error', this.elementFailed.bind( this ) ).appendTo( document.head );
			this.elementsLoading++;
		}, navbar : function( title, links, form ) {
			links = links || [];
			form = form || [];
			var hasElements = ( links.length + form.length ) > 0;
			$( '#appMenuContainer' ).html( '<nav class="navbar navbar-default"><div class="container-fluid"><div class="navbar-header">' + ( hasElements ? '<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#appMenu" aria-expanded="false"><span class="sr-only">Toggle navigation</span><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button>' : '' ) + '<a class="navbar-brand" href="">' + title + '</a></div><div class="collapse navbar-collapse" id="appMenu">' + ( links.length > 0 ? '<ul class="nav navbar-nav">' + links.map( function( l ) {
					return '<li><a href="javascript:;" onclick="javascript:' + l.click + ';">' + l.text + '</a></li>';
			}).join( '' ) + '</ul>' : '' ) + ( form.length > 0 ? '<form id="appMenuForm" onsubmit="javascript:return false;" class="navbar-form navbar-left" role="search">' + form.map( function( i ) {
				return '<div class="form-group"><input type="' + ( i.type || 'text' ) + '" class="form-control" name="' + i.name + '" placeholder="' + i.label + '" /></div>'; 
			}).join( '' ) + '<button type="submit" class="btn visible-xs btn-default btn-block">Submit</button><button type="submit" class="btn hidden-xs btn-default">Submit</button></form>' : '' ) + '</div></div></nav>' );
		}, alert : function( message, callback, type, title, button ) {
			var me = this;
			callback = callback || $.noop;
			title = title || 'Alert';
			type = type || 'default';
			button = button || 'Ok';
			$( '<div class="modal fade" data-backdrop="static"><div class="modal-dialog"><div class="modal-content"><div class="panel panel-' + type + '" style="margin-bottom: 0;"><div class="panel-heading"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h3 class="panel-title">' + title + '</h3></div><div class="panel-body"><p style="word-break: break-all;">' + message + '</p></div><div class="panel-footer"><div class="btn-group btn-group-lg btn-group-justified" role="group"><div class="btn-group" role="group"><button type="button" class="btn btn-default" data-dismiss="modal">' + button + '</button></div></div></div></div></div></div></div>' ).appendTo( this.$body ).modal().on( 'hidden.bs.modal', function() {
				callback.call( me );
				$( this ).remove();
				$( window ).trigger( 'resize' );
			}).modal( 'show' );
		}, confirm : function( message, callback, type, title, buttons ) {
			var me = this;
			callback = callback || $.noop;
			title = title || 'Confirm';
			type = type || 'default';
			buttons = buttons || [ 'Ok', 'Cancel' ];
			var $confirmModal = $( '<div class="modal fade" data-backdrop="static"><div class="modal-dialog"><div class="modal-content"><div class="panel panel-' + type + '" style="margin-bottom: 0;"><div class="panel-heading"><button type="button" rel="0" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h3 class="panel-title">' + title + '</h3></div><div class="panel-body"><p style="word-break: break-all;">' + message + '</p></div><div class="panel-footer"><div class="btn-group btn-group-lg btn-group-justified" role="group">' + buttons.map( function( b, i ) {
				return '<div class="btn-group" role="group"><button type="button" rel="' + ( i + 1 ) + '" class="btn btn-default">' + b + '</button></div>';
			}).join( '' ) + '</div></div></div></div></div></div>' ).appendTo( this.$body ).modal().on( 'click', 'button', function() {
				callback.call( me, this.getAttribute( 'rel' ) );
				$confirmModal.modal( 'hide' ).remove();
				$( window ).trigger( 'resize' );
			}).modal( 'show' );
		}, locate : function() {
			var promise = $.Deferred();
			navigator.geolocation.getCurrentPosition( function( position ) {
				promise.resolve( position.coords );
			}, function( error ) {
				promise.reject( error.code, error.message );
			}, {
				timeout : 10000,
				enableHighAccuracy : true,
				maximumAge : 0,
			});
			return promise;
		}, storage : function( key, value ) {
			if( value ) {
				localStorage.setItem( key, JSON.stringify( value ) );
				return this;
			} else {
				try {
					return JSON.parse( localStorage.getItem( key ) );
				} catch( ex ) {
					return null;
				}
			}
		}, weather : function( location ) {
			return $.ajax({
				url : 'http://api.openweathermap.org/data/2.5/weather',
				cache : false,
				data : {
					lat : location.latitude,
					lon : location.longitude,
					appid : '44db6a862fba0b067b1930da0d769e98'
				}, dataType : 'jsonp'
			});
		}, template : function( elem, vars ) {
			var html = $( elem ).html();
			for( var i in vars ) {
				html = html.split( '{{' + i + '}}' ).join( vars[ i ] );
			}
			$( elem ).html( html );
		}
	};
	var themes = 'cerulean,cosmo,cyborg,darkly,flatly,journal,lumen,paper,readable,sandstone,simplex,slate,spacelab,superhero,united,yeti'.split( ',' );
	window.app = new App({
		title : 'Weather Around',
		css : [
			'http://bootswatch.com/' + themes[ Math.floor( Math.random() * themes.length ) ] + '/bootstrap.css',
			'icons/weather.css'
		], js : [
			'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js',
			'https://cdnjs.cloudflare.com/ajax/libs/jquery-timeago/1.5.2/jquery.timeago.min.js'
		]
	});
	var startLocating = function() {
		app.locate().done( function( coords ) {
			app.weather( coords ).done( function( weather ) {
				showWeather( weather );
			}).fail( function( code, message ) {
				app.alert( 'Failed to load weather data!', startLocating, 'danger', 'Request Error', 'Retry' );
			});
		}).fail( function( code, message ) {
			app.alert( '<b>Code:</b> ' + code + '<br /><b>Details:</b> ' + message + '!', startLocating, 'danger', 'Location Error', 'Retry' );
		});
	}, showWeather = function( weather ) {
		var recentLocations = app.storage( 'recentLocations' ) || {};
		recentLocations[ weather.id ] = weather.name;
		app.storage( 'recentLocations', recentLocations );
		app.currentLocation = weather.id;
		var navLinks = [];
		for( var i in recentLocations ) {
			if( app.currentLocation != i ) {
				navLinks.push({
					click : 'app.changeCity(' + i + ')',
					text : recentLocations[ i ]
				});
			}
		}
		app.navbar( weather.name, navLinks, [{
			type : 'search',
			label : 'Search by postcode ...',
			name : 'postcodeTextbox'
		}]);
		document.title = weather.name + ' Weather';
		app.template( '#pageTemplate', {
			locationImage : 'https://maps.googleapis.com/maps/api/staticmap?center=' + [ weather.coord.lat, weather.coord.lon ].join( ',' ) + '&zoom=13&size=' + [ window.innerWidth, parseInt( window.innerWidth / 2 ) ].join( 'x' ) + '&maptype=roadmap&markers=color:blue%7Clabel:S%7C' + [ weather.coord.lat, weather.coord.lon ].join( ',' ),
			conditionImage : 'http://openweathermap.org/img/w/' + weather.weather[ 0 ].icon + '.png',
			title : weather.weather[ 0 ].main,
			description : weather.weather[ 0 ].description,
			temp : parseInt( weather.main.temp - 273 ),
			tempMin : parseInt( weather.main.temp_min - 273 ),
			tempMax : parseInt( weather.main.temp_max - 273 ),
			readingTime : new Date( weather.dt * 1000 ).toISOString()
		});
		$( 'time.timeago' ).timeago();
		$( window ).trigger( 'resize' );
		// app.alert( JSON.stringify( weather ) );
	};
	var $header = $( '#header' ), $body = $( '#body' ), $footer = $( '#footer' );
	$( window ).resize( function() {
		var h = $( '.panel', $header ).height(), f = $( '.panel', $footer ).height();
		$body.css({
			top : h + 'px',
			bottom : f + 'px'
		});
		$header.height( h );
		$footer.height( f );
	});
	app.on( 'ready', function() {
		app.hidePreloader();
		if( app.storage( 'version' ) != app.version ) {
			app.alert( 'Please allow location access to get this app working when asked for the same.', function() {
				app.storage( 'version', app.version );
				startLocating();
			}, 'info', 'Welcome', 'Got It' );
		} else {
			startLocating();
		}
	});
})( jQuery );