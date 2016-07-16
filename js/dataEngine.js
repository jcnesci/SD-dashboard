var dataEngine = (function() {

	var that = {};

	function load( iConfig ) {
		$.ajax({
		  url: 'http://san-diego.spotreporters.net/open311/v2/requests.json?page_size=200',
		  dataType: 'jsonp',
		  success: function(data) {
		  	d3.json('data/sdpd_beats.topojson', function(error, mapData) {

					if (error) return console.error(error);
			    graphEngine.build( format( iConfig, data, mapData ) );

			  });
		  }
		});
	}

	function format( iConfig, iData, iMapData ) {

		iConfig.graphs.forEach(function(d) {

			if ( d.type === 'stacked' ) {
				d.data = formatStacked( iData );
			} else if ( d.type === 'piechart' ) {
				d.data = formatPie( iData );
			} else if ( d.type === 'map' ) {
				d.data = formatMap( iData, iMapData );
			}

		});

		return iConfig;
	}

	function formatMap( iData, iMapData ) {

console.log( 'iMapData' )
console.log( iMapData )

		iData.forEach(function(d) {
		  d.lat = +d.lat;
		  d.long = +d.long;
		});

		return [ iData, iMapData ];
	}

	function formatStacked( iData ) {

		// Aggregate data per hour.
		var statusesPerHour = [];
		var dataHours = [];
		iData.forEach(function(d) {
			var hour = moment( d.updated_datetime ).startOf('hour');
			if ( !statusesPerHour[hour] ) statusesPerHour[hour] = { 'hour': hour, 'total': 0, 'opened': 0, 'closed': 0 };
			statusesPerHour[hour].total++;
			if ( d.status === 'open') statusesPerHour[hour].opened++;
			else if ( d.status === 'closed') statusesPerHour[hour].closed++;
			dataHours.push(hour);
		});

		// Find min & max hours.
		dataHours.sort(function (a, b) {
	    return moment.utc(a).diff(moment.utc(b));
		});
		var minHour = dataHours[0];
		var maxHour = dataHours[dataHours.length - 1];

		// Build array for all hours between min & max.
		// http://bit.ly/2a4vGCR
		var getHoursRangeArray = function (startDate, endDate) {
	    var dateArray = [],
	        currentDate = startDate.clone();

	    while (currentDate <= endDate) {
	        dateArray.push(currentDate);
	        currentDate = currentDate.clone().add(1, 'hour');
	    }

	    return dateArray;
		};
		var allHours = getHoursRangeArray(minHour, maxHour);
		var statusesPerHour2 = [];
		allHours.forEach(function(d) {
			var result = {};
			result.hour = d;
			if ( statusesPerHour[d] ) {
				result.total = statusesPerHour[d].total;
				result.opened = statusesPerHour[d].opened;
				result.closed = statusesPerHour[d].closed;
			} else {
				result.total = 0;
				result.opened = 0;
				result.closed = 0;
			}
			statusesPerHour2.push(result);
		});

		return statusesPerHour2;
	}

	function formatPie( iData ) {
		return 'pie data fake';
	}

	////////////////////////////////////////////////////
	///////////////// PUBLIC INTERFACE /////////////////
	////////////////////////////////////////////////////

	that.load = load;
	return that;

})();