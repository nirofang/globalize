define([
	"cldr",
	"./datetime/format"
], function( Cldr, datetimeFormat ) {

	var defaultLocale;

	function getLocale( locale ) {
		return locale ? new Cldr( locale ) : defaultLocale;
	}

	var Globalize = {};

	// Load resolved cldr data.
	// @json [JSON]
	//
	// Somewhat equivalent to previous Globalize.addCultureInfo(...).
	Globalize.load = function( json ) {
		Cldr.load( json );
	};

	// Load unresolved cldr data.
	// @json [JSON]
	Globalize.loadUnresolved = function( json ) {
		Cldr.loadUnresolved( json );
	};

	// Set default locale.
	// @locale [String]
	//
	// Somewhat equivalent to previous culture( selector ).
	Globalize.locale = function( locale ) {
		defaultLocale = new Cldr( locale );
	};

	// Formats a date or number according to the given pattern string and the given locale (or the default locale if not specified).
	// @value [Date or Number]
	// @pattern [String] For more info see datetime/format.js
	// @locale [String]
	Globalize.format = function( value, pattern, locale ) {
		locale = getLocale( locale );

		if ( value instanceof Date ) {
			value = datetimeFormat( value, pattern, locale );
		} else if ( typeof value === "number" ) {
			// TODO value = numberFormat( value, pattern, locale );
			throw new Error("Number Format not implemented yet");
		}

		return value;
	};

	return Globalize;

});
