/*
 *  Project: Javascript Application Architecture
 *  Description: This is my base architecture using practices that work FOR ME
 *  Author: Justin Obney - http://resume.justinobney.com
 *  License: Creative Commons? IDK.. I dont care..
 */
 
var StandardApp = function ( $, window, document, undefined ) {
    var appName = "StandardApp";

    // Private variables for INTERNAL use only
    var vars = {
        /*propertyName: "value"*/
        isInitialized: false
    };

    // Configuration that we will provide access to
    var config = {
        /*propertyName: "value"*/
        preventReInit: true,
        eventNamespace: appName
    };

    // Name Public functions (that will be exposed) with Captialize Words and NO UNDERSCORE
    function Init( settings ){

        if ( config.preventReInit && vars.isInitialized ){
            // alert("Init called after app is initialized.");
            throw {
                name: "Multiple init exception",
                message: "By default, initializing multiple times is not allowed."
            };
        }

        vars.isInitialized = true;

        config = $.extend( {}, config, settings );

        _Publish( 'init', config );

        return config;
    }

    // Denote private functions with an underscore and Captialize Words
    function _PrivateHelper(){

    }

    // =========== Observable Implimentation ===================
    // Use internal Pub/Sub to be able to swap out implimentation
    // ---------------------------------------------------------
    function _BindListeners(){
        // _Subscribe('myHandler', function() {
        //     alert('My handeler was invoked:');
        // });
    }

    function _Subscribe( eventName, handler ){

        $.subscribe = $.subscribe || $.noop;

        $.subscribe( eventName, handler );

    }

    function _Publish( eventName, data, optionalNamespace ){

        $.publish = $.publish || $.noop;

        var namespace = ( optionalNamespace || config.eventNamespace );
        var qualifiedEventName = config.eventNamespace + '/' + eventName;

        $.publish( qualifiedEventName, data );

    }
    // =========== END Observable Implimentation ================

    return {
        init: Init,
        settings: config
    };
}