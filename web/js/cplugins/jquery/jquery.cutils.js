/*
 * jquery.cutils.js
 *
 * jQuery Continum Utils plugins - v1.0
 * http://continuum.cl/
 *
 * Copyright (c) 2009 Continuum
 *
 */

var IE_6 = false;
var IE_7 = false;
var IE_8 = false; 

if ($.browser.msie) {
	if (Number($.browser.version) == 6) {
		IE_6 = true;
	} else if (Number($.browser.version) == 7) {
		IE_7 = true;
	} else if (Number($.browser.version) == 8) {
		IE_8 = true;
	}
}

(function ($) {
	
	// default regular expression, for empty values
	var defaultExp = /^[^\s+](\S|\s)*$/;
	var defaultClass = "ui-state-error";
	var defaultErrText = "Valor inv&aacute;lido";
	
	/**
	 * return true if all jquery objects are valids !
	 * false in other cases
	 */
	$.fn.validate = function (options) {
		// for each object selected
		var valid = true;
		this.each(function (index, item) {
			// if dosent match the reg expression defined in title
			var item = $(item);
			
			var regexp = options && options.regexp;
			var clazz = options && options.clazz;
			var errorText = options && options.errorText;
			
			if (!item.val() && !item.val().match(regexp || item.attr('title') || defaultExp)) {
				// wrong, add error class
				item.addClass(clazz || defaultClass);
				item.val(errorText || defaultErrText);
				item.keypress(function () {
					item.removeClass(clazz || defaultClass);
				});
				valid = false;
			} else {
				item.removeClass(clazz || defaultClass);
			};
		});
		return valid;
	};
	
	/**
	 * Valida que el titulo sea distinto del valor del elemento.
	 * Complementa el uso de $.hint()
	 * @see $.hint();
	 * @return true: si es distinto, false: si son iguales.
	 */
	$.fn.validoHint = function () {
		return $(this).val() !== $(this).attr('title');
	}
	
	/**
	 * Agrega el titulo del elemento al valor cuando el valor es vacio, generalmente se usa para entregar informacion en campos de textos.
	 * @example $('<input type="text" name="rut" title="Ingrese su rut" >').hint();
	 * @return object jquery
	 */
	$.fn.hint = function () {
	  return this.each(function () {
	    // get jQuery version of 'this'
	    var t = $(this); 
	    
	    var nohint = t.attr('nohint');
	    
	    if (nohint == undefined || nohint == '') {
	    
		    // get it once since it won't change
		    var title = t.attr('title');
		    
		    // only apply logic if the element has the attribute
		    if (title) {
		    	
		      // on blur, set value to title attr if text is blank
		      t.blur(function (){
		        if (t.val() == '') {
		          t.val(title);
		          t.addClass('blur');
		        } else {
		            if (t.validoHint()) t.removeClass('blur');
		        }
		      });
		     
		      // on focus, set value to blank if current value 
		      // matches title attr
		      t.focus(function (){
		    	
		    	  if (t.hasClass('input-text-requerido')) {
		    		  t.removeClass('input-text-requerido');
		    	  }
		    	  
		    	  if (t.val() == title) {
		    		  t.val('');
		    		  t.removeClass('blur');
		    	  }
		      });
	
		      // clear the pre-defined text when form is submitted
		      t.parents('form:first').submit(function() {
		          if (t.val() == title) {
		              t.val('');
		              t.removeClass('blur');
		          }
		      });
	
		      // now change all inputs to title
		      t.blur();
		    }
	  	}
	    
	  });
	};
	
	
	$.fn.nohint = function () {
		  return this.each(function () {
		    // get jQuery version of 'this'
		    var t = $(this); 
		    t.attr('nohint',true);
		  });
		};
		
	
	
	/**
	 * Extiende Jquery, agrega la funcion setVal.
	 * Establece el valor a un elemento html (inputs, textarea).
	 * @param valor - valor {string} o {number} que se desea establecer.
	 */
	$.fn.extend({
		setVal: function (value) {
			return this.val(value).hint();
		}
	});
	
	/**
		Extiende Jquery, agrega la funcion getVal.
		Obtiene el value de un elemento y si este es undefined se retorna un valor default
	*/
	$.fn.extend({
		getVal: function (defaultValue) {
		
			var el = $(this);
			var v = el.val();
			
			if (v == undefined || v === '') {
				return (defaultValue) ? defaultValue : v;
			} else {
				
				var l = el.attr('maxlength');

				if (l) {
					var length = parseInt(l);
					if (length >= 0 && v.length > length) {
						return v.substring(0,length);
					} else {
						return v;
					}
				} else {					
					return v;
				}
			}
		}
	});
	
	/**
	Extiende Jquery, agrega la funcion getJsonVal.
	Obtiene el value de un elemento y si este es undefined se retorna un valor default
	*/
	$.fn.extend({
		setJsonVal: function (value) {
		
			var type = this.attr('type');
			
			if (type === 'text' || type === 'password' || type === 'textarea'){
	
				return this.val(value).hint();
				
			} else if (type === 'checkbox') {
				
				return this.attr('checked', value);
				
			} else if (type === 'select-one') {
	
				var el = $(this);
				el.find('option').each(function(index, item) {
					var item = $(item);
					if (item.val() == value){
						el.attr('selectedIndex',index);
						return false;
					}
				});
				return el;
			}
		}
	});
	
	/**
	Extiende Jquery, agrega la funcion getJsonVal.
	Obtiene el value de un elemento y si este es undefined se retorna un valor default
	*/
	$.fn.extend({
		getJsonVal: function (defaultValue) {
		
			var v = this.val();
			var type = this.attr('type');
			
			if (type === 'text' || type === 'password' || type === 'textarea'){
	
				if (v == undefined || v === '') {
					return (defaultValue) ? defaultValue : v;
				} else {
					
					var l = this.attr('maxlength');
		
					if (l) {
						var length = parseInt(l);
						if (length >= 0 && v.length > length) {
							return v.substring(0,length);
						} else {
							return v;
						}
					} else {					
						return v;
					}
				}
				
			} else if (type === 'checkbox') {
				
				return this.attr('checked');
				
			} else if (type === 'select-one') {
	
				return v;
			}
		}
	});
	
	// util function to know if a element is empty
	$.isEmpty = function (obj) {
		// return true if the obj.val() is not null (it mean is empty)
		return obj.val ? !obj.val().match(/\S+/) : !obj.match(/\S+/);
	};
	
	// util function to know if a element is not empty
	$.notEmpty = function (obj) {
		// return true if the obj.val() is not empty
		return !$.isEmpty(obj);
	};
	
	/**
	 * 
	 */
	$.removeAllDialog = function() {
		$('.ui-dialog').remove();
	}

	/**
	 * 
	 */
	$.fn.closeDialog = function() {
		var d = $(this).dialog('close');
		$.removeAllDialog();
		$.closeAllAjaxMsg();
		return d; 
	}

	/**
	 * 
	 */
	$.fn.destroyDialog = function() {
		var d = $(this).dialog('destroy');
		$.removeAllDialog();
		$.closeAllAjaxMsg();
		return d.remove(); 
	}
	
	// ajax message
	$.ajaxMsg = function (opt) {
		var opt = opt || {};
		opt.id = opt.id || "ajax-msg";
		opt.callback = (typeof opt.callback === 'function') ? opt.callback : function (msg) {msg.remove();}
		opt.containerId = opt.containerId ? '#' + opt.containerId : 'body';
		// the ajax message (jQuery object)
		var m = '<div class="ajax-msg"><p align="center"><img src="img/wait30trans.gif"></p><p align="center">' + opt.msg + '</p></div>';
		var msg = $(m).dialog({
				modal: true, 
				dialogClass: 'ajax-msg', 
				resizable: false, 
				dragable: true, 
				zIndex: 10000, 
				close: function() { 
					$(this).remove(); 
				}
		});
		opt.callback(msg);
	};
	
	// close (removing from html) all the ajax messages
	$.closeAllAjaxMsg = function () {
		$('.ajax-msg').remove();
	};
	
	// alert msg
	$.alert = function (msg, callback) {
		
		$('<div id="global-warning" class="ui-widget ui-alert" style="padding-top:10px;"><div class="ui-state-error ui-corner-all"><p>'+ msg +' </p></div></div>').dialog({
			title: "Informaci&oacute;n",
			modal: true,
			zIndex: 10000, 
			close: function() { 
				$(this).remove(); 
			},
			buttons: {
				Aceptar: function () {
					if (callback && (typeof callback === 'function')) {
						callback();
					}
					$(this).dialog('close');
				}
			}
		});		
	};
	
	
	// error msg
	$.error = function (msg, block, callback) {
		if (block) {
			$('<div id="global-error" class="ui-widget ui-alert" style="padding-top:10px;"><div class="ui-state-error ui-corner-all"><p>Alerta: '+
					(msg || 'Error indeterminado, mirar los logs') +' </p></div></div>').dialog({
				title: "Error",
				modal: true,
				zIndex: 10000, 
				close: function() { 
					$(this).remove(); 
				}
			});
		} else {
			$('<div id="global-error" class="ui-widget ui-alert" style="padding-top:10px;"><div class="ui-state-error ui-corner-all"><p>Alerta: '+
					(msg || 'Error indeterminado, mirar los logs') +' </p></div></div>').dialog({
				title: "Error",
				modal: true,
				zIndex: 10000, 
				close: function() { 
					$(this).remove(); 
				},
				buttons: {
					'Aceptar': function () {
						if (callback && (typeof callback === 'function')) {
							callback();
						}
						$(this).dialog('close');
					}
				}
			});		
		}
	};
	
	/**
	 * Muestra un mensaje de confirmacion. 
	 * @param msg
	 * @param callback
	 * @return
	 */
	$.confirm = function(msg, callbackok, callbackcancelar) {
		$('<div title="Atenci&oacute;n"></div>').html(msg).dialog({
			bgiframe: true,
			modal: true,
			zIndex: 10000, 
			close: function() { 
				$(this).remove(); 
			},
			buttons: {
				'Aceptar': function (event) {
					$(this).dialog('close');
					if (callbackok) {
						callbackok();
					}
				},
				'Cancelar': function (event) {
					$(this).dialog('close');
					if (callbackcancelar) {
						callbackcancelar();
					}
				}
			},
			overlay: {
				backgroundColor: '#000',
				opacity: 0.5
			},
			resizable: false
		}).dialog('open');		
	}
	
	/**
	 * 
	 */
	$.ajaxMsgGetJSON = function(mensaje, url, datos, fcallback) {
			
		$.ajaxMsg({
			msg: mensaje,
			callback: function (msg) {

				$(msg).ajaxError(function(event, request, settings){
					$(this).dialog('close');
					$.error("<br/>Error indeterminado. <br/>Cont&aacute;ctese con su administrador",false);
				});
				$.getJSON(url, datos, function (json, responseText) {
					msg.dialog('close');
					if (fcallback) {
						fcallback(json, responseText, msg);
					}
				});

			}
		});
	}
	
	$.ajaxMsgPostJSON = function(mensaje, url, datos, fcallback) {
		
		$.ajaxMsg({
			msg: mensaje,
			callback: function (msg) {
		   
				$.post(url, datos, function (json, responseText) {
					msg.dialog('close');
					if (fcallback) {
						fcallback(json, responseText, msg);
					}
				},'json');
			
			}
		});
	}
	
	// plugin for interval
	$.fn.onInterval = function (options) {
		// for each JQuery object found it (returning the objects for method chaining)
		return this.each(function () {
			// default options
			var opt = {
				event : 'keyup',
				interval: 5000,
				charNum: 1, // the number of character begore trigger the function
				callback: function () {}, // empty
				doNotExecOnRegexp: undefined, // if test regExp === true, then do not execute (against value)
				onlyExecOnRegexp: undefined // only execute callback if match with this RegExp				
			};
			// override the options (other options are ignored)
			opt = $.extend(opt, options);
			// declare interval counter for use with this one JQuery object
			var intervalForKeyPress = undefined;
			// bind to the event
			$(this).bind(opt.event, function (ev) {
				// get jQuery target object
				var target = $(this);
				// kill the interval created before
				clearInterval(intervalForKeyPress);
				var execute = true;
				if (opt.onlyExecOnRegexp) execute = opt.onlyExecOnRegexp.test(target.attr('value'));
				if (opt.doNotExecOnRegexp) execute = !opt.doNotExecOnRegexp.test(target.attr('value'));
		
				// if execute then create the interval
				if (execute && target.val() && target.val().length >= opt.charNum) {
					// var objCopy = $.extend({}, target);
					var val = target.val();
					intervalForKeyPress = window.setInterval(function () {
						if (typeof opt.callback === 'function') {
							opt.callback(val, ev);
						}
						clearInterval(intervalForKeyPress);
					}, opt.interval);
				}
			});
		});
	};
	
	/**
	 * 
	 */
	$.fn.onIntervalDefaultSearch = function (options) {
		return $(this).onInterval({
			event: 'keyup',
			interval: options && options.interval || 2000,
			callback: function (value, ev) {
				if (options && options.callback) {
					options.callback();
				}
			},
			doNotExecOnRegexp: /^$(this).attr('title')$/
		}).keypress(function (e){
			if (e.which == 13 && e.target.value === '') {
				if (options && options.callback) {
					options.callback();
				}
			}
		});
	}
	
	/**
	 * extencion de la funcion load de jquery.
	 */
	$.fn.loading = function(url, parametros, callback) {
		
		var msg = $('<div><p align="center"><img src="img/wait30trans.gif"></p><p align="center">Cargando...</p></div>');
		
		var div = $(this); 
		
		div.empty().append(msg).load(url, parametros,  function(responseText, textStatus, XMLHttpRequest) {
			
			if (callback && callback.success && callback.failure){
				if (XMLHttpRequest.readyState === 4){
					if (XMLHttpRequest.status === 200) {
						if (callback && callback.success){
							callback.success(responseText, textStatus, XMLHttpRequest);
						}
					} else {
						if (callback && callback.failure){
							callback.failure(responseText, textStatus, XMLHttpRequest);
						}
					}
				} 
			} else if (callback){
				callback(responseText, textStatus, XMLHttpRequest);
			}
		});
		
		return div;
	}
	
	/**
	 * 
	 */
	$.fn.ajaxMsgLoad = function(mensaje, url, parametros, callback) {
		
		var div = $(this);
		
		$.ajaxMsg({
			msg: mensaje,
			callback: function (msg) {
			
				div.load(url, parametros, function(responseText, textStatus, XMLHttpRequest) {
					
					msg.dialog('close');
					
					if (callback && callback.success && callback.failure){
						if (XMLHttpRequest.readyState === 4){
							if (XMLHttpRequest.status === 200) {
								if (callback && callback.success){
									callback.success(responseText, textStatus, XMLHttpRequest, msg);
								}
							} else {
								if (callback && callback.failure){
									callback.failure(responseText, textStatus, XMLHttpRequest, msg);
								}
							}
						} 
					} else if (callback){
						callback(responseText, textStatus, XMLHttpRequest, msg);
					}
				});
			}
		});
		
		return div;
	}
	
	/**
	 * extencion de la funcion load de jquery.
	 */
	$.fn.showLoading = function(options) {
		
		var opt = {
			align : 'left',
			widthImg: 'auto',
			text: 'Cargando...'
		};
		
		// override the options (other options are ignored)
		opt = $.extend(opt, options); 
		 
		var msg = $('<div><p align="#align#"><img src="img/wait30trans.gif" width="#widthImg#">&nbsp;#text#</p></div>'.populate(opt));
		return $(this).empty().append(msg);
	}
	
	/**
	 * agrega validacion por numeros
	 */
	jQuery.fn.keyValidateByClass = function () {
		var t = $(this);
		if (t.hasClass('.number')) {
			t.keypress(function (event){
				
				var otrosKeys = [0,8];
				
				if (t.hasClass('.decimal')) {
					otrosKeys.push(46);
				}
				
				if (t.hasClass('.negative')) {
					otrosKeys.push(45);
				}
				
				if (t.hasClass('.filtro')) {
					otrosKeys.push(37);
				}

				if(jQuery.inArray(event.which, otrosKeys) == -1 && (event.which < 48 || event.which > 57) || event.which == 13) {
					event.preventDefault();
				    return false;
				}
			});
			
		} else if (t.hasClass('.phone')) {
			t.keypress(function (event){
				
				var otrosKeys = [0,8,45];
				
				if (t.hasClass('.filtro')) {
					otrosKeys.push(37);
				}

				if(jQuery.inArray(event.which, otrosKeys) == -1 && (event.which < 48 || event.which > 57) || event.which == 13) {
					event.preventDefault();
				    return false;
				}
			});	
			
		} else if (t.hasClass('.text')) {
			t.keypress(function (event){

				var otrosKeys = [13];

				if(jQuery.inArray(event.which, otrosKeys) != -1) {
					event.preventDefault();
				    return false;
				}
			});
		}
		
		return t;
	}

	/**
	 * agrega validacion por numeros
	 */
	jQuery.fn.keyValidateByClassForm = function () {
		
		$(':input', $(this)).each(function (i, e){
			$(e).keyValidateByClass();
		});

		return $(this);
	}

	/**
	 * Asumiendo que el form "myform" tiene 2 input text con los id(nombre, rut)
	 * 
	 * var datos : {nombre: 'pepe', rut: 10029292};
	 * 
	 * $('form#myform').poblateForm(datos);
	 * 
	 */
	jQuery.fn.poblateForm = function (source) {
		for (var attr in source) {
			var dest = $(this).find('#' + attr);
			if (dest){
				var valor = source[attr];
				if (dest.hasClass('.number')) {
					dest.val(valor || dest.attr('defaultValue') || 0);
				} else {
					dest.val(valor || dest.attr('defaultValue') || '');
				}
			}
		}
		return $(this);
	}
	
	/////////////////////////////////////////////////////
	// utilidades de GUI
	////////////////////////////////////////////////////

	/**
	 * return the absolute left position of the element
	 * @param objectId
	 * @return
	 */
	function getAbsoluteLeft(objectId) {
		// Get an object left position from the upper left viewport corner
		var o = document.getElementById(objectId);
		var oLeft = o.offsetLeft;            // Get left position from the parent object
		while (o.offsetParent != null) {   // Parse the parent hierarchy up to the document element
			var oParent = o.offsetParent;    // Get parent object reference
			oLeft += oParent.offsetLeft; // Add parent left position
			o = oParent;
		}
		return oLeft;
	}

	/**
	 * return the absolute top position
	 * @param objectId
	 * @return
	 */
	function getAbsoluteTop(objectId) {
		// Get an object top position from the upper left viewport corner
		var o = document.getElementById(objectId);
		var oTop = o.offsetTop;           // Get top position from the parent object
		while (o.offsetParent != null) { // Parse the parent hierarchy up to the document element
			var oParent = o.offsetParent;  // Get parent object reference
			oTop += oParent.offsetTop; // Add parent top position
			o = oParent;
		}
		return oTop;
	}

	/**
	 * muestra un div sobre un elemento.
	 */
	jQuery.fn.showOverElement = function (element_id, x, y) {
		
		var clickElementy = getAbsoluteTop(element_id); //set y position
		var clickElementx = getAbsoluteLeft(element_id);//set x position

		if(x){
			clickElementx+=x;
		}
		if(y){
			clickElementy+=y;
		}
		return $(this).css({left: clickElementx + "px", top: clickElementy + "px"});
	}

	/**
	 * muestra/oculta el cuerpo del acordion.
	 * $('#divAcordion').setVisible(true); 		//muestra el cuerpo del acordion
	 * $('#divAcordion').setVisible(false); 	//oculta el cuerpo del acordion
	 */
	jQuery.fn.setVisible = function (visible,callback) {
		
		if ($(this).attr('visible') == undefined) {
			$(this).attr('visible','true');
			$(this).bind("accordionchange", function(event,ui) {
				if (ui.newContent[0] != undefined) {
					$(this).attr('visible','true');
				} else {
					$(this).attr('visible','false');
				}
			});
		}
		
		var tvisible = $(this).attr('visible').toString();

		if ((visible && tvisible === 'false') ||  (!visible && tvisible === 'true')) {
			if(callback){
				callback();
			}
			$(this).accordion("activate", 0);
		}
		return $(this);
	}
	
	/**
	 * valida un formulario
	 */
	jQuery.fn.validateForm = function (fok, ferror) {

		var formValido = true;
		var errores = $('<p>Se encontraron los siguientes errores:<br><br>');
		var addMsgCamposIObligatorios = false;
		var addMsgEmailInvalido = false;
		var addMsgTelefonoInvalido = false;

		var form = $(this);
		var idForm = form.attr('id');
		var excludeValidate = 'exclude-from-validate-' + idForm;
			
		$(':input', form).each(function(i,e) {
			
			var el = $(this);

			//if ( !(el.hasClass('exclude-validate') && el.hasClass(idForm)) ) {
			
			if (!el.hasClass(excludeValidate)) {
				var type = el.attr('type');
				
				if (type === 'text' || type === 'password' || type === 'textarea'){
	
					var valor = el.val();
					var ok = true;
					
					var requerido = el.hasClass('required');
					
					if (requerido) {
						ok = !(el.val() === el.attr('title') || el.val() === '');
						if (!ok && !addMsgCamposIObligatorios) {
							errores.append('Ingrese campos obligatorios<br>');
							addMsgCamposIObligatorios = true;
						}
					} 
					
					if (ok && el.hasClass('mail')) {
						valor = valor.trim();
						el.setVal(valor);
						
						var regx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
						ok = regx.test(valor);
						
						if (!ok && !addMsgEmailInvalido) {
							errores.append('Ingrese e-mail v&aacute;lido<br>');
							addMsgEmailInvalido = true;
						}	
					}
	
					if (ok && el.hasClass('phone')) {
						valor = valor.trim();
						el.setVal(valor);
						
						var regx = /^\d{2}-\d{1,20}$/;
						ok = regx.test(valor);
						
						if (!ok && !addMsgTelefonoInvalido) {
							errores.append('Ingrese valor telefonico v&aacute;lido<br>');
							addMsgTelefonoInvalido = true;
						}
					}
					
					if (ok && el.hasClass('number')) {
						valor = valor.trim();
						el.setVal(valor);
						ok = !isNaN(el.val());
						if (!ok) {
							errores.append('Ingrese valor num&eacute;rico v&aacute;lido<br>');
						}
					}
	
					if (ok) {
						el.css(css_input_ok);
					} else {
						el.css(css_input_error);
						formValido = false;
					}
								
				} else if (type === 'checkbox') {
					if (el.hasClass('required')) {
						formValido = el.attr('checked');
					}
				} else if (type === 'select-one') {
	
					var ok = true;
					
					if (el.hasClass('required') && el[0].selectedIndex < 0) {
						if (!addMsgCamposIObligatorios) {
							errores.append('Ingrese campos obligatorios<br>');
							addMsgCamposIObligatorios = true;
						}
						ok = false;
					} else {
	
						var valorOpt = el.find('.value-on-validate').val();
	
						if (valorOpt && valorOpt.toString() === el.val().toString()) {
							if (!addMsgCamposIObligatorios) {
								errores.append('Ingrese campos obligatorios<br>');
								addMsgCamposIObligatorios = true;
							}
							ok = false;
						}
					}
					
					if (ok) {
						el.css(css_input_ok);
					} else {
						el.css(css_input_error);
						formValido = false;
					}
				}
			
			} else {
				//console.info('exclude',el);
			}	
		});

		if (formValido){
			if (fok) {
				fok($(this));
			}
		} else {
			if (ferror) {
				ferror(errores.html());
			}
		}
		
		return formValido;
	}

	/**
	 * valida un field
	 */
	jQuery.fn.validateField = function (fok, ferror) {
		
		var formValido = true;
		
		var el = $(this);
		var type = el.attr('type');
		var valor = undefined;
		var errores = $('<p>Se encontraron los siguientes errores:<br><br>');

		if (type === 'text' || type === 'password' || type === 'textarea' || type === 'hidden'){
			
			valor = el.val();
			
			if (el.hasClass('required')) {
				formValido = !(valor === el.attr('title') || valor === '');
				if (!formValido ) {
					errores.append('Ingrese campos obligatorios<br>');
				}
			} 
			
			if (formValido && el.hasClass('mail')) {
				valor = valor.trim();
				el.setVal(valor);
				var regx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
				formValido = regx.test(el.val());
				if (!formValido ) {
					errores.append('Ingrese e-mail v&aacute;lido<br>');
				}
			}
			
			if (formValido && el.hasClass('phone')) {
				valor = valor.trim();
				el.setVal(valor);
				var regx = /^\d{2}-\d{1,20}$/;
				formValido = regx.test(valor);
				if (!formValido) {
					errores.append('Ingrese valor telefonico v&aacute;lido<br>');
				}
			}
			
			if (formValido && el.hasClass('number')) {
				valor = valor.trim();
				el.setVal(valor);
				formValido = !isNaN(el.val());
				if (!formValido) {
					errores.append('Ingrese valor num&eacute;rico v&aacute;lido<br>');
				}
			}

			if (formValido) {
				el.css(css_input_ok);
			} else {
				el.css(css_input_error);
			}
			
		} else if (type === 'radio') {
			valor = el.val(); 
		} else if (type === 'checkbox') {
			valor = el.attr('checked');
			if (el.hasClass('required')) {
				formValido = valor;
			}
		} else if (type === 'select-one') {
			
			valor = el.val(); 
			
			if (el.hasClass('required') && el[0].selectedIndex < 0) {
				errores.append('Ingrese campos obligatorios<br>');
				formValido = false;
			} else {
				
				var valorOpt = el.find('.value-on-validate').val();

				if (valorOpt && valorOpt.toString() === valor.toString()) {
					errores.append('Ingrese campos obligatorios<br>');
					formValido = false;
				}
			}
			
			if (formValido) {
				el.css(css_input_ok);
			} else {
				el.css(css_input_error);
			}			
		}

		if (formValido){
			if (fok) {
				fok(valor);
			}
		} else {
			if (ferror) {
				ferror(errores.html());
			}
		}
		
		return formValido;
	}
	
	var css_input_ok = {border:'1px solid #000000'};
	var css_input_error = {border:'1px solid #FF0000'};

	/**
	 * Marca un elemento como valido o invalido.
	 */
	jQuery.fn.markValid = function (valido) {
		
		var el = $(this);
		if (valido) {
			el.css(css_input_ok);
		} else {
			el.css(css_input_error);
		}	
		return el;
	}	
	
	/**
	 * funcion reset para los formularios.
	 * @param options
	 * 				{text: {defaultValue: '', disabled: false}, checkbox: {defaultValue: true, disabled: false}}
	 */
	jQuery.fn.resetForm = function (options) {
		$('form#' + this.attr('id') + ' input').each(function(i,e) {
			if (e.type === 'text' || e.type === 'password' || e.type === 'textarea'){
				if (options && options.text && options.text.disabled != undefined) {
					$(this).attr('disabled', options.text.disabled);
				}
				$(this).setVal(options && options.text && options.text.defaultValue || '').css(css_input_ok);
			} else if (e.type === 'checkbox') {
				if (options && options.checkbox && options.checkbox.disabled != undefined) {
					$(this).attr('disabled', options.checkbox.disabled);
				}
				$(this).attr('checked',options && options.checkbox && options.checkbox.defaultValue || false);
			}
		});
		return $(this);
	}

	/**
	 * Realiza un reset a los valores de los campos de un formulario o componente.
	 * Busca todos los elementos (text, password, textarea y checkbox) y les establece un valor por default
	 * @param {object} valor default puede ser un string o numero
	 * @return jquery
	 */
	jQuery.fn.resetField = function (defaultValue) {
		var el = $(this);
		var type = el.attr('type');
		if (type === 'text' || type === 'password' || type === 'textarea'){
			el.setVal(defaultValue || '').css(css_input_ok);
		} else if (type === 'checkbox') {
			el.attr('checked',defaultValue || false);
		}
		return el;
	}
	
	/**
	 * 
	 */
	$.fn.previewImg = function(opciones) {

		return this.each(function () {
		
			var el = $(this);
			var id = el.attr('id');
			
			var opt_default = {
				width: 200,
				height: 200,
				left: 0,
				top: 0,
				urlImg: el.attr('href'),
				widthImg: 200,
				heightImg: 200,
				scroll: true,
				zIndex: undefined,
				idOver: id
			};
			
			var opt = jQuery.extend(opt_default, opciones);
			var div = $('#previewImg-' + id);
	
			if (!div || !div.attr('id')) {
				var img = opt.urlImg ? ('<a id="previewImg-a-img-' + id + '" href="' + opt.urlImg + '" target="_blank" title="Presione para descargar imagen" >' + 
									   '<img id="previewImg-img-' + id + '"  src="' + opt.urlImg + '"  width="' + opt.widthImg + 'px" height="' + opt.heightImg + 'px" alt="Imagen" onerror="this.src=\'img/noDisponible.jpg\';" /></a>') : '';
				var overflow = opt.scroll ? ' overflow: auto; ' : '';
				var zindex = (opt.zIndex) ? ' z-index:' + opt.zIndex + ';' : '';
				div = $('<DIV id="previewImg-' + id + '" style="' + overflow + zindex + ' display:none; width:' + (opt.width + 30) + 'px; height: ' + (opt.height + 30) + 'px; position: absolute;">' + img + '</DIV>');
	
				$('body').append(div);
//				div.hover(function(){}, function () {
//					div.hide('slow');
//					//$('.preview-img').remove();
//				});
			}
			
			el.hover(function () {
				div.showOverElement(opt.idOver, opt.left, opt.top).fadeIn('slow');
			}, function () {
				div.fadeOut('slow');
			});
			
			return el;
		
		});
	}
	
	/**
	 * comprueba que el array de datos solo contenga numeros
	 * @param array - array de numeros
	 * @return true - contiene solo numeros
	 */
	$.onlyNumbers = function(array) {
		var isNumber = false;
		for ( var i = 0; i < array.length; i++) {
			isNumber = !isNaN(array[i].toString().replace(/\,/,'.'));
		    if (!isNumber) return false;
		}
		return isNumber;
	}
	
	/**
	 * comprueba que el array de datos solo contenga numeros
	 * @param array - array de numeros
	 * @return true - contiene solo numeros
	 */
	$.fixNumbers = function(array) {
		for ( var i = 0; i < array.length; i++) {
			array[i] = Number(array[i].replace(/\,/,'.'));
		}
		return array;
	}
	
	/**
	 * 
	 */
	$.getCheckeds = function(selector) {
		
		if (IE_6 || IE_7) {
		
			return $(selector);
		
		} else {
			selector = selector.replace(/\[checked]/,'').replace(/\[checked=true]/,'');
			
			var array = $([]);
			
			$(selector).each(function(i,e) {
				var el = $(e);
				if (el.attr('checked') === true) {
					array.push(e);
				}
			});
			
			return array;
		}
	}
	
	/**
	 * 
	 */
	$.fn.buildTableGrid = function() {
		
		var div = $(this);
		var id = div.attr('id');
		var head = div.find('.head-grid');

		var td = '';

		head.children().each(function(i, e) {
			var el = $(this);
			var width = el.width();
			var w = Number(width) + 10;
		    var text = el.css('color',el.css('background-color')).css({padding: 0, height: 2}).css('font-size','0em').text();
		    td+='<td class="' + el.attr('class') + '" align="center" style="width: ' + w + 'px;">' + text + '</td>';    
		});

		$('#table-grid-' + id).remove();
		//console.info($(this).css('width'));
		var newDiv = '<div id="table-grid-' + id + '" style="width: ' + div.css('width') + '"><table style="width: ' + div.width() + '"><thead><tr>' + td + '</tr></thead></table></div>';
		div.before(newDiv);
		return div;
	}
	
	/**
	 * agrega validacion de maxlength a un textarea
	 */
	$.fn.addValidateMaxLength = function() {
		
		var el = $(this);
		var l = el.attr('maxlength');
		
		if (l) {
			var length = parseInt(l);
			el.keypress(function (event) {
				
				var isDelete = event.which == 0;
				var isBackSpace = event.which == 8;
				
				if(el.val().length >= length && !isDelete && !isBackSpace){
					event.preventDefault();
				}	
			});
		}
		
		return el;
	}	
	
	/**
	 * genera un numero random entre un minimo y maximo
	 */
	$.numeroRandom = function(min, max) {
		return Math.round((Math.random() * (Number(max) - Number(min))) + Number(min));
	}
	
	/**
	 * Selecciona un <option> dentro de un <select> con el valor ingresado
	 */
	$.fn.selectedValue = function(val) {
		
		var el = $(this);
		el.find('option').each(function(index, item) {
			
			var item = $(item);
			if (item.val() == val){
				el.attr('selectedIndex',index);
				return false;
			}
		});
		return el;
	}	

	/**
	 * retorna el "id" del elemento html
	 */
	$.fn.getId = function() {
		 return $(this).attr('id');
	}
	 
	/**
	 * retorna el "id" del elemento html
	 */
	$.fn.getIdSplit = function(splitValue) {
		 return $(this).attr('id').split(splitValue);
	} 
	
	/**
	 * retorna el "title" del elemento html
	 */
	$.fn.getTitle = function() {
		return $(this).attr('title');
	}
	
	 /**
	  * establece el "title" del elemento html
	  */
	$.fn.setTitle = function(title) {
		var el = $(this); 
		el.attr('title', title);
		return el;
	}
	
	/**
	 * retorna el "name" del elemento html
	 */
	$.fn.getName = function() {
		return $(this).attr('name');
	}
	 
	/**
	 * establece el "name" del elemento html
	 */ 
	$.fn.setName = function(name) {
		var el = $(this); 
		el.attr('name', name);
		return el;
	} 
	 
	/**
	 * retorna el "name" del elemento html
	 */
	$.fn.isChecked = function() {
		return $(this).attr('checked');
	}
	
	/**
	 * establece el "checked" del elemento html
	 */
	$.fn.setChecked = function(checked) {
		var el = $(this); 
		el.attr('checked', checked);
		return el;
	}	 
	
})(jQuery)