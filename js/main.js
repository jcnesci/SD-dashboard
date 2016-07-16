var main = (function() {

	var that = {};
	var data;
	var config = {
		graphs: [
			{
				name: 'Request locations : last 200 items',
				type: 'map',
				data: undefined,
				svg: undefined
			},
			// {
			// 	name: 'Requests per hour, stacked : last 200 items',
			// 	type: 'stacked',
			// 	data: undefined,
			// 	svg: undefined
			// },
			// {
			// 	name: 'Requests per category, pie : last 200 items',
			// 	type: 'piechart',
			// 	data: undefined,
			// 	svg: undefined
			// }
		]
	};

	////////////////////////////////////////////////////
	////////////////////// START ///////////////////////
	////////////////////////////////////////////////////

	init();

	function init() {
		data = dataEngine.load( config );
	}

	////////////////////////////////////////////////////
	///////////////// PUBLIC INTERFACE /////////////////
	////////////////////////////////////////////////////

	return that;

})();