( function( $ ){
	$.fn.odometer = function( options ) {
		var settings = {
			showInTime : 500, // miliseconds
			steps : 20,
			customFormat: function( val, precision, prefix, suffix ) {
				precision = typeof( precision ) == 'undefined' ? 2 : precision;
				prefix = prefix || '';
				suffix = suffix || '';
				if( $.isFunction( prefix ) ) {
					prefix = prefix( val );
				}
				if( $.isFunction( suffix ) ) {
					suffix = suffix( val );
				}
				return [ prefix, val.toFixed( precision ).replace( /./g, function( c, i, a ) {
					return i && c !== "." && ( ( a.length - i ) % 3 === 0 ) ? ',' + c : c;
				}), suffix ].join( '' );
			}
		};
		$.extend(settings,options);
		settings.showInTime = settings.showInTime < 500 ? 500 : settings.showInTime;
		settings.steps = settings.steps < 20 ? 20 : settings.steps;
		this.each( function() {
			var $this = $( this ), value = parseFloat( $this.text() );
			if( isNaN( value ) ) {
				return true;
			}
			var step = ( value / settings.showInTime ) * settings.steps, interval = ( settings.showInTime / settings.steps ).toFixed( 2 );
			$this.data( 'odometer-max-value', value ).data( 'odometer-current', 0 ).data( 'odometer-step', step ).data( 'odometer-interval', interval ).data( 'odometer-formatter', settings.customFormat );
			setTimeout( $.proxy( $.odometer.update, this ), interval );
		});
	};
	$.odometer = {
		update : function() {
			var $this = $( this ), newValue = $this.data( 'odometer-current' ) + $this.data( 'odometer-step' );
			if( newValue > $this.data( 'odometer-max-value' ) ) {
				newValue = $this.data( 'odometer-max-value' );
			}
			$this.text( $this.data( 'odometer-formatter' )( newValue, $this.data( 'precision' ), $this.data( 'prefix' ), $this.data( 'suffix' ) ) );
			$this.data( 'odometer-current', newValue );
			if( newValue != $this.data( 'odometer-max-value' ) ) {
				setTimeout( $.proxy( $.odometer.update, this ), $this.data( 'odometer-interval' ) );
			}
		}
	};
	$( window ).load( function() {
		$( '.odometer' ).odometer();
	});
})( jQuery );
