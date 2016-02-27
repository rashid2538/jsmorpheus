( function( win ) { 

	wind.Promise = function() {
		return this;
	};
	Weather.prototype = {
		locate : function() {
			var promise = new Promise();
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
		}
	};
	win.Promise.prototype = {
		callbacks : {
			args : {
				done : [],
				fail : []
			}, done : [],
			fail : []
		}, done : function( callback ) {
			this.resolved ? callback.apply( this, callbacks.args.done ) : this.callbacks.done.push( callback );
		}, fail : function( callback ) {
			this.rejected ? callback.apply( this, callbacks.args.fail ) : this.callbacks.fail.push( callback );
		}, resolve : function() {
			var me = this;
			this.callbacks.args.done = arguments, this.resolved = true, this.callbacks.done.map( function( f ) {
				f.apply( me, me.callbacks.args.done );
			}), this.callbacks.done = [];
		}, reject : function() {
			var me = this;
			this.callbacks.args.fail = arguments, this.resolved = true, this.callbacks.fail.map( function( f ) {
				f.apply( me, me.callbacks.args.fail );
			}), this.callbacks.fail = [];
		}
	};
})( window );
