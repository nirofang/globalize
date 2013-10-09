define([
	"./get-day-of-year",
	"./get-first-day-of-week",
	"./get-milliseconds-in-day",
	"./pattern-re",
	"./week-days",
	"../util/string/pad"
], function( datetimeGetDayOfYear, datetimeGetFirstDayOfWeek, datetimeGetMillisecondsInDay, datetimePatternRe, datetimeWeekDays, stringPad ) {

	/**
	 * format
	 *
	 * ref: http://www.unicode.org/reports/tr35/tr35-dates.html#Date_Format_Patterns
	 * TODO Support other calendar types.
	 *
	 * Disclosure: this function borrows excerpts of dojo/date/locale.
	 */
	return function( date, pattern, cldr ) {
		var widths = [ "abbreviated", "wide", "narrow" ];
		return pattern.replace( datetimePatternRe, function( current ) {
			var pad, ret,
				chr = current.charAt( 0 ),
				length = current.length;

			switch ( chr ) {

				// Era
				case "G":
					ret = cldr.main([
						"dates/calendars/gregorian/eras",
						length <= 3 ? "eraAbbr" : ( length === 4 ? "eraNames" : "eraNarrow" ),
						date.getFullYear() < 0 ? 0 : 1
					]);
					break;

				// Year (the length specifies the padding, but for two letters it also specifies the maximum length)
				case "y":
					ret = String( date.getFullYear() );
					pad = true;
					if ( length === 2 ) {
						ret = ret.substr( ret.length - 2 );
					}
					break;

				case "Y": // Need to be implemented. See http://www.unicode.org/reports/tr35/tr35-dates.html#Week_Data

				case "u": // Extended year. Need to be implemented.
				case "U": // Cyclic year name. Need to be implemented.

				// Quarter
				case "Q":
				case "q":
					ret = Math.ceil( ( date.getMonth() + 1 ) / 3 );
					if ( length <= 2 ) {
						pad = true;
					} else {
						// TODO documentation does not mention narrow, although narrow data is present.
						ret = cldr.main([
							"dates/calendars/gregorian/quarters",
							chr === "Q" ? "format" : "stand-alone",
							widths[ length - 3 ],
							ret
						]);
					}
					break;

				// Month
				case "M":
				case "L":
					ret = date.getMonth() + 1;
					if ( length <= 2 ) {
						pad = true;
					} else {
						ret = cldr.main([
							"dates/calendars/gregorian/months",
							chr === "M" ? "format" : "stand-alone",
							widths[ length - 3 ],
							ret
						]);
					}
					break;

				// Week
				case "w": // Week of Year. Need to be implemented.
				case "W": // Week of Month. Need to be implemented.

				// Day
				case "d":
					ret = date.getDate();
					pad = true;
					break;

				case "D":
					// FIXME getDayOfYear
					ret = datetimeGetDayOfYear( date );
					pad = true;
					break;

				case "F": // Day of Week in month. eg. 2nd Wed in July. Need to be implemented.
				case "g+": // Modified Julian day. Need to be implemented.

				// Week day
				case "e":
				case "c":
					if ( length <= 2 ) {
						// Range is [1-7] (deduced by example provided on documentation)
						// FIXME Should pad with zeros (not specified in the docs)?
						ret = ( date.getDay() - datetimeGetFirstDayOfWeek( cldr ) + 7 ) % 7 + 1;
						pad = true;
						break;
					}

				case "E":
					ret = datetimeWeekDays[ date.getDay() ];
					if ( length === 6 ) {
						// FIXME what's the diff between "short day" and "short name (EEEEEE)"???
						// -> Guess this is abbreviated. Docs are wrong.
						// Note: if short day names are not explicitly specified, abbreviated day names are used instead http://www.unicode.org/reports/tr35/tr35-dates.html#months_days_quarters_eras
						ret = cldr.main([
								"dates/calendars/gregorian/days",
								[ chr === "c" ? "stand-alone" : "format" ],
								"short",
								ret
							]) || cldr.main([
								"dates/calendars/gregorian/days",
								[ chr === "c" ? "stand-alone" : "format" ],
								"abbreviated",
								ret
							]);
					} else {
						ret = cldr.main([
							"dates/calendars/gregorian/days",
							[ chr === "c" ? "stand-alone" : "format" ],
							widths[ length < 3 ? 0 : length - 3 ],
							ret
						]);
					}
					break;

				// Period (AM or PM)
				case "a":
					ret = cldr.main([
						"dates/calendars/gregorian/dayPeriods/format/wide",
						date.getHours() < 12 ? "am" : "pm"
					]);
					break;

				// Hour
				case "h": // 1-12
					// TODO When used in skeleton data or in a skeleton passed in an API for flexible date pattern generation, it should match the 12-hour-cycle format preferred by the cldr
					ret = ( date.getHours() % 12 ) || 12;
					pad = true;
					break;

				case "H": // 0-23
					// TODO When used in skeleton data or in a skeleton passed in an API for flexible date pattern generation, it should match the 12-hour-cycle format preferred by the cldr
					ret = date.getHours();
					pad = true;
					break;

				case "K": // 0-11
					ret = date.getHours() % 12;
					pad = true;
					break;

				case "k": // 1-24
					ret = date.getHours() || 24;
					pad = true;
					break;

				case "j": // Locale preferred hHKk. Need to be implemented. See http://www.unicode.org/reports/tr35/tr35-dates.html#Time_Data

				// Minute
				case "m":
					ret = date.getMinutes();
					pad = true;
					break;

				// Second
				case "s":
					ret = date.getSeconds();
					pad = true;
					break;

				case "S":
					ret = Math.round( date.getMilliseconds() * Math.pow( 10, length - 3 ) );
					pad = true;
					break;

				case "A":
					ret = Math.round( datetimeGetMillisecondsInDay( date ) * Math.pow( 10, length - 3 ) );
					pad = true;
					break;

				// Zone
				// see http://www.unicode.org/reports/tr35/tr35-dates.html#Using_Time_Zone_Names ?
				// Need to be implemented.
				case "z":
				case "Z":
				case "O":
				case "v":
				case "V":
				case "X":
				case "x":

				default:
					throw new Error( "Invalid date format pattern \"" + chr + "\"." );
			}
			if ( pad ) {
				ret = stringPad( ret, length );
			}
			return ret;
		});
	};

});
