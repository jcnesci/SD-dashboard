var graphEngine = (function() {

	var that = {};
	var mainContainerDiv = '.main_container';
	var margin = {top: 30, right: 30, bottom: 30, left: 40};
	var width = 950 - margin.left - margin.right;
	var height = 500 - margin.top - margin.bottom;

	function build( iConfig ) {

console.trace()
console.log(iConfig)

		iConfig.graphs.forEach(function(d) {

			d.svg = buildGraphContainer( d.name );

			if ( d.type === 'stacked' ) {
				buildStackedGraph( d );
			} else if ( d.type === 'piechart' ) {
				// buildPiechartGraph();
			} else if ( d.type === 'map' ) {
				buildMapGraph( d );
			}

		});

	}

	function buildGraphContainer( iName ) {

		var graphContainer = d3.select(mainContainerDiv).append('div')
			.attr('class', 'graph_container full_row')

		var gName = graphContainer.append('h2')
			.text(iName);

		var graphSvg = graphContainer.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.attr('top', 100)
			.append('g')
				.attr('transform', 'translate('+ margin.left +','+ margin.top +')');

		return graphSvg;

	}

	function buildMapGraph( iConfig ) {

		var svg = iConfig.svg;
		var data = iConfig.data[0];
		var mapData = iConfig.data[1];

// console.log( 'iConfig---' )
// console.log( iConfig )

		// Map.
		var subunits = topojson.feature(mapData, mapData.objects.sdpd_beats_wgs84);
		var projection = d3.geo.mercator()
		 .translate([width/2, height/2])
		 .scale(10000);
		var mapPath = d3.geo.path()
		    .projection(projection);
		svg.append("g")
			.attr('class', 'map')
				.append("path")
		      .datum(subunits)
		      .attr("d", mapPath);

		// Open311 request points.
		var x = d3.scale.linear()
		  .range([0, width])
		  .domain(d3.extent(data, function(d) { return d.lat; })).nice();

		var y = d3.scale.linear()
		  .range([height, 0])
		  .domain(d3.extent(data, function(d) { return d.long; })).nice();

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left");

		var color = d3.scale.category20();    // Creates 20 colors to color the dots.

		svg.append("g")
		    .attr("class", "x axis")
		    .attr("transform", "translate(0," + height + ")")
		    .call(xAxis)
		  .append("text")
		    .attr("class", "label")
		    .attr("x", width)
		    .attr("y", -6)
		    .style("text-anchor", "end")
		    .text("Latitude");

		svg.append("g")
		    .attr("class", "y axis")
		    .call(yAxis)
		  .append("text")
		    .attr("class", "label")
		    .attr("transform", "rotate(-90)")
		    .attr("y", 6)
		    .attr("dy", ".71em")
		    .style("text-anchor", "end")
		    .text("Longitude");

		svg.selectAll(".dot")
		  .data(data)
		.enter().append("circle")
		  .attr("class", "dot")
		  .attr("r", 6)
		  .attr("cx", function(d) { return x(d.lat); })
		  .attr("cy", function(d) { return y(d.long); })
		  .style("fill", function(d) { return color(d.service_name); });

		var legend = svg.selectAll(".legend")
		      .data(color.domain())
		    .enter().append("g")
		      .attr("class", "legend")
		      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		legend.append("rect")
		    .attr("x", width - 18)
		    .attr("width", 18)
		    .attr("height", 18)
		    .style("fill", color);

		legend.append("text")
		    .attr("x", width - 24)
		    .attr("y", 9)
		    .attr("dy", ".35em")
		    .style("text-anchor", "end")
		    .text(function(d) { return d; });

	}

	function buildStackedGraph( iConfig ) {

console.log( 'iConfig' )
console.log( iConfig )


		var svg = iConfig.svg;
		var data = iConfig.data;
		var statuses = ['opened', 'closed'];
		var color = ['red', 'green'];
		var stackData = d3.layout.stack()(statuses.map(function( status ) {
		  return data.map(function(d) {
		    return { name: status, x: d.hour, y: d[status] };
		  });
		}));
		var x = d3.scale.ordinal().rangeRoundBands([0, width]);
		var y = d3.scale.linear().range([height, 0]);
		var z = d3.scale.ordinal().range(color);
		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient('bottom');
		    // TODO: must specify tick values manually since is ordinal scale.
		    // use a function to get only every monday or something like: http://bit.ly/29EfUt1
		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient('left');

console.log( 'stackData' )
console.log( stackData )

		x.domain(stackData[0].map(function(d) { return d.x; }));
		y.domain([0, d3.max(stackData[stackData.length - 1], function(d) { return d.y0 + d.y; })]);

		var layer = svg.selectAll('.layer')
			.data(stackData)
			.enter()
				.append('g')
				.attr('class', 'layer')
				.style('fill', function(d, i) { return z(i); });

		layer.selectAll('rect')
			.data(function(d) { return d; })
			.enter()
				.append('rect')
				.attr('x', function(d) { return x(d.x); })
				.attr('y', function(d) { return y(d.y + d.y0); })
				.attr('height', function(d) { return y(d.y0) - y(d.y + d.y0); })
				.attr('width', x.rangeBand() - 1);

		svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

	  svg.append('g')
      .attr('class', 'axis axis--y')
      .attr('transform', 'translate(' + width + ',0)')
      .call(yAxis);

	}

	////////////////////////////////////////////////////
	///////////////// PUBLIC INTERFACE /////////////////
	////////////////////////////////////////////////////

	that.build = build;
	return that;

})();