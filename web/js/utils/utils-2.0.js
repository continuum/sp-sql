
var REGX_NUMERO_TELEFONICO = /^[0-9+-]$/;

/**
 * retorna true si el numero es par
 */
Number.prototype.isPair = function()  { 
   return this % 2 == 0; 
}

/**
 * transforma un date a int en el formato (yyyyMMdd) ej: 20090526
 */
Date.prototype.toIntDate = function() {
	var d = this.getDate().toString();
	if (d.length == 1) {
		d = '0' + d;
	}
	var m = this.getMonth() + 1;
	m = m.toString();
	if (m.length == 1) {
		m = '0' + m;
	}
	return Number(this.getFullYear() + '' + m + '' + d);
}

/**
 * transforma un date a String en el formato (dd/mm/yyyy) ej: 20090526
 */
String.prototype.toFormatDate = function() {
	var s = this;
	var anio = parseInt(s.substring(0,4), 10);
	var mes = parseInt(s.substring(4,6), 10);
	var dia = parseInt(s.substring(6), 10);	
	
	return dia + '/' + mes + '/'+ anio;
}

/**
 * transforma un numero en el formato yyyymmdd ej: (20090526) en un objeto Date.
 */
Number.prototype.toDate = function(format) {
	var s = this.toString();
	return s.toDate(format);
}


/**
 * transforma un string en el formato yyyymmdd ej: (20090526) en un objeto Date.
 */
String.prototype.toDate = function(format) {
	var s = this.toString();
	if (!format) {
		var dia = parseInt(s.substring(0,4), 10);
		var mes = parseInt(s.substring(4,6), 10) - 1;
		var anio = parseInt(s.substring(6), 10);	
		var d = new Date();
		d.setFullYear(anio, mes, dia);
		return d;
	} else { 
		format = format.toLowerCase();
		if (format === 'yyyymmdd'){
			var dia = parseInt(s.substring(0,4), 10);
			var mes = parseInt(s.substring(4,6), 10) - 1;
			var anio = parseInt(s.substring(6), 10);	
			var d = new Date();
			d.setFullYear(anio, mes, dia);
			return d;
		} else if (format === 'dd/mm/yyyy'){
			var partes = s.split('/');
			var dia = parseInt(partes[0], 10);
			var mes = parseInt(partes[1], 10) - 1;
			var anio = parseInt(partes[2], 10);	
			var d = new Date();
			d.setFullYear(anio, mes, dia);
			return d;
		}  else {
			return undefined;
		}
	}
}

/**
 * retorna true si el string es un boolean 'true'
 */
String.prototype.bool = function() {
    return (/^true$/i).test(this);
};

/**
 * retorna true si el string esta vacio
 */
String.prototype.blank = function() {
	return /^\s*$/.test(this);
}

/**
 * retorna true si un string comiensa con un patron
 * @param {string} - str - patron de busqueda
 * @return true o false
 */
String.prototype.startsWith = function(str) {
	return (this.match("^"+str)==str);
}

/**
 * retorna true si un string termina con un patron
 * @param {string} - str - patron de busqueda
 * @return true o false
 */
String.prototype.endsWith = function(str) {
	return (this.match(str+"$")==str);
}

/**
 * elimina los espacios de los extremos de un string.
 * @return objeto string sin espacios
 */
String.prototype.trim = function() {
	return (this.replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, ""));
}

/**
 * 
 */
String.prototype.reverse = function(){
	var splitext = this.split("");
	var revertext = splitext.reverse();
	return revertext.join("");
}


/**
 * Realiza una busqueda de string - utiliza el estandar sql que permite utilizar el caracter %
 * @param {string} - str - string que se desea buscar
 * @param {boolean} - casesve - true: case-sensitive
 * @example
 *  	var criterio = '%tinuum%';
 *  	
 *  	console.info( criterio.inStr('Hola continuum') ); 	//resultado true
 *  
 *  	var criterio = '%tinuu';
 *  	
 *  	console.info( criterio.inStr('Hola continuum') ); 	//resultado false
 *  @return true: se encontro el valor, false: no se encontro el valor
 */
String.prototype.inStr = function(str, casesve){
	
	if (str) {
	
		str = (!casesve) ? str.toString().toLowerCase() : str.toString();
		var this_ = this.toString();
		
		if (this_.startsWith('%') && this_.endsWith("%")) { //start and end
			var s = this_.substring(1,this_.length-1);
			var ok = str.search((!casesve) ? s.toLowerCase() : s) != -1;
			return ok;
		}else if (this_.startsWith('%')) {	//start
			var s = this_.substring(1);
			var ok = str.endsWith((!casesve) ? s.toLowerCase() : s);
			return ok;
		} else if (this_.endsWith('%')) { //end
			var s = this_.substring(0,this_.length-1);
			var ok = (str.startsWith((!casesve) ? s.toLowerCase() : s));
			return ok;
		} else {
			var s = this_;
			var ok = str.search((!casesve) ? s.toLowerCase() : s) != -1;
			return ok;
		}
		
	} else {
		return false;
	}
}

/**
 * escapa el string a HTML
 */
String.prototype.scapeToHTML = function() {
	/*
	var stmp = ''; 	
	var s = this;

	for(var i = 0; i < s.length; i++) {

		var c = s.charAt(i);

		if (c == '\u00F1') {
			stmp+='&ntilde;';
		} else if (c == '\u00D1') {
			stmp+='&Ntilde;';	
		} else if (c === 'á') {
			stmp+='&aacute;';
		} else if (c === 'Á') {
			stmp+='&Aacute;';		
		} else if (c === 'é') {
			stmp+='&eacute;';
		} else if (c === 'É') {
			stmp+='&Eacute;';			
		} else if (c === 'í') {
			stmp+='&iacute;';
		} else if (c === 'Í') {
			stmp+='&Iacute;';
		} else if (c === 'ó') {
			stmp+='&oacute;';
		} else if (c === 'Ó') {
			stmp+='&Oacute;';
		} else if (c === 'ú') {
			stmp+='&uacute;';
		} else if (c === 'Ú') {
			stmp+='&Uacute;';			
		} else {
			stmp+=c;
		}
	}
	return stmp;*/
	/*
	Á 	&Aacute; 	\u00C1
	á 	&aacute; 	\u00E1
	É 	&Eacute; 	\u00C9
	é 	&eacute; 	\u00E9
	Í 	&Iacute; 	\u00CD
	í 	&iacute; 	\u00ED
	Ó 	&Oacute; 	\u00D3
	ó 	&oacute; 	\u00F3
	Ú 	&Uacute; 	\u00DA
	ú 	&uacute; 	\u00FA
	Ü 	&Uuml; 		\u00DC
	ü 	&uuml; 		\u00FC
	Ñ 	&Ntilde; 	\u00D1
	ñ 	&ntilde; 	\u00F1
	*/
	return this
	.replace(/\u00C1/gi,'&Aacute;')
	.replace(/\u00E1/gi,'&aacute;')
	.replace(/\u00C9/gi,'&Eacute;')
	.replace(/\u00E9/gi,'&eacute;')
	.replace(/\u00CD/gi,'&Iacute;')
	.replace(/\u00ED/gi,'&iacute;')
	.replace(/\u00D3/gi,'&Oacute;')
	.replace(/\u00F3/gi,'&oacute;')
	.replace(/\u00DA/gi,'&Uacute;')
	.replace(/\u00FA/gi,'&uacute;')
	.replace(/\u00DC/gi,'&Uacute;')
	.replace(/\u00FC/gi,'&uacute;')
	.replace(/\u00D1/gi,'&Ntilde;')
	.replace(/\u00F1/gi,'&ntilde;');
}

/**
 * 
 */
String.prototype.populate = function(obj) {
	var str = this;
	for(var property in obj) {
	    var v = '#' + property + '#';
	    str = eval('str.replace(/' + v + '/g,obj[property])');
	}
	return str;
}

/**
 * 
 */
Number.prototype.inStr = function(str, casesve){
	return this.toString().inStr(str, casesve);
}

/**
 * Elimina un elemento de un array.
 * @see Array Remove - By John Resig (MIT Licensed)
 * @author John Resig (MIT Licensed) 
 */
Array.prototype.removeElement = function(from, to) {
	try {
		var rest = this.slice((to || from) + 1 || this.length);
		this.length = from < 0 ? this.length + from : from;
		return this.push.apply(this, rest);
	} catch(err) {
	}
};

/**
 * 	retorna el indice del elemento. Realiza diferentes tipos de comparaciones de acuerdo al tipo de dato
 	@param {object} - element - objeto que se desea buscar en el array
 	@param {function} - fcomparacion - funcion de comparacion
 	@example
	 	-- uso normal
	 	var arr = ['a', 'b', '4', 'h', 'l', 'm'];
	
		console.info(arr.indexOfElement('4'));
	 
	 	-- uso con objetos que tienen el atributo id
	 	var arr = [{id:'a'},{id:'b'},{id:'4'},{id:'h'},{id:'l'},{id:'m'}];
	
		console.info(arr.indexOfElement( {id: '4'} ));
		
		--uso con una funcion de comparacion
		var arr = [{id:'a'},{id:'b'},{id:'4'},{id:'h'},{id:'l'},{id:'m'}];
	
		var comp = function(element, el) {
			return element === el.id;
		}
		
		console.info(arr.indexOfElement('4'));
		
	@return indice del elemento en el array, si no encuentra se retorna -1.	
 * 
 */
Array.prototype.indexOfElement = function(element, fcomparacion) {
	var result = -1;
	if (this.length) {
		$.each(this, function (index, el) {
			
			if (fcomparacion) {
				if (fcomparacion(element, el)) {
					result = index;
					return;
				}
			} else {
				if (element.id && Number(element.id) === Number(el.id)) {
					result = index;
					return;
				} else if (element === el) {
					result = index;
					return;
				}
			}
		})
	}
	return result;
};

/**
 * Reemplaza un elemento en un array
 * @param {object} - element - elemento que se desea poner en el array
 * @param {number} - i - indice donde se desea reemplazar el elemento.
 */
Array.prototype.replaceElement = function(element, i) {
	
	if (!i) {
		i = this.indexOfElement(element);
	}
	
	if (i >= 0) {
		this[i] = element;
	}
};

/**
 * refresca un elemento en un array - si no existe lo agrega, si existe lo reeplaza
 * @param {object} - element - elemento que se desea poner en el array
 * @param {number} - i - indice donde se desea reemplazar el elemento.
 */
Array.prototype.refreshElement = function(element, i) {
	
	if (!i) {
		i = this.indexOfElement(element);
	}
	
	if (i >= 0) {
		this[i] = element;
	}else{
		this.push(element);
	}
};

//@jsfn R121.SectionMgr.params2json(parray)
//Converts parameter array received from serializing the form into JSON

//agrego esto para extender la libreria json2.js y agregarle la funcion "params2json"
if (!this.JSON) {
  JSON = {};
}

/**
* transforma un array a objeto.
* @param {array} - d - array de valores
* @return objeto
*/
JSON.params2json = function(d) {
	if (d.constructor != Array) {
	    return d;
	}
	var data={};
	for(var i=0;i<d.length;i++) {
		     if (typeof data[d[i].name] != 'undefined') {
		         if (data[d[i].name].constructor!= Array) {
		             data[d[i].name]=[data[d[i].name],d[i].value];
		         } else {
		             data[d[i].name].push(d[i].value);
		         }
		     } else {
		         data[d[i].name]=d[i].value;
		     }
	}
	return data;
};

/**
* transforma un form a un objeto
* @param {object} - form - formulario
* @return objeto
*/
JSON.form2json = function(form) {
	return JSON.params2json(form.serializeArray());
};

/**
* transforma un form a json
* @param {object} - form - formulario
* @return formulario en json
*/
JSON.form2json_stringify = function(form) {
	return JSON.stringify(JSON.params2json(form.serializeArray()));
};

/**
 * JSON.stringify simplificado
 * @param obj
 * @return
 */
function toJson(obj) {
	return (obj != undefined) ? JSON.stringify(obj) : undefined;
}

/**
 * realiza un eval de un json
 * @param json
 * @return
 */
function jsonToObject(json) {
	return eval('(' + json + ')');
}

/**
* Definicion de las funciones de log.
*/
if (!this.console) {
  var console = {
  	info: function(s){
			var text = '';
			for( var i = 0; i < arguments.length; i++ ) {
				var arg = arguments[i];
				if(typeof(arg) != "object"){
					text+= arg + ', ';
				}else{
					text+= JSON.stringify(arg) + ', ';
				}
			}
			if (window['log']){ log.info(text); } else { alert('INFO: ' + text); }
		},	
  	debug: function(s){
			var text = '';
			for( var i = 0; i < arguments.length; i++ ) {
				var arg = arguments[i];
				if(typeof(arg) != "object"){
					text+= arg + ', ';
				}else{
					text+= JSON.stringify(arg) + ', ';
				}
			}
			if (window['log']) { log.debug(text); } else { alert('DEBUG: ' + text); }
		},	
  	warn: function(s){
			var text = '';
			for( var i = 0; i < arguments.length; i++ ) {
				var arg = arguments[i];
				if(typeof(arg) != "object"){
					text+= arg + ', ';
				}else{
					text+= JSON.stringify(arg) + ', ';
				}
			}
			if (window['log']) { log.warn(text); } else { alert('WARN: ' + text); }
		},	
  	error: function(s){
			var text = '';
			for( var i = 0; i < arguments.length; i++ ) {
				var arg = arguments[i];
				if(typeof(arg) != "object"){
					text+= arg + ', ';
				}else{
					text+= JSON.stringify(arg) + ', ';
				}
			}
			if (window['log']) { log.error(text); } else { alert('ERROR: ' + text); }
		}
  }
}

// CONSTANTES

var cantidad_registros_pagina = 20;

var msg_existe_lista = 'Ya se encuentra en la lista!';

function noneDiv(id) {
	$(id).style.display = 'none';
}

function inlineDiv(id) {
	$(id).style.display = 'inline';
}

/*
 * cierra todos los divs con clase 
 */
function noneDivs(clazz) {
	// cerramos todos los divs con class 'divBlock'
	var divC = 'div.' + clazz;
	$$(divC).each(
		function(id) {
			$(id).style.display = 'none';
		}
	)
}

/*
 * call back para cuando ocurre una excepcion
 */
function muestra_error(request, json) {
	// tomamos las positiones de referencia
	$('errorCtnId').innerHTML = json.error;
	// mostramos el div de datos
 	$('errorDivId').style.display = 'inline';
}

/*
 * agrega una fila con el objeto datos (array) y le coloca el clazz como className
 */
function addRow(data, className, align) {

    // creamos una fila
    var row = document.createElement("tr");

    for (var i = 0; i < data.length; i++) {
    
    	// creamos un <td> para cada columna de datos
    	// colocamos el valor del td
    	// y ponemos el td al final del <tr> creado
        var cell = document.createElement("td");
        
        // seteamos el class como dataRow y center
        cell.className = className;
        cell.align = align;
        
        var cellText = document.createTextNode(data[i]);
        cell.appendChild(cellText);
        row.appendChild(cell);
        
	}
	return row;
}

/*
 * permite popular una tabla con un objeto consulta	
 */
function populateTable(tableId, consulta, opciones) {

    // obtenermos la referencia a la tabla
    var table = $(tableId);

    // obtenemos la referencia al body de la tabla
    var tbody = table.tBodies[0];

	// agregamos la fila de encabezados
    tbody.appendChild(addRow(consulta.columnas, opciones.columnClassName, opciones.columnAlign));

    // sumamos las filas de datos
    for (var j = 0; j < consulta.valores.length ; j++) {

	    tbody.appendChild(addRow(consulta.valores[j], opciones.dataClassName, opciones.dataAlign));

    }

}

/*
 * agrega los links de proximos y anteriores
 */
function addNavLinks(tableId, consulta, numeroReg) {
    // obtenemos la referencia a la tabla
    var table = $(tableId);

    // obtenemos la referencia al body de la tabla
    var tbody = table.tBodies[0];
    
    // creamos una fila
    var row = document.createElement("tr");

	// creamos un <td> para cada columna de datos
	// colocamos el valor del td
	// y ponemos el td al final del <tr> creado
    var cell = document.createElement("td");
    
    // seteamos el class como dataRow y center
    cell.className = 'dataRow';
    cell.colSpan = consulta.columnas.length;
    cell.align = "right";
    
	// si el indice es mayor que uno
	// debemos colocar url a anteriores
	
    var cellTextA = document.createTextNode('anteriores');
		
	if (consulta.indice > 1) {
		var enlaceA = document.createElement("a");
		enlaceA.innerHTML = 'anteriores';
		enlaceA.setAttribute('href', 'javascript:void(0);');
		enlaceA.onclick = consulta.anterioresOnClick;
		cellTextA = enlaceA;
	}
	cell.appendChild(cellTextA);
	
	// si la cantidad de registros pedidos 
	// es < que la cantidad que trajo la consulta
	// debemos colocar url a proximos

    cell.appendChild(document.createTextNode(' | '));

    var cellTextP = document.createTextNode('proximos');

	if (numeroReg <= consulta.cantidad) {
		var enlaceP = document.createElement("a");
		enlaceP.innerHTML = 'proximos';
		enlaceP.setAttribute('href', 'javascript:void(0);');
		enlaceP.onclick = consulta.proximosOnClick;
		cellTextP = enlaceP;
	}

    cell.appendChild(cellTextP);
    
    row.appendChild(cell);
    
    // finalmente lo agregamos
    tbody.appendChild(row);

}

/*
 * limpia una tabla completa
 */
function clearTable(tableId) {
	
	var table = $(tableId);
	var tbody = table.tBodies[0];
	// para cada fila
	var rowsLength = tbody.rows.length;
	for(var i = 0; i < rowsLength; i++) {
		tbody.deleteRow(0);
	}
	
}

function clearBox(box) {

	while (box.firstChild) {
		box.removeChild(box.firstChild);
	}
	
}

// rellena un objeto select desde un objeto
function fillSelectFromObject(receiver, dom, selectedCode) {

	var box = $(receiver);
	
	// limpiamos el box
	clearBox(box);
	
	// dominios dentro del objeto
	var dominios = dom.dominios;
	
	for( var i = 0; i < dominios.length; i++ ) {
		
		// creamos un opt group para el encabezado
		var optG = document.createElement("OptGroup");
		optG.label = '--- ' + dominios[i].tipo + ' ---';
		
		box.appendChild(optG);

		// creamos los options para los valores de dominio
		var valores = dominios[i].valores;

		for (var j = 0; j < valores.length; j++) {
			
			var opt = document.createElement("Option");
			opt.value = dominios[i].tipo.toUpperCase().substring(0,1) + ';' + valores[j].codigo;
			opt.innerHTML = valores[j].descripcion;
			
			box.appendChild(opt);
			
			if (selectedCode.toUpperCase() == dominios[i].tipo.toUpperCase()) {
				opt.selected = true;
				//box.selectedIndex = opt.index;
			}
			
		}
	}

}

/*
 * busca un option dentro del select,
 * retorna null si no lo encuentra
 */
function lookUpOptionByValue(select, value) {
	var result = null;
	var encontrado = false;
	
	for (var i = 0; !encontrado && i < select.options.length; i++) {
		// referenciamos el option
		var opt = select.options[i];
		// veamos si lo encontramos
		if (opt.value == value) {
			encontrado = true;
			result = opt;
		}
	}
	
	return result;
}

/*
 * agrega una option a un select si esta no existe
 */
function agregaOptionToSelect(selId, valor, texto) {

	// referenciamos el select
	var sel = $(selId);

	if (null == lookUpOptionByValue(sel, valor)) {
		// agregamos el option
		var opt = document.createElement("option");
		opt.value = valor;
		opt.innerHTML  = texto;
		
		// lo agregamos al final
		sel.appendChild(opt);	
	} else {
		alert(msg_existe_lista);
	}

}

/*
 * llena los atributos del formulario con los atributos del objeto
 */
function llenarFormulario(f, obj) {
  	f.rutEmpresa.value = obj.rutEmpresa;
  	f.valorDominio.value = obj.valorDominio;
  	f.nombreDominio.value = obj.nombreDominio;
  	if (f.mes) {
	  	f.mes.value = obj.mes;
  	}
  	if (f.ano) {
  		f.ano.value = obj.ano;
  	}
  	if (f.fechaDesdeStr) {
  		f.fechaDesdeStr.value = obj.fechaDesdeStr;
  	}
  	if (f.fechaHastaStr) {
  		f.fechaHastaStr.value = obj.fechaHastaStr;
  	}
  	if (f.tipoAccidente) {
  		f.tipoAccidente.value = obj.tipoAccidente;
  	}
  	if (f.gravedad) {
  		f.gravedad.value = obj.gravedad;
  	}
}

/*
 * util para ejecutar bajadas en nuevas ventanas
 */
function bajar(url, f, window_name) {
	if(f.indice) {
		f.indice.value = 1;
	}
	window.open(url + '&' + Form.serialize(f), window_name);
}

/*
 * Clona todos los atributos de un objeto adem�s de las funciones miembros del objeto
 */
//Clona un objeto JSON
JSON.clone = function clone(o) {
	function OneShotConstructor(){}
	OneShotConstructor.prototype = o;
	return new OneShotConstructor();
};
