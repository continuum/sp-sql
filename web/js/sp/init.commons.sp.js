(function ($) {

	$(document).ready(function () {
		
		var btnConectarGlobal = $('#btn-conectar');
	
	
		var isCtrl = false; 
		$(document).keyup(function (e) { 
			if(e.which == 17) isCtrl=false; 
		}).keydown(function (e) { 
			if(e.which == 17) isCtrl=true; 
			if(e.which == 13 && isCtrl == true) {
				if ($('#div-modulo-sql').is(':visible'))
					$('#btn-ejecutar-sql').click();
				if ($('#div-modulo-sp').is(':visible'))
					$('#btn-ejecutar-sp').click();
				return false;
			}
		}); 
	
		$.conectarYEjecutar = function(executeButton, numTryConnection){
			btnConectarGlobal.unbind('connected').bind('connected', function(){
				console.info('Conexion de intento Nº %i exitosa!', numTryConnection);
				executeButton.click();
				console.info('Ejecutando %s', executeButton.attr('id'));
			});
			btnConectarGlobal.click();
			console.info('Intento de conexión Nº %i',numTryConnection);
		}
		
		/**
		 * crea los tabs
		 * @param config - configuracion de los tabs
		 */
		$.fn.crearTabs = function (config) {
	
			var el1 = $(this);
			
			/**
			 * selecciona el tab
			 */
			el1.selectTab = function(selector, ejecutarClick) {
				$(config.selectorTab).removeClass(config.clsSelected).removeClass(config.clsHover);
				var obj = $(selector).addClass(config.clsSelected);
				if (ejecutarClick == undefined || ejecutarClick == true) {
					if (config.selectEvent && (typeof config.selectEvent === 'function')) {
						config.selectEvent(obj);
					}
				} else {
					if (config.selectEventNoClick && (typeof config.selectEventNoClick === 'function')) {
						config.selectEventNoClick(obj);
					}
				}
				return obj;
			}
			
			/**
			 * muestra el tab
			 */
			el1.showTab = function(selector) {
				return $(selector).show();
			}
			
			/**
			 * oculta el tab 
			 */
			el1.hideTab = function(selector) {
				return $(selector).hide();
			}
			
			this.each(function () {
	
				var el = $(this);
				
				el.hover(function(event){
					
					if(!el.hasClass(config.clsSelected)){
						el.toggleClass(config.clsHover);
					}
					
				}, function(event){
					
					if(!el.hasClass(config.clsSelected)){
						el.toggleClass(config.clsHover);
					}
					
				}).unbind('click').click(function (event) {
					
					$(config.selectorTab).removeClass(config.clsSelected).removeClass(config.clsHover);
					el.addClass(config.clsSelected);
					config.selectEvent(el);
				});
			});
			
			return el1;
		};
		
		/**
		 * crea los tabs
		 */
		var tabs = $('.ctrl-tab').crearTabs({
			selectorTab: '.ctrl-tab', 
			clsSelected: 'ctrl-tab-selected', 
			clsHover: 'ctrl-tab-selected-hover', 
			selectEvent: function(el) {
				var id = el.attr('id');
				
				if (id == 'tab-modulo-sp') {
					$('#div-modulo-sql').hide();
					$('#div-modulo-sp').show();
				} else {
					$('#div-modulo-sp').hide();
					$('#div-modulo-sql').show();
				}
			}
		});
		
		tabs.selectTab('#tab-modulo-sql');
		
		/**
		 * muestra los resultados sql
		 */
		$.muestraResultados = function(div, json) {
			
			div.append('<br>').show();
			
			var json_result = json.data;
			
			if (json_result.length && json_result.length > 0) {
				
				var detalle = [];
				
				var tr = '';
				
				if (json && json.sql) {
					tr = '<table  cellpadding="0" cellspacing="0" style="border: 1px solid black; width:100%;"><tr><td style="background-color: #cccccc; width: 40px;border: 1px solid black;">SQL</td><td style="border: 1px solid black;">' + json.sql + '</td></tr></table>';
				}
				
				tr+='<table  cellpadding="0" cellspacing="0" style="border: 1px solid black;"><thead><tr style="background-color: #cccccc;">';
				
				for(obj in json_result[0]) {
					tr+='<td style="border: 1px solid black;"><b>' + obj + '</b></td>';
					detalle.push(obj);
				}
				
				tr+='<tr></thead><tbody>';
				
				$.each(json_result, function(i, e){
					
					tr+='<tr>';
					for (var i = 0; i < detalle.length; i++) {
						tr+='<td style="border: 1px solid black;">' + e[detalle[i]] + '</td>';
					}
					tr+='</tr>';
				});
				
				tr+='</tbody></table>';
				
				div.append($('<div style="overflow: auto;height:auto; max-height:400px;">' + tr + '</div>').resizable());
				
			}else {
			
				var detalle = [];
				
				var tr = '';
				
				if (json && json.sql) {
					tr = '<table  cellpadding="0" cellspacing="0" style="border: 1px solid black; width:100%;"><tr><td style="background-color: #cccccc; width: 40px;border: 1px solid black;">SQL</td><td style="border: 1px solid black;">' + json.sql + '</td></tr></table>';
				}
				
				tr+='<table  cellpadding="0" cellspacing="0" style="border: 1px solid black;"><thead><tr style="background-color: #cccccc;">';
				tr+='<td style="border: 1px solid black;"><b>Sin resultados</b></td><tr></thead></table>';
			
				div.append($('<div style="overflow: auto;height:auto; max-height:400px;">' + tr + '</div>').resizable());
			
			}
			/* else {
				
				var detalle = [];
				
				var tr = '';
				
				if (json && json.sql) {
					tr = '<table style="border: 1px solid black; width:100%;"><tr><td style="background-color: #cccccc; width: 40px;border: 1px solid black;">SQL</td><td style="border: 1px solid black;">' + json.sql + '</td></tr></table>';
				}
				
				tr+='<table style="border: 1px solid black;"><thead><tr style="background-color: #cccccc;">';
				
				for(obj in json_result) {
					tr+='<td style="border: 1px solid black;"><b>' + obj + '</b></td>';
					detalle.push(obj);
				}
				
				tr+='<tr></thead><tbody>';
				
				tr+='<tr>';
				for (var i = 0; i < detalle.length; i++) {
					tr+='<td style="border: 1px solid black;">' + json_result[detalle[i]] + '</td>';
				}
				tr+='</tr>';
				
				tr+='</tbody></table>';
				div.append($('<div style="overflow: auto;height:auto; max-height:400px;">' + tr + '</div>').resizable());
				
			}*/
		}
	
		/**
		 * 
		 */
		$('#link-conectar').click(function(event){
			
			$('#div-conectar').toggle();
			
			event.preventDefault();
		});
	
		/**
		 * 
		 */
		btnConectarGlobal.click(function(event){
			
			var self = $(this);
			var connection = {};
			
			$('.connection').each(function(i, e) {
				var el = $(e);
				connection[el.getId()] = el.val(); 
			});
			
			$.ajaxMsgPostJSON('Conectando...','sql.htm', {perform: 'connect', connection: toJson(connection)}, function (json) {
				if (json.success) {
					$('#div-conectar').slideUp();
					self.trigger("connected");
				} else {
					$.error(json.msg);
				}
			});
			
			event.preventDefault();
		});
		
		/**
		 * 
		 */
		$('#driverClassName').change(function() {
			
			var val = $(this).val();
			var tipo = '';
			
			if (val === 'com.ibm.as400.access.AS400JDBCDriver') {
				tipo = 'as400';
			} else if (val === 'com.mysql.jdbc.Driver') {
				tipo = 'mysql';
			} else if (val === 'com.ibm.db2.jcc.DB2Driver') {
				tipo = 'db2';
			}
			
			$('#url').val('jdbc:' + tipo + '://[host]:[puerto]');
		});
		
		$('#div-conectar').slideDown();
	});	
			
})(jQuery);