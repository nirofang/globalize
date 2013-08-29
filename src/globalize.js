define([
	"./datetime"
], function( datetime ) {

	var Globalize = {};

	Globalize.format = function( value, pattern, locale ) {
		var cldr;
		// TODO set cldr
		if ( value instanceof Date ) {
			value = datetime.format( value, pattern, cldr );
		}
		else if ( typeof value === "number" ) {
			// TODO value = number.format( value, pattern, culture );
		}
		return value;
	};

	return Globalize;

});
