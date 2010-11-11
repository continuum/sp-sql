(function ($) {

	$(document).ready(function () {
	
		var parametros = undefined;
		var TRY_CONNECT_COUNT = 0;
		
		$('#maxRows').attr('disabled', true);
		
		var isMaxRow = $('#isMaxRows');
		isMaxRow.setChecked(false);
		
		isMaxRow.unbind('click').click(function(event){
			$('#maxRows').attr('disabled', !$(this).isChecked());
		});
		
		/**
		 * 
		 * @param {Object} event
		 */
		$('#btn-ejecutar-sql').unbind('click').click(function(event){
			
			var querys_sql = $('#querys-sql').val();
			
			if (querys_sql != undefined && !querys_sql.blank()) {
				
				var querys = querys_sql.split('}');
				
				querys_sql = '';
				
				$.each(querys, function(i, e){
					
					if (e != undefined && !e.blank()) {
						
						var sql = e.trim();
						
						if (!sql.startsWith('-') && !sql.startsWith('--') && !sql.startsWith('/') && !sql.startsWith('//')){
							
							sql = sql.replace(/{/gi,'');
							sql = sql.trim();
							
							if (sql.toLowerCase().startsWith('call ')) {
								querys_sql+='SQL{CALL=' + toJson(generaSP_SQL(sql)) + '}SQL';
							} else {
								querys_sql+= 'SQL{' + sql + '}SQL';
							}
						}
					}
					
				});

				if (querys_sql && !querys_sql.blank()) {
					
					var params = {
						perform: 'execute', 
						querys: querys_sql
					};
					
					if ($('#isMaxRows').isChecked()){
						params.maxRows = $('#maxRows').val();
					}
					
					$.ajaxMsgPostJSON('Ejecutando SQL','sql.htm', params, function (json) {
						
						if (json.success) {
							
							var div = $('#resultados-sql').empty();
							
							for (var i = 0; i < json.countResults; i++) {
								var result = json['result' + i];
								$.muestraResultados(div, result);
							}
	
						} else {
							if (json.connectionError && 
								$('#user:input[type=text]').val() != "" && 
								$('#password:input[type=text]').val() != "" && TRY_CONNECT_COUNT < 10) {
								$.conectarYEjecutar($('#btn-ejecutar-sql'), TRY_CONNECT_COUNT);
								TRY_CONNECT_COUNT++;
								return;	
							}
							$.error(json.msg);
							
						}
					});
				}
			} 
			
			event.preventDefault();
		});
		
		$('#link-ayuda-sql').click(function(event){
			
			$('#div-ayuda-sql').toggle();
			
			event.preventDefault();
		});
		
		function OUT(datatype, value, name) {
		    return {type: 'out', datatype: datatype, name: name, value: value};
		}

		function IN(datatype, value, name) {
		    return {type: 'in', datatype: datatype, name: name, value: value};
		}

		function virtual_sp(p){
		    
		    var parameters = [];

		    for( var i = 0; i < arguments.length; i++ ) {
			var arg = arguments[i];
		        if(arg.name == undefined) {
		            arg.name = 'P' + i;
		        }
		        if(arg.value == undefined) {
		            arg.value = '';
		        }
		        parameters.push(arg);
		    }

		    return {parameters: parameters};
		}

		//var s = "gp.sp(OUT('char(1)',1,'rutempresa'),IN('int(2)'));";

		function generaSP_SQL(sp) {
			sp=sp.replace(/call/gi,'');
	        var index = sp.indexOf('(');
	        var virtualSP = 'virtual_sp' + sp.substring(index);
	        var nuevoSP = eval('(' + virtualSP + ')');
	        nuevoSP.name = sp.substring(0,index);
	        return nuevoSP;
		}
	});
	
})(jQuery);