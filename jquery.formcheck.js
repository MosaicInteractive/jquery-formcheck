/*
	Author: Scott Kyle
	License: MIT-Style
	Version: 0.4
*/

(function($) {
	
	// METHODS
	
	$.fn.extend({
		
		trim : function() {
			this.find('*').andSelf().filter('input:text, textarea').each(function() {
				this.value = $.trim(this.value);
			});
			return this;
		},
		
		placeholder : function() {
			var args = arguments;
			this.find('*').andSelf().filter('input:text, textarea').each(function(i) {
				var val = args[i] || this.defaultValue;
				
				$(this).addClass('placeholder').focus(function() {
					if ($.trim(this.value) == val) $(this).removeClass('placeholder').val('');;
				}).blur(function() {
					if ($.trim(this.value) == '') $(this).addClass('placeholder').val(val);
				});
			});
			return this;
		},
		
		reset : function() {
			this.filter('form').each(function() { this.reset(); });
			this.filter('input, textarea').each(function() { this.value = this.defaultValue; });
			return this;
		},
		
		addRules : function() {
			var args = $.makeArray(arguments);
			return this.addClass('validate[' + args.join(',') + ']');
		}
	});
	
	// CLASSES
	
	$.extend({
		
		// many pieces inspired and taken from MooTools plugin, FormCheck - http://mootools.floor.ch/en/labs/formcheck
		FormCheck : function(form, options) {
			var self = this;
			var $form = $(form);
			
			// check to be sure the form is a form
			if ($form.size() != 1 || !$form.is('form')) return null;
			
			options = $.extend(true, {
				ajax : {},
				rules : null,
				tipsClass : 'fc-tbx',				//tips error class
      	errorClass : 'fc-error',			//div error class
				invalidClass : 'invalid',
				limitClass : 'full',
				spinnerClass : 'spinner',
				messageClass : 'message',
				placeholders : true,
				checkOnBlur : false,
				onError : function() {},
				display : {
				  showErrors : 0,
				  titlesInsteadNames : 0,
				  errorsLocation : 1,
    			indicateErrors : 1,
    			indicateErrorsInit : 0,
          scrollToFirst : false,
          scrollDuration : 400,
          scrollOffset : -7,
          listErrorsAtTop : true,
          scrollToMessage : true,
          keepFocusOnError : 0,
    			checkValueIfEmpty : 1,
    			addClassErrorToField : 0,
    			removeClassErrorOnTipClosure : 0,
    			replaceTipsEffect : 1,
    			flashTips : 0,
    			closeTipsButton : 1,
    			tipsPosition : "right",
    			tipsOffsetX : -45,
    			tipsOffsetY : 0,
    			fadeDuration : 300
        },
        alerts : {
    			required : "This field is required.",
    			alpha : "This field accepts alphabetic characters only.",
    			alphanum : "This field accepts alphanumeric characters only.",
    			nodigit : "No digits are accepted.",
    			digit : "Please enter a valid integer.",
    			digitltd : "The value must be between %0 and %1",
    			number : "Please enter a valid number.",
    			email : "Please enter a valid email.",
    			image : 'This field should only contain image types',
    			phone : "Please enter a valid phone.",
    			phone_inter : "Please enter a valid international phone number.",
    			url : "Please enter a valid url.",

    			confirm : "This field is different from %0",
    			differs : "This value must be different of %0",
    			length_str : "The length is incorrect, it must be between %0 and %1",
    			length_fix : "The length is incorrect, it must be exactly %0 characters",
    			lengthmax : "The length is incorrect, it must be at max %0",
    			lengthmin : "The length is incorrect, it must be at least %0",
    			words_min : "This field must concain at least %0 words, currently: %1 words",
    			words_range : "This field must contain %0-%1 words, currently: %2 words",
    			words_max : "This field must contain at max %0 words, currently: %1 words",
    			checkbox : "Please check the box",
    			checkboxes_group : 'Please check at least %0 box(es)',
    			radios : "Please select a radio",
    			select : "Please choose a value",
    			select_multiple : "Please choose at least one value"
    		},
				messages : {
					invalid : 'Please complete the form',
					error : 'Sorry, please try again'
				},
				validators : {
					alpha : /^[a-z ._-]+$/i,
					alphanum : /^[a-z0-9 ._-]+$/i,
					name : /^[a-z -'.]+$/i,
					digit : /^[-+]?[0-9]+$/,
					nodigit : /^[^0-9]+$/,
					number : /^[-+]?\d*\.?\d+$/,
					email : /^[a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i,
					emails : /^([a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,4}(\s*,\s*|\s+|$))+$/i,
					phone : /^[\d\s ().-]+$/,
					url : /^(http|https|ftp)\:\/\/[a-z0-9\-\.]+\.[a-z]{2,3}(:[a-z0-9]*)?\/?([a-z0-9\-\._\?\,\'\/\\\+&amp;%\$#\=~])*$/i,
					ssn : /^\d{3}-\d{2}-\d{4}$/,
					length : function(val, min, max) {
					  var valid = false;
					  var message = options.alerts.length_str.replace("%0", min).replace("%1", max);
					  if (!max){
					    valid = ( val.length == min );
					    message = options.alerts.lengthmin.replace("%0", min);
						}else if (max < 0){
						  valid = ( val.length >= min );
						  message = options.alerts.lengthmax.replace("%0", max);
						}else{
						  valid = ( val.length >= min && val.length <= max );
						}
						addMessageToElement( this, message);
					  return valid;
					},
					date : function(val, format) {
						format = (format || 'm-d-yyyy').toLowerCase().replace(/(m+)/, function() { return '(0' + (RegExp.lastParen.length == 1 ? '?' : '') + '[1-9]|1[0-2])'; })
																	 .replace(/(d+)/, function() { return '(0' + (RegExp.lastParen.length == 1 ? '?' : '') + '[1-9]|[1-2][0-9]|3[0-1])'; })
																	 .replace(/yy(?=yy)/, '(19|20)')
																	 .replace(/yy/, '\\d{2}');
						return new RegExp('^' + format + '$').test(val);
					}
				},
				special : {
					submit : function() {
						this.click(function(event) {
							new $.FixedEvent(event).stop();
							self.submit();
						});
					},
					
					// limit the number of characters allowed in an input
					limit : function(max, counter) {
						var $counter = $(counter ? '#' + counter : []).text(max);
						var $this = this;
						var full = false;
						$this.keypress(function(event) {
							event = new $.FixedEvent(event);
							
							if (this.value.length >= max && !(/left|right|up|down|backspace|delete/.test(event.key)) && !((event.control || event.meta) && event.key == 'x')) {
								$this.addClass(options.limitClass);
								full = true;
								return false;
							}
						}).keyup(function() {
							var left = max - this.value.length;
							if (left > 0 && full) {
								$this.removeClass(options.limitClass);
								full = false;
							}
							$counter.text(left < 0 ? 0 : left);
						});
					}
				}
			}, options);
			
			//internalization
  		if (typeof(options.formcheckLanguage) != 'undefined'){
  		  $.extend( options.alerts, options.formcheckLanguage );
  		}
			
			// find the spinner
			var $spinner = options.spinnerClass ? $form.find('.' + options.spinnerClass).hide() : $([]);
			var $message = options.messageClass ? $form.find('.' + options.messageClass).hide() : $([]);
			
			// reset form and create placeholder text (if any)
			$form.reset();
			if (options.placeholders) $form.placeholder();
						
			// hijack form submission event
			$form.submit(function() {
				self.submit();
				return false;
			});
			
			// create validators
			var inputs = [];
			$form.find('*[class*=validate]').each(function() {
				var match = this.className.match(/validate\[(\S+)\]/);
				if (!match) return;
				
				var $this = $(this);
				var methods = match[1].toLowerCase();
				
				if (methods.length) {
					$this.data('validator', validator($this, methods)).blur(function() {
						if (options.checkOnBlur || $this.hasClass(options.invalidClass)) {
							if (check($this) && options.checkOnBlur)
								options.onError.call(self, $this);
						}
					});
					inputs.push($this);
				}
			});
			
			function addError($obj){
			  //determine position
    		var coord = $obj.target ? $($obj.target).position() : $obj.position();
    		var $el = $obj.data("element");
    		if(!$el && options.display.indicateErrors != 0) {
    		  if (options.display.errorsLocation == 1) {
    		    //var pos = (options.display.tipsPosition == 'left') ? coord.left : coord.left + $($obj.target).outerWidth();
    		    var pos = (options.display.tipsPosition == 'left') ? coord.left : coord.left + $($obj).outerWidth();
    		    var opt_css = {
    					'opacity' : 0,
    					'position' : 'absolute',
    					'float' : 'left',
    					'left' : pos + options.display.tipsOffsetX,
    				};
    		    $el = $('<div class="' + options.tipsClass + '"></div>').css(opt_css).prependTo($('body'));
    		    //this.addPositionEvent(obj);
    		  } else if (options.display.errorsLocation == 2){
    		    $el = $('<div class="' + options.errorClass + '"></div>').css({'opacity' : 0}).before($obj);
    		  } else if (options.display.errorsLocation == 3){
    		    $el = $('<div class="' + options.errorClass + '"></div>').css({'opacity' : 0});
    				if (typeof $obj.group == 'object' || typeof $obj.group == 'collection')
    					$($el).after($obj.group[$obj.group.length-1]);
    				else
    					$($el).after($obj);
    		  }
  		  }
  		  
  		  if ($el && $el != true) {
    			$el.empty();
    			$($el).append('<div class="tip_arrow"></div>');
    			if (options.display.errorsLocation == 1) {
    			  var errors = $obj.data("messages");
    				$(errors).each(function(key, val) {
    					//errors.push("<p>" + error + "</p>");
    					$($el).append("<p>" + val + "</p>")
    					
    					//line ~870
    				});
    				$($el).css('top', coord.top - $el.outerHeight() + options.display.tipsOffsetY);
  			  }else{
  			    //l-880
  			  }
  			  
  			  if (!options.display.fadeDuration || options.display.errorsLocation < 2) {
    				$($el).css('opacity', 1);
    			} else {
    			  
  			  }
  			}
  			
  			$obj.data("element", $el);
			}
			
			function addMessageToElement( el, message ){
			  var messages = el.data("messages");
			  messages.push(message);
			  el.data("messages", messages);
			}
			
			// scroll to first error
			function scrollToElement( el ) {
			  $('html, body').animate({
          scrollTop: $(el).parent().offset().top + options.display.scrollOffset
        }, options.display.scrollDuration );
			}
			
			// return a validation method that should be bound to an input
			function validator($this, methods) {
			  // separate method arguments by semicolons, then make methods into array
				methods = methods.replace(/\[(.*?)\]/g, function(str, args) {
					return '[' + args.replace(/,/g, ';') + ']';
				}).split(',');
				
				// turn each method into a validator against a regexp or function
				methods = $.map(methods, function(method) {
					if (method == 'required')
						return function(val) {
						  if( !val ) addMessageToElement( $this, options.alerts.required);
						  return !!val; 
						};
					
					// get a method name and its arguments
					var matches = method.match(/^(.+?)(\[(.+?)\])?$/);
					method = matches[1];
					var args = matches[3] ? matches[3].split(';') : [];
					
					// turn number arguments into proper numbers
					for (var i = args.length; i--; )
						if (/^[+-]?\d+$/.test(args[i])) args[i] = parseInt(args[i], 10);
					
					// run special methods on input only once
					if (options.special[method]) {
						options.special[method].apply($this, args);
						return null;
					}
					
					method = options.validators[method];
					
					return method ? function(val) {
						if (val) {
							if (method instanceof RegExp)
								return method.test(val);
							else if (method instanceof Function)
								return method.apply($this, [val].concat(args));
						}
						return true;
					} : null;
				});
				
				return function() {
					var val = $.trim(this.val());
					if (val == this[0].defaultValue) val = '';
					
					for (var i = 0, l = methods.length; i < l; i++)
						if (!methods[i](val)) return false;
					
					return true;
				};
			}
			
			// validate an input
			function check($input) {
			  $input.data("messages", [] );
			  
			  var $el = $input.data("element");
        if( $el ){
          $el.css("opacity", 0);
          $el.empty();
        }
        
				var validator = $input.data('validator');
				var valid = validator ? validator.call($input) : true;
				$input[valid ? 'removeClass' : 'addClass'](options.invalidClass);
				
				return valid;
			}
			
			// validation of whole form
			function validate() {
				var $invalid = null;		// the first input to fail
				$.each(inputs, function(i, $input) {
					if (!check($input) && !$invalid) $invalid = $input;
				});
				if ($invalid) {
				  if(options.display.scrollToFirst) scrollToElement( $invalid );
				  if(options.display.scrollToMessage) scrollToElement( $message );
				  $message.text(options.messages.invalid).show();
				  addError($invalid);
					options.onError.call(self, $invalid);
				}
				return !$invalid;
			}
			
			// submit form by ajax
			function submit(data, callback) {
				$spinner.show();
				$message.hide();
				var error = false;
				
				var opts = {
					data : data || self.serialize(),
					url : $form.attr('action') || window.location.toString(),
					type : $form.attr('method') || 'GET',
					complete : function() {
						$spinner.hide();
						if (!error) $message.hide();
					},
					error : function() {
						error = true;
						submitError();
					}
				};
				if (callback) opts.success = callback;
				
				$.ajax($.extend(opts, options.ajax));
			}
			
			// Ajax error
			function submitError(msg) {
				$message.text(msg || options.messages.error).show();
			}

			// public methods
			$.extend(this, {
				reset : function() {
					$form.reset().find('.' + options.invalidClass).removeClass(options.invalidClass);
					return this;
				},
				submit : function(data, callback) {
					if (validate()) submit(data, callback);
					return this;
				},
				submitError : submitError,
				prepare : function() {
					$form.find('input:text, textarea').trim().trigger('focus');		// removes placeholders
					return this;
				},
				inputs : function() {
					return $form[0].elements;
				},
				serialize : function() {
					this.prepare();
					return $form.serialize();
				},
				validate : function() {
					return validate();
				}
			});
			return this;
		},
		
		// Transforms an event into something easier to handle (code mostly taken from MooTools Framework)
		FixedEvent : function(event, win) {
			win = win || window;
			var doc = win.document;
			event = event || win.event;
			var type = event.type;
			var target = event.target || event.srcElement;
			while (target && target.nodeType == 3) target = target.parentNode;
			
			if (/key/.test(type)) {
				var keys = {
					'enter' : 13,
					'up' : 38,
					'down' : 40,
					'left' : 37,
					'right' : 39,
					'esc' : 27,
					'space' : 32,
					'backspace' : 8,
					'tab' : 9,
					'delete' : 46
				};
				var code = event.which || event.keyCode;
				var key;
				for (var k in keys) {
					if (keys[k] == code) {
						key = k;
						break;
					}
				}
				
				if (type == 'keydown') {
					var fKey = code - 111;
					if (fKey > 0 && fKey < 13) key = 'f' + fKey;
				}
				key = key || String.fromCharCode(code).toLowerCase();
			}
			else if (/(click|mouse|menu)/i.test(type)) {
				doc = (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
				var page = {
					x: event.pageX || event.clientX + doc.scrollLeft,
					y: event.pageY || event.clientY + doc.scrollTop
				};
				var client = {
					x: (event.pageX) ? event.pageX - win.pageXOffset : event.clientX,
					y: (event.pageY) ? event.pageY - win.pageYOffset : event.clientY
				};
				if (/DOMMouseScroll|mousewheel/.test(type))
					var wheel = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
				
				var rightClick = (event.which == 3) || (event.button == 2);
			}
			
			return $.extend(this, {
				event : event,
				target : target,
				key : key,
				code : code,
				shift : event.shiftKey,
				control : event.ctrlKey,
				alt : event.altKey,
				meta : event.metaKey,
				page : page,
				client : client,
				wheel: wheel,
				rightClick : rightClick,
				
				stop : function() {
					return this.stopPropagation().preventDefault();
				},
				stopPropagation : function() {
					if (this.event.stopPropagation) this.event.stopPropagation();
					else this.event.cancelBubble = true;
					return this;
				},
				preventDefault : function() {
					if (this.event.preventDefault) this.event.preventDefault();
					else this.event.returnValue = false;
					return this;
				}
			});
		}
	});
})(jQuery);