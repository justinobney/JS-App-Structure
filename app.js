/*
 *  Project: Javascript Application Architecture
 *  Author: Justin Obney - http://resume.justinobney.com
 *  Description: This is my base architecture using practices that work FOR ME
 *             : This is using the Revealing Prototype Pattern. 
 *             : Key Factors:
 *                 - Variables defined in constructor
 *                 - Methods defined via Revealing Module Pattern on object's prototype
 *  License: Creative Commons? IDK.. I dont care..
 */
 
// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
var StandardApp = function () {
    this.appName = "StandardApp";

    // Private variables for INTERNAL use only
    this.vars = {
        /*propertyName: "value"*/
        isInitialized: false
    };

    // Configuration that we will provide access to
    this.config = {
        /*propertyName: "value"*/
        preventReInit: true,
        eventNamespace: this.appName
    };
};

StandardApp.prototype = function(_, pubsub, window, document, undefined){

    // Name Public functions (that will be exposed) with Captialize Words and NO UNDERSCORE
    var Init = function(settings){

        if ( this.config.preventReInit && this.vars.isInitialized ){
            // alert("Init called after app is initialized.");
            throw {
                name: "Multiple init exception",
                message: "By default, initializing multiple times is not allowed."
            };
        }

        this.vars.isInitialized = true;

        this.config = _.extend(this.config, settings);
        
        // Use Function.call when the method needs to set the "this" object to the current instance.
        _Publish.call(this,'init', [this.config]);

        // This function doesn't use "this" (referring to the current instance), thus can be call normally
        // Is there a huge case for this, or should I use Function.call most of the time?
        _PrivateHelper();
        return this.config;
    };

    // Used for testing.. Initializing multiple apps for testing was 
    // causing issues.. Look into Revealing Prototype Pattern
    // Refactored out with Revealing Prototype Pattern..
    /*var Reset = function(){
        this.vars.isInitialized = false;
    };*/

    // Denote private functions with an underscore and Captialize Words
    var _PrivateHelper = function(){
        console.log("Called inside _PrivateHelper..");
    };

    // =========== Observable Implimentation ===================
    // Use internal Pub/Sub to be able to swap out implimentation
    // ---------------------------------------------------------
    var _BindListeners = function(){
        // _Subscribe('myHandler', function() {
        //     alert('My handeler was invoked:');
        // });
    };

    var _Subscribe = function(eventName, handler){

        pubsub.subscribe(eventName, handler);

    };

    var _Publish = function(eventName, data, optionalNamespace){

        var namespace = (optionalNamespace || this.config.eventNamespace);
        var qualifiedEventName = namespace + '/' + eventName;

        pubsub.publish(qualifiedEventName, data);

    };
    // =========== END Observable Implimentation ================

    return {
        init: Init
    };

}( _, pubsub, window, document); // Pass in dependancies