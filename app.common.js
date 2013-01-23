var warmup = {};

(function () {

	var fileName = "warmup.common.js";

	// QUESTION: Should this go into the app.common itself or in a test.js file?
	function checkDependencies(suppressAlert){

		var dependencyMap = [
			{ key: 'datatables', name: 'jQuery Datatables plugin', testObject: $.fn.dataTable },
			{ key: 'mapevents', name: 'jQuery Map Events plugin', testObject: $.mapEvents },
			{ key: 'pubsub', name: 'jQuery Pub/Sub plugin', testObject: $.publish },
			{ key: 'bootstrap', name: 'jQuery Bootstrap plugin', testObject: $.fn.modal },
			{ key: 'foreach', name: 'Array forEach polyfill', testObject: Array.prototype.forEach },
			{ key: 'isArray', name: 'Array.isArray polyfill', testObject: Array.isArray }
		];

		// Perform checks
		var missingDependencies = [];
		var dependencyResults = {};

		dependencyMap.forEach( function(element, index, array){
			var hasDependency = true;

			if ( typeof element.testObject === 'undefined' ) {
				missingDependencies.push( '-- ' + element.name );
				hasDependency = false;
			}

			dependencyResults[element.key] = hasDependency;

		});

		if ( missingDependencies.length ) {
			var message = 'The following dependencies are missing in ' + fileName + ': \r\n' + missingDependencies.join('\n');
			(suppressAlert) ? console.log(message) : alert(message) ;
		}

		return dependencyResults;
	}

	var selectors = {
		tooltip: '[data-js="tooltip"]',
		dropdown: ''
	};

	warmup.common = {
		init: function() {

			var dependencyResults = checkDependencies( /* suppressAlert */ true);

			if (dependencyResults.datatables === true) {
				warmup.common.setupDataTableDefaults(); // OMIT FOR TESTING..
			}

			$.ajaxSetup({
				cache: false
			});

			warmup.common.bindEventListeners();
			warmup.common.initBootstrapHelpers();
		},

		setupDataTableDefaults: function() {
			$.extend( $.fn.dataTable.defaults, {
				"bJQueryUI": false,
				"bProcessing": false,
				"bServerSide": true,
				"fnServerData": warmup.common.getTableData
			});
		},

		getTableData: function( sSource, aoData, fnCallback ) {
			var data = [];

			var columnCount = _.find(aoData, function(o) { return o.name == 'iColumns'; }).value;
			var echo = _.find(aoData, function(o) { return o.name == 'sEcho'; }).value;
			var skip = _.find(aoData, function(o) { return o.name == 'iDisplayStart'; }).value;
			var take = _.find(aoData, function(o) { return o.name == 'iDisplayLength'; }).value;
			var search = _.find(aoData, function(o) { return o.name == 'sSearch'; }).value;
			var sortCols = _.filter(aoData, function(o) { return o.name.indexOf('iSortCol_') == 0; });
			var sortDirs = _.filter(aoData, function(o) { return o.name.indexOf('sSortDir_') == 0; });
			var searches = _.filter(aoData, function(o) { return o.name.indexOf('sSearch_') == 0; });
			var custom = _.filter(aoData, function(o) { return o.custom; });

			data.push({ "name": "TableEcho", "value": echo });
			data.push({ "name": "Skip", "value": skip });
			data.push({ "name": "Take", "value": take });
			data.push({ "name": "AllSearch", "value": search });

			var actual = 0;

			_.each(sortCols, function(columnSort, sortIndex) {
				var columnIndex = columnSort.value;
				var columnSearch = searches[columnIndex].value;
				var sortDir = sortDirs[sortIndex].value;

				data.push({ "name": "Columns[" + actual + "].ColumnIndex", "value": columnIndex });
				data.push({ "name": "Columns[" + actual + "].SortDirection", "value": sortDir });

				if (columnSearch != '') {
					data.push({ "name": "Columns[" + actual + "].SearchTerm", "value": columnSearch });
				}

				actual++;
			});

			for (var i = 0; i < columnCount; i++) {
				var searchTerm = searches[i].value;
				if (searchTerm == '') {
					continue;
				}
				data.push({ "name": "Columns[" + actual + "].ColumnIndex", "value": i });
				data.push({ "name": "Columns[" + actual + "].SearchTerm", "value": searchTerm });
				actual++;
			}

			_.each(custom, function(item, index) {
				data.push({ "name": item.name, "value": item.value });
			});

			$.post(sSource, data)
				.success(fnCallback);
		},
		
		initAutocomplete: function ( el, options ) {
			var elements = (el) ? $(el) : $('[data-autocomplete-source]');

			function showFailedAjax(target, query, source){
				target.val( "Error: Bad Autocomplete Response" );
				target.closest('.control-group').addClass('error');
				console.log("Bad Autocomplete Response ::: Autocomplete reponse is expected to be a JSON Array: [" + source + '?term=' + query + "]", fileName);
			}

			elements.each( function(i,e) {
				var target = $(e);
				var source = target.data("autocomplete-source");
				var relatedId = target.data("autocomplete-related-id");
				var relatedName = target.data("autocomplete-related-name");

				if ( typeof (source && (relatedId || relatedName)) === 'undefined' ) {
					target.closest('.control-group').addClass('error');
					target.attr('disabled',"disabled");
					target.val( "Error: Missing Required Attributes" );
					console.log( "Autocomplete incorrectly initialized :: Attributes Required: autocomplete-source AND ( autocomplete-related-id OR autocomplete-related-name )", fileName);
				}

				var relatedEl = (relatedId) ? $('#' + relatedId) : $('input[name="'+ relatedName +'"]');
				var minLength = target.data( "autocomplete-min-length" ) || 5;

				// Might cause issues.. Look into not initializing already initialized elements.
				// IDEA: check for el.data('autocomplete');
				// var origPlaceholder = target.attr('placeholder');
				// target.attr('placeholder', origPlaceholder + ' (Min length: ' + minLength + ')');

				var autocompleteOtions = $.extend( options, {
					source: function(query, callback){
						$.get(source + '?term=' + query, function( response, status, xhr, dataType ){
							var items = response.data || response;
							if (Array.isArray(items)) {
								callback(items);
							} else {
								showFailedAjax(target, query, source);
							}
						}).error(function(){
							showFailedAjax(target, query, source);
						});
					},
					minLength: minLength,
					updater: function (item) {
						target.val( 'Selected: ' + item );
						relatedEl.val(item);
					}
				});

				target.typeahead(autocompleteOtions);

				target.on( 'blur.autocomplete', function(event) {
					var thisEl = $(event.target);
					if ( !thisEl.val() ) {
						relatedEl.val('');
					}
				});
			});
		},

		bindEventListeners: function () {
			// ================= EVENT MAPPING ============
			var eventMap = [
				['shown', 'ajax/NewContentLoaded', '.modal']
			];

			$.mapEvents( eventMap );
			// ================= EVENT MAPPING ============


			$.subscribe( 'ajax/newContentLoaded', function (event) {
				warmup.common.initBootstrapHelpers();

				// Hide open tooltips b/c deleting an item with an open tooltip
				// keeps the tooltip open until the page is refreshed
				$(selectors.tooltip).tooltip('hide');
			});
			
			// Publish "newContentLoaded" after all successfull ajax calls..
			$(document).ajaxSuccess( function() {
				$.publish( 'ajax/newContentLoaded' );
			});
		},

		initBootstrapHelpers: function() {
			// Initialize all automatic autocomplete elements
			warmup.common.initAutocomplete();

			// Initialize all tooltips
			$(selectors.tooltip).tooltip();

			// Initialize dropdowns
			$(selectors.dropdown).dropdown();
		}
	};
})();

$(function () {
	warmup.common.init();
});