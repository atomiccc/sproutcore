// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('foundation/object') ;

/** 
  Default placeholder for multiple values in bindings.
*/
SC.MULTIPLE_PLACEHOLDER = '@@MULT@@' ;

/**
  Default placeholder for null values in bindings.
*/
SC.NULL_PLACEHOLDER = '@@NULL@@' ;

/**
  Default placeholder for empty values in bindings.
*/
SC.EMPTY_PLACEHOLDER = '@@EMPTY@@' ;


/**
  A binding simply connects the properties of two objects so that whenever the
  value of one property changes, the other property will be changed also.  You
  do not usually work with Binding objects directly but instead describe
  bindings in your class definition using something like:
  
    valueBinding: "MyApp.someController.title"
    
  This will create a binding from "MyApp.someController.title" to the "value"
  property of your object instance automatically.  Now the two values will be
  kept in sync.
  
  h2. Customizing Your Bindings
  
  In addition to synchronizing values, bindings can also perform some basic 
  transforms on values.  These transforms can help to make sure the data fed 
  into one object always meets the expectations of that object regardless of
  what the other object outputs.
  
  To customize a binding, you can use one of the many helper methods defined 
  on SC.Binding like so:
  
    valueBinding: SC.Binding.single("MyApp.someController.title") 
    
  This will create a binding just like the example above, except that now the
  binding will convert the value of MyApp.someController.title to a single 
  object (removing any arrays) before applying it to the "value" property of
  your object.
  
  You can also chain helper methods to build custom bindings like so:
  
    valueBinding: SC.Binding.single("MyApp.someController.title").notEmpty("(EMPTY)")
    
  This will force the value of MyApp.someController.title to be a single value
  and then check to see if the value is "empty" (null, undefined, empty array,
  or an empty string).  If it is empty, the value will be set to the string 
  "(EMPTY)".
  
  h2. One Way Bindings
  
  One especially useful binding customization you can use is the oneWay() 
  helper.  This helper tells SproutCore that you are only interested in 
  receiving changes on the object you are binding from.  For example, if you
  are binding to a preference and you want to be notified if the preference 
  has changed, but your object will not be changing the preference itself, you
  could do:
  
    bigTitlesBinding: SC.Binding.oneWay("MyApp.preferencesController.bigTitles")
    
  This way if the value of MyApp.preferencesController.bigTitles changes the
  "bigTitles" property of your object will change also.  However, if you change
  the value of your "bigTitles" property, it will not update the 
  preferencesController.
  
  One way bindings are almost twice as fast to setup and twice as fast to 
  execute because the binding only has to worry about changes to one side.
  
  You should consider using one way bindings anytime you have an object that 
  may be created frequently and you do not intend to change a property; only 
  to monitor it for changes. (such as in the example above).
      
  h2. Adding Custom Transforms
  
  In addition to using the standard helpers provided by SproutCore, you can 
  also defined your own custom transform functions which will be used to 
  convert the value.  To do this, just define your transform function and add
  it to the binding with the transform() helper.  The following example will 
  not allow Integers less than ten.  Note that it checks the value of the 
  bindings and allows all other values to pass:
  
  {{{
    valueBinding: SC.Binding.transform(function(value, binding) {
      return ((SC.$type(value) === T_NUMBER) && (value < 10)) ? 10 : value;      
    }).from("MyApp.someController.value")
  }}}
  
  If you would like to instead use this transform on a number of bindings,
  you can also optionally add your own helper method to SC.Binding.  This
  method should simply return the value of this.transform(). The example 
  below adds a new helper called notLessThan() which will limit the value to
  be not less than the passed minimum:
  
  {{{
    SC.Binding.notLessThan = function(minValue) {
      return this.transform(function(value, binding) {
        return ((SC.$type(value) === T_NUMBER) && (value < minValue)) ? minValue : value ;
      }) ;
    } ;
  }}}
  
  You could specify this in your core.js file, for example.  Then anywhere in 
  your application you can use it to define bindings like so:
  
  {{{
    valueBinding: SC.Binding.from("MyApp.someController.value").notLessThan(10)
  }}}
  
  Also, remember that helpers are chained so you can use your helper along with
  any other helpers.  The example below will create a one way binding that 
  does not allow empty values or values less than 10:
  
  {{{
    valueBinding: SC.Binding.oneWay("MyApp.someController.value").notEmpty().notLessThan(10)
  }}}
  
  Note that the built in helper methods all allow you to pass a "from" property
  path so you don't have to use the from() helper to set the path.  You can do
  the same thing with your own helper methods if you like, but it is not 
  required.
  
  h2. Creating Custom Binding Templates
  
  Another way you can customize bindings is to create a binding template.  A
  template is simply a binding that is already partially or completely 
  configured.  You can specify this template anywhere in your app and then use 
  it instead of designating your own custom bindings.  This is a bit faster on
  app startup but it is mostly useful in making your code less verbose.
  
  For example, let's say you will be frequently creating one way, not empty 
  bindings that allow values greater than 10 throughout your app.  You could
  create a binding template in your core.js like this:
  
    MyApp.LimitBinding = SC.Binding.oneWay().notEmpty().notLessThan(10);
  
  Then anywhere you want to use this binding, just refer to the template like 
  so:
  
    valueBinding: MyApp.LimitBinding.beget("MyApp.someController.value")
    
  Note that when you use binding templates, it is very important that you always
  start by using beget() to extend the template.  If you do not do this, you 
  will end up using the same binding instance throughout your app which will 
  lead to erratic behavior.
  
  h2. How to Manually Activate a Binding

  All of the examples above show you how to configure a custom binding, but the
  result of these customizations will be a binding template, not a fully active
  binding.  The binding will actually become active only when you instantiate
  the object the binding belongs to.  It is useful however, to understand what
  actually happens when the binding is activated.
  
  For a binding to function it must have at least a "from" property and a "to"
  property.  The from property path points to the object/key that you want to
  bind from while the to path points to the object/key you want to bind to.  
  
  When you define a custom binding, you are usually describing the property 
  you want to bind from (such as "MyApp.someController.value" in the examples
  above).  When your object is created, it will automatically assign the value
  you want to bind "to" based on the name of your binding key.  In the examples
  above, during init, SproutCore objects will effectively call something like
  this on your binding:
  
    binding = this.valueBinding.beget().to("value", this) ;
    
  This creates a new binding instance based on the template you provide, and 
  sets the to path to the "value" property of the new object.  Now that the 
  binding is fully configured with a "from" and a "to", it simply needs to be
  connected to become active.  This is done through the connect() method:
  
    binding.connect() ;
    
  Now that the binding is connected, it will observe both the from and to side 
  and relay changes.
  
  If you ever needed to do so (you almost never will, but it is useful to 
  understand this anyway), you could manually create an active binding by 
  doing the following:
  
  {{{
    SC.Binding.from("MyApp.someController.value")
     .to("MyApp.anotherObject.value")
     .connect();
  }}}
     
  You could also use the bind() helper method provided by SC.Object. (This is 
  the same method used by SC.Object.init() to setup your bindings):
  
  {{{
    MyApp.anotherObject.bind("value", "MyApp.someController.value") ;
  }}}

  Both of these code fragments have the same effect as doing the most friendly
  form of binding creation like so:
  
  {{{
    MyApp.anotherObject = SC.Object.create({
      valueBinding: "MyApp.someController.value",
      
      // OTHER CODE FOR THIS OBJECT...
      
    }) ;
  }}}
  
  SproutCore's built in binding creation method make it easy to automatically
  create bindings for you.  You should always use the highest-level APIs 
  available, even if you understand how to it works underneath.
  
  
  @extends Object
  
*/
SC.Binding = {
  
  /**
    This is the core method you use to create a new binding instance.  The
    binding instance will have the receiver instance as its parent which means
    any configuration you have there will be inherited.  
    
    The returned instance will also have its parentBinding property set to the 
    receiver.

    @param fromPath {String} optional from path.
    @returns {SC.Binding} new binding instance
  */
  beget: function(fromPath) {
    var ret = SC.beget(this) ;
    ret.parentBinding = this;
    if (fromPath !== undefined) ret = ret.from(fromPath) ;
    return ret ;
  },
  
  /**
    Returns a builder function for compatibility.  
  */
  builder: function() {
    var binding = this ;
    var ret = function(fromProperty) { return binding.beget().from(fromProperty); };
    ret.beget = function() { return binding.beget(); } ;
    return ret ;
  },
  
  /**
    This will set "from" property path to the specified value.  It will not
    attempt to resolve this property path to an actual object/property tuple
    until you connect the binding.
    
    @param propertyPath {String|Tuple} A property path or tuple
    @param root {Object} optional root object to use when resolving the path.
    @returns {SC.Binding} this
  */
  from: function(propertyPath, root) {
    
    // if the propertyPath is null/undefined, return this.  This allows the
    // method to be called from other methods when the fromPath might be 
    // optional. (cf single(), multiple())
    if (!propertyPath) return this ;
    
    // beget if needed.
    var binding = (this === SC.Binding) ? this.beget() : this ;
    binding._fromPropertyPath = propertyPath ;
    binding._fromRoot = root ;
    bidning._fromTuple = null ;
    return binding ;
  },
  
  /**
   This will set the "to" property path to the specified value.  It will not 
   attempt to reoslve this property path to an actual object/property tuple
   until you connect the binding.
    
    @param propertyPath {String|Tuple} A property path or tuple
    @param root {Object} optional root object to use when resolving the path.
    @returns {SC.Binding} this
  */
  to: function(propertyPath, root) {
    // beget if needed.
    var binding = (this === SC.Binding) ? this.beget() : this ;
    binding._toPropertyPath = propertyPath ;
    binding._toRoot = root ;
    binding._toTuple = null ; // clear out any existing one.
    return binding ;
  },
  
  /**
    Attempts to connect this binding instance so that it can receive and relay
    changes.  This method will raise an exception if you have not set the 
    from/to properties yet.
    
    @returns {SC.Binding} this
  */
  connect: function() {
    
    // If the binding is already connected, do nothing.
    if (this.isConnected) return this ;

    // try to connect the from side.
    SC.Observers.addObserver(this._fromPropertyPath, this.propertyDidChange, this, this._fromRoot) ;
    
    // try to connect the to side
    if (!this._oneWay) {
      SC.Observers.addObserver(this._toPropertyPath, this.propertyDidChange, this, this._toRoot) ;  
    }
    
    this.isConnected = YES ;
    return this; 
  },
  
  /**
    Disconnects the binding instance.  Changes will no longer be relayed.  You
    will not usually need to call this method.
    
    @returns {SC.Binding} this
  */
  disconnect: function() {
    if (!this.isConnected) return this; // nothing to do.

    SC.Observers.removeObserver(this._fromPropertyPath, this.propertyDidChange, this, this._fromRoot) ;
    if (!this._oneWay) {
      SC.Observers.removeObserver(this._toPropertyPath, this.propertyDidChange, this, this._toRoot) ;
    }
    
    this.isConnected = NO ;
    return this ;  
  },

  /**
    This method is invoked whenever the value of a property changes.  It will 
    save the property/key that has changed and relay it later.
  */
  fromPropertyDidChange: function(key, target) {
    var v = target.get(key) ;
    
    // if the new value is different from the current binding value, then 
    // schedule to register an update.
    if (v !== this._bindingValue) {
      this._bindingValue = v ;
      SC.Binding._changeQueue.add(this) ; // save for later.  
    }
  },

  _changeQueue: SC.Set.create(),
  _alternateChangeQueue: SC.Set.create(),
  
  /**
    Call this method on SC.Binding to flush all bindings with changed pending.
    
    @returns {SC.Binding} this
  */
  flushPendingChanges: function() {
    
    // don't allow flushing more than one at a time
    if (this._isFlushing) return ; 
    this._isFlushing = YES ;
    
    // keep doing this as long as there are changes to flush.
    var queue ;
    while((queue = this._changeQueue).get('length') > 0) {

      // first, swap the change queues.  This way any binding changes that
      // happen while we flush the current queue can be queued up.
      this._changeQueue = this._alternateChangeQueue ;
      this._alternateChangeQueue = queue ;
      
      // next, apply any bindings in the current queue.  This may cause 
      // additional bindings to trigger, which will end up in the new active 
      // queue.
      var binding ;
      while(binding = queue.popObject()) binding.applyBindingValue() ;
      
      // now loop back and see if there are additional changes pending in the
      // active queue.  Repeat this until all bindings that need to trigger have
      // triggered.
    }

    // clean up
    this._isFlushing = NO ;
    return this ;
  },
  
  /**
    This method is called at the end of the Run Loop to relay the changed 
    binding value from one side to the other.
  */
  applyBindingValue: function() {
    
    // compute the binding targets if needed.
    this._computeBindingTargets() ;
    
    var v = this._bindingValue ;
    
    // the from property value will always be the binding value, update if 
    // needed.
    if (!this._oneWay && this._fromTarget) {
      this._fromTarget.setPathIfChanged(this._fromPropertyKey, v) ;
    }
    
    // apply any transforms to get the to property value also
    var transforms = this._transforms;
    if (transforms) {
      var len = transforms.length ;
      for(var idx=0;idx<len;idx++) {
        var transform = transforms[idx] ;
        v = transform(v, this) ;
      }
    }
    
    // if error objects are not allowed, and the value is an error, then
    // change it to null.
    if (this._noError && $type(v) === T_ERROR) v = null ;
    
    // update the to value if needed.
    if (this._toTarget) {
      this._toTarget.setPathIfChanged(this._toPropertyKey, v) ;
    }
  },

  _computeBindingTargets: function() {
    if (!this._fromTarget) {
      var tuple = SC.Object.tupleForPropertyPath(this._fromPropertyPath, this._fromRoot) ;
      if (tuple) {
        this._fromTarget = tuple[0]; this._fromPropertyKey = tuple[1] ;
      }
    }

    if (!this._toTarget) {
      var tuple = SC.Object.tupleForPropertyPath(this._toPropertyPath, this._toRoot) ;
      if (tuple) {
        this._toTarget = tuple[0]; this._toPropertyKey = tuple[1] ;
      }
    }
  },
  
  /**
    Configures the binding as one way.  A one-way binding will relay changes
    on the "from" side to the "to" side, but not the other way around.  This
    means that if you change the "to" side directly, the "from" side may have a
    different value.
    
    @param fromPath {String} optional from path to connect.
    @param aFlag {Boolean} Optionally pass NO to set the binding back to two-way
    @returns {SC.Binding} this
  */
  oneWay: function(fromPath, aFlag) {
    
    // If fromPath is a bool but aFlag is undefined, swap.
    if ((aFlag === undefined) && ($type(fromPath) === T_BOOL)) {
      aFlag = fromPath; fromPath = null ;
    }
    
    // beget if needed.
    var binding = this.from(fromPath) ;
    if (binding === SC.Binding) binding = binding.beget() ;
    binding._oneWay = (aFlag === undefined) ? YES : aFlag ;
    return binding ;
  },
  
  /**
    Adds the specified transform function to the array of transform functions.
    
    The function you pass must have the following signature:
    
    {{{
      function(value) {} ;
    }}}
    
    It must return either the transformed value or an error object.  
        
    Transform functions are chained, so they are called in order.  If you are
    extending a binding and want to reset the transforms, you can call
    resetTransform() first.
    
    @param transformFunc {Function} the transform function.
    @returns {SC.Binding} this
  */
  transform: function(transformFunc) {
    var binding = (this === SC.Binding) ? this.beget() : this ;
    var t = binding._transforms ;
    
    // clone the transform array if this comes from the parent
    if (t && (t === binding.parentBinding._transform)) {
      t = binding._transforms = t.slice() ;
    }
    
    // create the transform array if needed.
    if (!t) t = binding._transforms = [] ;
    
    // add the transform function
    t.push(transformFunc) ;
    return binding;
  },
  
  /**
    Resets the transforms for the binding.  After calling this method the 
    binding will no longer transform values.  You can then add new transforms
    as needed.
  
    @returns {SC.Binding} this
  */
  resetTransforms: function() {
    var binding = (this === SC.Binding) ? this.beget() : this ;
    binding._transforms = null ; return binding ;
  },
  
  /**
    Specifies that the binding should not return error objects.  If the value
    of a binding is an Error object, it will be transformed to a null value
    instead.
    
    Note that this is not a transform function since it will be called at the
    end of the transform chain.
    
    @param fromPath {String} optional from path to connect.
    @param aFlag {Boolean} optionally pass NO to allow error objects again.
    @returns {SC.Binding} this
  */
  noError: function(fromPath, aFlag) {
    // If fromPath is a bool but aFlag is undefined, swap.
    if ((aFlag === undefined) && ($type(fromPath) === T_BOOL)) {
      aFlag = fromPath; fromPath = null ;
    }
    
    // beget if needed.
    var binding = this.from(fromPath) ;
    if (binding === SC.Binding) binding = binding.beget() ;
    binding._noError = (aFlag === undefined) ? YES : aFlag ;
    return binding ;
  },
  
  /**
    Adds a transform to the chain that will allow only single values to pass.
    This will allow single values, nulls, and error values to pass through.  If
    you pass an array, it will be mapped as so:
    
    {{{
      [] => null
      [a] => a
      [a,b,c] => Multiple Placeholder
    }}}
    
    You can pass in an optional multiple placeholder or it will use the 
    default.
    
    Note that this transform will only happen on forwarded valued.  Reverse
    values are send unchanged.
    
    @param fromPath {String} from path or null
    @param placeholder {Object} optional placeholder value.
    @returns {SC.Binding} this
  */
  single: function(fromPath, placeholder) {
    if (placeholder === undefined) {
      placeholder = SC.MULTIPLE_PLACEHOLDER ;
    }
    return this.from(fromPath).transform(function(value, isForward) {
      if (SC.isArray(value)) {
        value = (value.length > 1) ? placeholder : (value.length <= 0) ? null : (value.objectAt) ? value.objectAt(0) : value[0];
      }
      return value ;
    }) ;
  },
  
  /** 
    Adds a transform that will return the placeholder value if the value is 
    null, undefined, an empty array or an empty string.  See also notNull().
    
    @param fromPath {String} from path or null
    @param placeholder {Object} optional placeholder.
    @returns {SC.Binding} this
  */
  notEmpty: function(fromPath, placeholder) {
    if (placeholder === undefined) placeholder = SC.EMPTY_PLACEHOLDER ;
    return this.from(fromPath).transform(function(value, isForward) {
      if ((value === null) || (value === undefined) || (value === '') || (SC.isArray(value) && value.length === 0)) {
        value = placeholder ;
      }
      return value ;
    }) ;
  },
  
  /**
    Adds a transform that will return the placeholder value if the value is
    null.  Otherwise it will passthrough untouched.  See also notEmpty().
    
    @param fromPath {String} from path or null
    @param placeholder {Object} optional placeholder;
    @returns {SC.Binding} this
  */
  notNull: function(fromPath, placeholder) {
    if (placeholder === undefined) placeholder = SC.EMPTY_PLACEHOLDER ;
    return this.from(fromPath).transform(function(value, isForward) {
      if ((value === null) || (value === undefined)) value = placeholder ;
      return value ;
    }) ;
  },

  /** 
    Adds a transform that will convert the passed value to an array.  If 
    the value is null or undefined, it will be converted to an empty array.

    @param fromPath {String} optional from path
    @returns {SC.Binding} this
  */
  multiple: function(fromPath) {
    return this.from(fromPath).transform(function(value) {
      if (!SC.isArray(value)) value = (value == null) ? [] : [value] ;
      return value ;
    }) ;
  },
  
  /**
    Adds a transform to convert the value to a bool value.  If the value is
    an array it will return YES if array is not empty.  If the value is a string
    it will return YES if the string is not empty.
  
    @param fromPath {String} optional from path
    @returns {SC.Binding} this
  */
  bool: function(fromPath) {
    return this.from(fromPath).transform(function(v) {
      var t = $type(v) ;
      if (t === T_ERROR) return v ;
      return (t == T_ARRAY) ? (v.length > 0) : (v === '') ? NO : !!v ;
    }) ;
  },
  
  /**
    Adds a transform to convert the value to the inverse of a bool value.  This
    uses the same transform as bool() but inverts it.
    
    @param fromPath {String} optional from path
    @returns {SC.Binding} this
  */
  not: function(fromPath) {
    return this.from(fromPath).transform(function(v) {
      var t = $type(v) ;
      if (t === T_ERROR) return v ;
      return !((t == T_ARRAY) ? (v.length > 0) : (v === '') ? NO : !!v) ;
    }) ;
  },
  
  /**
    Adds a transform that will return YES if the value is null, NO otherwise.
    
    @returns {SC.Binding} this
  */
  isNull: function(fromPath) {
    return this.from(fromPath).transform(function(v) { 
      var t = $type(v) ;
      return (t === T_ERROR) ? v : v == null ;
    });
  }  
} ;

// ......................................
// DEPRECATED
//
// The transforms below are deprecated but still available for backwards 
// compatibility.  Instead of using these methods, however, you should use
// the helpers.  For example, where before you would have done:
//
//  contentBinding: SC.Binding.Single('MyApp.myController.count') ;
//
// you should do:
//
//  contentBinding. SC.Binding.from('MyApp.myController.count').single();
//
// and for defaults:
//
//  contentBindingDefault: SC.Binding.single()
//
SC.Binding.From = SC.Binding.NoChange = SC.Binding.builder();

SC.Binding.Single = SC.Binding.single().builder() ;
SC.Binding.SingleNull = SC.Binding.single(null).builder() ;
SC.Binding.SingleNoError = SC.Binding.Single.beget().noError().builder() ;
SC.Binding.SingleNullNoError = SC.Binding.SingleNull.beget().noError().builder() ;
SC.Binding.Multiple = SC.Binding.multiple().builder() ;
SC.Binding.MultipleNoError = SC.Binding.multiple().noError().builder() ;

SC.Binding.Bool = SC.Binding.bool().builder() ;
SC.Binding.Not = SC.Binding.bool().not().builder() ;
SC.Binding.NotNull = SC.Binding.isNull().not().builder() ;
SC.Binding.IsNull = SC.Binding.isNull().builder() ;

// No Error versions.
SC.Binding.BoolNoError = SC.Binding.Bool.beget().noError().builder();
SC.Binding.NotNullNoError = SC.Binding.NotNull.beget().noError().builder();
SC.Binding.NotNoError = SC.Binding.Not.beget().noError().builder();
SC.Binding.IsNullNoError = SC.Binding.IsNull.beget().noError().builder() ;

