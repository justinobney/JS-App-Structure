var warmup = {};

(function () {

    var fileName = "warmup.common.js";

	// QUESTION: Should this go into the app.common itself or in a test.js file?
	function checkDependencies(){

		var dependencyMap = [
			{ name: 'jQuery Datatables plugin', testObject: $.fn.dataTable },
			{ name: 'jQuery Map Events plugin', testObject: $.mapEvents },
			{ name: 'jQuery Pub/Sub plugin', testObject: $.publish },
			{ name: 'jQuery Bootstrap plugin', testObject: $.fn.modal },
            { name: 'Array forEach polyfill', testObject: Array.prototype.forEach }
		];

		// Perform checks
		var missingDependencies = [];

		dependencyMap.forEach( function(element, index, array){
			if ( typeof element.testObject === 'undefined' ) {
				missingDependencies.push( element.name );
			};
		});

		if ( missingDependencies.length ) {
			alert( 'The following dependencies is missing in ' + fileName + ': \r\n' + missingDependencies.join('\n') );
		};
	}

    warmup.common = {
        init: function() {

        	checkDependencies();

            warmup.common.setupDataTableDefaults(); // OMIT FOR TESTING..

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
            var data = new Array();

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

            elements.each( function(i,e) {
                var target = $(e);
                var source = target.data("autocomplete-source");
                var relatedId = target.data("autocomplete-related-id");
                var relatedName = target.data("autocomplete-related-name");

                if ( typeof (source && (relatedId || relatedName)) === 'undefined' ) {
                    throw new Error( "Autocomplete incorrectly initialized :: Attributes Required: autocomplete-source AND ( autocomplete-related-id OR autocomplete-related-name )", fileName);
                };

                var relatedEl = (relatedId) ? $('#' + relatedId) : $('input[name="'+ relatedName +'"]') ;                
                var minLength = target.data( "autocomplete-min-length" ) || 5;

                var autocompleteOtions = $.extend( options, {
                    source: function(query, callback){
                        $.get(source + '?term=' + query, function( data, status, xhr, dataType ){
                            if (Array.isArray(data)) {
                                callback(data);
                            } else {
                                throw new Error("Bad Autocomplete Response ::: Autocomplete reponse is expected to be a JSON Array: [" + source + '?term=' + query + "]", fileName);
                            }
                        });
                    },
                    minLength: minLength,
                    updater: function (item) {
                        
                        alert(item);
                        return;

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
        	$('[data-js="tooltip"]').tooltip();

        	// Initialize dropdowns
        	$('[data-toggle="dropdown"]').dropdown();
        }
    };
})();

$(function () {
    warmup.common.init();
});