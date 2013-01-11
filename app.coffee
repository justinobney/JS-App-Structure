#
# *  Project: Javascript Application Architecture
# *  Author: Justin Obney - http://resume.justinobney.com
# *  Description: This is my base architecture using practices that work FOR ME
# *             : This is using the Revealing Prototype Pattern. 
# *             : Key Factors:
# *                 - Variables defined in constructor
# *                 - Methods defined via Revealing Module Pattern on object's prototype
# *  License: Creative Commons? IDK.. I dont care..
# 

# the semi-colon before function invocation is a safety net against concatenated
# scripts and/or other plugins which may not be closed properly.
StandardApp = ->
  @appName = "StandardApp"
  
  @vars = isInitialized: false
  
  # Configuration that we will provide access to
  @config =
    preventReInit: true
    eventNamespace: @appName

StandardApp:: = (_, pubsub, window, document, undefined_) ->
  
  # Name Public functions (that will be exposed) with Captialize Words and NO UNDERSCORE
  Init = (settings) ->
    if @config.preventReInit and @vars.isInitialized
      
      # alert("Init called after app is initialized.");
      throw
        name: "Multiple init exception"
        message: "By default, initializing multiple times is not allowed."
    @vars.isInitialized = true
    @config = _.extend(@config, settings)
    
    # Use Function.call when the method needs to set the "this" object to the current instance.
    _Publish.call this, "init", [@config]
    
    # This function doesn't use "this" (referring to the current instance), thus can be call normally
    # Is there a huge case for this, or should I use Function.call most of the time?
    _PrivateHelper()
    @config

  
  # Used for testing.. Initializing multiple apps for testing was 
  # causing issues.. Look into Revealing Prototype Pattern
  # Refactored out with Revealing Prototype Pattern..
  #var Reset = function(){
  #        this.vars.isInitialized = false;
  #    };
  
  # Denote private functions with an underscore and Captialize Words
  _PrivateHelper = ->
    console.log "Called inside _PrivateHelper.."

  
  # =========== Observable Implimentation ===================
  # Use internal Pub/Sub to be able to swap out implimentation
  # ---------------------------------------------------------
  _BindListeners = ->
  # _Subscribe('myHandler', function() {
  #     alert('My handeler was invoked:');
  # });
  
  _Subscribe = (eventName, handler) ->
    pubsub.subscribe eventName, handler

  _Publish = (eventName, data, optionalNamespace) ->
    namespace = (optionalNamespace or @config.eventNamespace)
    qualifiedEventName = namespace + "/" + eventName
    pubsub.publish qualifiedEventName, data

  
  # =========== END Observable Implimentation ================
  init: Init
(_, pubsub, window, document) # Pass in dependancies