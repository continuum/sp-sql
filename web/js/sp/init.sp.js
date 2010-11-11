(function ($) {

	$(document).ready(function () {
		
		$('#form-conf-sp').keyValidateByClassForm();
		
		var TRY_CONNECT_COUNT = 0;
		var parametros = undefined;
	
		/**
		 * 
		 * @param {Object} event
		 */
		$('#btn-generar').click(function(event){
			
			var div = $('#lista-parametros').show();
			var numeroParametros = $('#numero-parametros').getVal(0);
			var lista_parametros = $('#tbody-lista-parametros').empty();
			
			if (!numeroParametros.blank()) {
				
				if (numeroParametros > 0) {
				
					for (var i = 0; i < Number(numeroParametros); i++) {
						
						var tr = '<tr class="parametro">' +
						'<td style="border: 1px solid black;">' + (i+1) + '</td>' +
						'<td style="border: 1px solid black;">' +
						'	<select id="tipo-#value#" title="type" style="width: 40px;" class="parametro-detalle">' +
						'		<option value="out">out</option>' +
						'		<option value="in">in</option>' +
						'	</select>' +
						'</td>' +
						'<td style="border: 1px solid black;">' +
						'	<select id="tipo-dato-#value#" title="datatype" style="width: 80px;" class="parametro-detalle param-datatype">' +
						'		<option value="char">char(*)</option>' +
						'		<option value="int">int(*)</option>' +
						'		<option value="varchar">varchar</option>' +
						'		<option value="integer">integer</option>' +
						'	</select>' +
						'</td>' +
						'<td style="border: 1px solid black;"><input type="text" id="largo-#value#" title="length" style="width: 50px;" maxlength="10" class="parametro-detalle number param-length"></td>' +
						'<td style="border: 1px solid black;"><input type="text" id="nombre-#value#" title="name" style="width: 220px;" value="P#value#" maxlength="50" class="parametro-detalle"></td>' +
						'<td style="border: 1px solid black;"><input type="text" id="valor-#value#" title="valor" style="width: 220px;" maxlength="1000" class="parametro-detalle param-valor"></td>' +
						'</tr>';
						
						lista_parametros.append(tr.populate({value: i}));
					}
					
					$('.param-length').each(function(i,e){
						$(e).unbind('keypress').keyValidateByClass();
					});
					
					/**
					 * 
					 */
					$('.param-datatype').unbind('change').change(function(){
						var el = $(this);
						var tipo = el.val();
						var id = el.getIdSplit('-');
						
						if (tipo == 'integer' || tipo == 'varchar') {
							$('#largo-' + id[2]).val('').hide();	
						} else {
							$('#largo-' + id[2]).val('').show();
						}
					});
					
					$('#table-lista-parametros').show();
					
				} else {
					$('#table-lista-parametros').hide();
				}
				
			} else {
				$('#table-lista-parametros').hide();
			}
			
			event.preventDefault();
		});
	
		/**
		 * 
		 */
		function generarParametros(callback) {
			
			$('#form-conf-sp').validateForm(function(){
				
				var nuevoSP = {name: $('#name-sp').val(),
							   result: $('#result-sp').val()};
							   
				var valores = '';
				
				$('.param-valor').each(function(i,e){
					var v = $(e).val();
					if (v != undefined && !v.blank()) {
						valores+=v + ',';	
					}
				});
				
				var parametros = [];
				
				var errores = '';
				
				$('.parametro').each(function(i, e){
					
					var el = $(e);
					var pd = {};
					
					el.find('.parametro-detalle').each(function(i, e){
						var el2 = $(e);
						pd[el2.getTitle()] = el2.val(); 
					});
				
					if (pd.name.blank()) {
						
						errores+='Ingrese el nombre del parametro ' + (i+1) + '<br>';
						
					} else {
						
						var parametro = {type: pd.type, name: pd.name};
					
						if (pd.datatype == 'int' || pd.datatype == 'char') {
							if (pd.length == undefined || pd.length.blank()) {
								parametro.datatype = pd.datatype + '(0)';
							} else {
								parametro.datatype = pd.datatype + '(' + pd.length + ')';
							}
						} else {
							parametro.datatype = pd.datatype;
						}	
				
						parametro.value = el.find('.param-valor').val();
						
						parametros.push(parametro);	
					} 
				});
				
				if (parametros.length > 0) {
					nuevoSP.parameters = parametros;
				}
				
				if (errores.blank()) {
				
					callback(nuevoSP, valores);
					
				} else {
					$.error(errores);
				}
				
			},function(errores){
				$.error(errores);
			});
			
		}
		
		/**
		 * 
		 * @param {Object} event
		 */
		$('#btn-ejecutar-sp').click(function(event){
			
			generarParametros(function(nuevoSP, valores) {

				$.ajaxMsgPostJSON('Ejecutando SP','sql.htm', {perform: 'sp', sp: toJson(nuevoSP), values: valores}, function (json) {
					
					if (json.success) {
						
						var div = $('#resultados-sp').empty();
						
						if (json.result) {
							$.muestraResultados(div, json.result);
						}
					
					} else {	
                        if (json.connectionError && $('#user:input[type=text]').val() != "" &&
                        $('#password:input[type=text]').val() != "" &&
                        TRY_CONNECT_COUNT < 10) {
                            $.conectarYEjecutar($('#btn-ejecutar-sp'), TRY_CONNECT_COUNT);
                            TRY_CONNECT_COUNT++;
                            return;
                        }
						$.error(json.msg);
					}
				});
			});

			event.preventDefault();
		});
		 
		/**
		 * 
		 * @param {Object} event
		 */
		$('#btn-generar-bean-spring-sql').click(function(event){
			
			generarParametros(function(nuevoSP, valores) {

				var sp = '<bean id="NOMBRE_SP_SPBean" class="cl.continuum.utils.dao.GenericStoreProcedure">\n' +
				'\t<property name="name" value="' + nuevoSP.name + '"/>\n' +	
				'\t<property name="dataSource" ref="dataSource"/>\n';
				
				if (nuevoSP.parameters && nuevoSP.parameters.length) {
				
					sp+='\t<property name="parameters">\n' +
					'\t<list>\n';
					
					$.each(nuevoSP.parameters, function(i, e){
						e.value = undefined;
						sp+='\t\t<value>' + toJson(e) +'</value>\n';
					});
					
					sp+='\t</list>\n\t</property>\n';
				}

				sp+='</bean>';
				
				$('<div><textarea style="width: 580px; height:460px;">' + sp + '</textarea></div>').dialog({width: 'auto', height: 'auto', modal: true, resizable: false});
			});

			event.preventDefault();
		}); 
		
		
	});
	
})(jQuery);