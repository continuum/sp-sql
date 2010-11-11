/**
 * 
 */
package cl.continuum.spsql.web;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.GZIPOutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.sql.DataSource;

import org.apache.commons.collections.map.ListOrderedMap;
import org.apache.commons.dbcp.BasicDataSource;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.context.ApplicationContextException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.RequestUtils;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.View;

import cl.continuum.utils.Util;
import cl.continuum.utils.dao.GenericStoreProcedure;
import cl.continuum.utils.web.controller.AbstractCommonController;

/**
 * @author vutreras
 *
 */
public class SQLController extends AbstractCommonController {
	
	protected static final Log log = LogFactory.getLog(AbstractCommonController.class);
	
	/**
	 * @throws ApplicationContextException
	 */
	public SQLController() throws ApplicationContextException {
		super();
	}
			
	/**
	 * @return the dataSource
	 */
	public DataSource getDataSource(HttpServletRequest req) {
		HttpSession sesion = req.getSession(true);
		return (DataSource)sesion.getAttribute("dataSource");
	}

	/**
	 * @param dataSource the dataSource to set
	 */
	public void setDataSource(HttpServletRequest req, DataSource dataSource) {
		HttpSession sesion = req.getSession(true);
		sesion.setAttribute("dataSource", dataSource);
	}

	/**
	 * 
	 * @param req
	 * @return
	 */
	private JdbcTemplate getJdbcTemplate(HttpServletRequest req) {
		return new JdbcTemplate(this.getDataSource(req));
	}
	
	/**
	 * 
	 * @param s
	 * @return
	 */
	public String filtrarQuery(String s) {
	
		int i1 = s.indexOf("<script>");
		int i2 = s.indexOf("</script>");
		
		if (i1 != -1 && i2 != -1) {

			String script = s.substring(i1 + "<script>".length(),i2);
			String query = s.substring(i2 + "</script>".length());
			
			String[] vars = script.split("var ");
			
			for (int i = 0; i < vars.length; i++) {
				
				if (StringUtils.isNotBlank(vars[i])) {
				
					String var = new String(vars[i]).replace("var ", "").trim();
					String[] partes = var.split("=");
					query = query.replaceAll("#" + partes[0].trim() +"#", partes[1].trim());
				}
			}
			
			if (query.endsWith(";")) {
				query = query.substring(0,query.length()-1);
			}
			
			if (query.startsWith("SQL{")) {
				query = query.substring("SQL{".length());
			}
			
			return query.trim();
			
		} else {
			
			if (s.endsWith(";")) {
				s = s.substring(0,s.length()-1);
			}
			
			if (s.startsWith("SQL{")) {
				s = s.substring("SQL{".length());
			}
			
			return s;
		}
	}
	
	/**
	 * Ejecuta un execute SQL
	 * @param req
	 * @param resp
	 * @return
	 * @throws Exception
	 */
	public ModelAndView execute(HttpServletRequest req, HttpServletResponse resp) throws Exception {
		
		try {
			
			String querys = RequestUtils.getRequiredStringParameter(req, "querys");
			int maxRows = RequestUtils.getIntParameter(req, "maxRows", -1);
			
			String[] s = querys.split("}SQL");
			
			JSONObject result = this.ok("ok");
			
			JdbcTemplate jdbcTemplate = this.getJdbcTemplate(req);
			
			if (maxRows > 0) {
				jdbcTemplate.setMaxRows(maxRows);
			}
			
			int count = 0;

			for (int i = 0; i < s.length; i++) {
				
				String q = s[i].trim();
				
				if (StringUtils.isNotBlank(q) && !(q.startsWith("//") || q.startsWith("--"))) {
					
					q = filtrarQuery(q);
					
					String q2 = q.toUpperCase().replaceAll("\t", " ");

					log.info("Ejecutando sql: " + q);
					
					if (q2.startsWith("UPDATE ") || q2.startsWith("DELETE ")) {
						
						int rows = jdbcTemplate.update(q);
						JSONArray ja = new JSONArray();
						ja.add(new JSONObject().put("rows", rows));
						result.put("result" + count, new JSONObject().put("data", ja).put("sql", q));
						count++;
						
					} else if (q2.startsWith("SELECT ")) {
						
						List l = jdbcTemplate.queryForList(q);
						
						// Fixed: Hace un toString del objeto Timestamp  
						for (Object object : l) {
							ListOrderedMap listOrdered = (ListOrderedMap) object;
							for (Object key : listOrdered.keyList())
								if (listOrdered.get(key) instanceof Timestamp)
									listOrdered.put(key, ((Timestamp) listOrdered.get(key)).toString());
						}
						
						result.put("result" + count, new JSONObject().put("data", Util.collectionToJsonArray(l, false)).put("sql", q));
						count++;
						
					} else if (q2.startsWith("CALL=")) {
						
						q = q.replaceAll("CALL=", "");
						Map ret = executeSP(req, q);
						result.put("result" + count, new JSONObject().put("data", ret.get("retorno")).put("sql", ret.get("sql")));
						count++;
						
					} else {
						
						int rows = 1; 
						jdbcTemplate.execute(q);
						JSONArray ja = new JSONArray();
						ja.add(new JSONObject().put("rows", rows));
						result.put("result" + count, new JSONObject().put("data", ja).put("sql", q));
						count++;
					}
				}
			}
			
			return renderJson(result.put("countResults", count));

		} catch (Exception ex) {
			log.error("Error al ejecutar sql", ex);
			boolean connectionError = false;
			if (ex.getMessage().contains("dataSource is required"))
				connectionError = true;
			return renderJson(super.fail("Error al ejecutar sql, causa: " + ex.getMessage()).put("connectionError", connectionError));
		}
	}

	/**
	 * 
	 * @param req
	 * @param resp
	 * @return
	 * @throws Exception
	 */
	public ModelAndView connect(HttpServletRequest req, HttpServletResponse resp) throws Exception {
		
		try {

			String connection = RequestUtils.getRequiredStringParameter(req, "connection");
			JSONObject conn = new JSONObject(connection);
			JSONObject result = this.ok("ok");
			
			log.info("Creando datasource [" + conn + "]");
			
			BasicDataSource ds = new BasicDataSource();
			ds.setUrl(conn.getString("url"));
			ds.setDriverClassName(conn.getString("driverClassName"));
			ds.setUsername(conn.getString("user"));
			ds.setPassword(conn.getString("password"));
			
			log.info("Probando conexion...");
			
			result.put("metadata", ds.getConnection().getMetaData().toString());
			
			log.info("Conexion exitosa");
			
			HttpSession sesion = req.getSession(true);
			sesion.setAttribute("dataSource", ds);
			
			return renderJson(result);
		
		} catch (Exception ex) {
			log.error("Error al conectar", ex);
			return renderJson(super.fail("Error al conectar, causa: " + ex.getMessage()));
		}
	}
	
	/**
	 * Ejecuta un sql y retorna el resultado de la columna
	 * @param req
	 * @param resp
	 * @return
	 * @throws Exception
	 */
	public ModelAndView getstring(HttpServletRequest req, HttpServletResponse resp) throws Exception {
		
		try {

			String querys = RequestUtils.getRequiredStringParameter(req, "querys");
			JSONObject result = this.ok("ok");
			
			int count = 0;
			String[] s = querys.split(";");
			
			JdbcTemplate jdbcTemplate = this.getJdbcTemplate(req);
			
			for (int i = 0; i < s.length; i++) {
				
				String q = s[i].trim();
				
				if (StringUtils.isNotBlank(q) && !(q.startsWith("//") || q.startsWith("--"))) {
					
					q = filtrarQuery(q);
					
					String q2 = q.toUpperCase();
					
					if (q2.startsWith("SELECT ")) {
						log.info("Ejecutando sql: " + q);
						result.put("result" + count, new JSONObject().put("data", jdbcTemplate.queryForObject(q, String.class)).put("sql", q));
						count++;
					}
				}
			}
			
			return renderJson(result.put("countResults", count));
		
		} catch (Exception ex) {
			log.error("Error al ejecutar sql", ex);
			return renderJson(super.fail("Error al ejecutar sql, causa: " + ex.getMessage()));
		}
	}
	
	/**
	 * Ejecuta un sql y retorna el registro
	 * @param req
	 * @param resp
	 * @return
	 * @throws Exception
	 */
	public ModelAndView getmap(HttpServletRequest req, HttpServletResponse resp) throws Exception {
		
		try {

			String querys = RequestUtils.getRequiredStringParameter(req, "querys");
			JSONObject result = this.ok("ok");
			
			int count = 0;
			String[] s = querys.split(";");
			
			JdbcTemplate jdbcTemplate = this.getJdbcTemplate(req);
			
			for (int i = 0; i < s.length; i++) {
				
				String q = s[i].trim();
				
				if (StringUtils.isNotBlank(q) && !(q.startsWith("//") || q.startsWith("--"))) {
					
					q = filtrarQuery(q);
					
					String q2 = q.toUpperCase();
					
					if (q2.startsWith("SELECT ")) {
						log.info("Ejecutando sql: " + q);
						result.put("result" + count, new JSONObject().put("data", new JSONObject(jdbcTemplate.queryForMap(q))).put("sql", q));
						count++;
					}
				}
			}
			
			return renderJson(result.put("countResults", count));
		
		} catch (Exception ex) {
			log.error("Error al ejecutar sql", ex);
			return renderJson(super.fail("Error al ejecutar sql, causa: " + ex.getMessage()));
		}
	}
	
	/**
	 * Ejecuta un sql y retorna el listado de registro
	 * @param req
	 * @param resp
	 * @return
	 * @throws Exception
	 */
	public ModelAndView getlistmap(HttpServletRequest req, HttpServletResponse resp) throws Exception {
		
		try {

			String querys = RequestUtils.getRequiredStringParameter(req, "querys");
			JSONObject result = this.ok("ok");
			
			int count = 0;
			String[] s = querys.split(";");
			
			JdbcTemplate jdbcTemplate = this.getJdbcTemplate(req);
			
			for (int i = 0; i < s.length; i++) {
				
				String q = s[i].trim();
				
				if (StringUtils.isNotBlank(q) && !(q.startsWith("//") || q.startsWith("--"))) {
					
					q = filtrarQuery(q);
					
					String q2 = q.toUpperCase();
					
					if (q2.startsWith("SELECT ")) {
						log.info("Ejecutando sql: " + q);
						result.put("result" + count, new JSONObject().put("data", Util.collectionToJsonArray(jdbcTemplate.queryForList(q), true)).put("sql", q));
						count++;
					}
				}
			}
			
			return renderJson(result.put("countResults", count));
		
		} catch (Exception ex) {
			log.error("Error al ejecutar sql", ex);
			return renderJson(super.fail("Error al ejecutar sql, causa: " + ex.getMessage()));
		}
	}
	
	/**
	 * 
	 * @param req
	 * @param jSp
	 * @return
	 * @throws JSONException
	 */
	private Map executeSP(HttpServletRequest req, String jSp) throws JSONException{
		

//		String jSp = "{name: 'GXCPDBP.GPS002CL', result: 'list'," +
//		"parameters:" +
//		" [{type: 'out', datatype: 'int(9)', name: 'experto'}," +
//		"  {type: 'out', datatype: 'char(10)', name: 'correlativoEmpresa'}," +
//		"  {type: 'out', datatype: 'char(10)', name: 'correlativoSucursal'}]}}";
//		
//		String values = "15587917,2";
		
		JSONObject sp = new JSONObject(jSp);
		JSONArray parameters = Util.getJSONArray(sp, "parameters");
		String result = Util.getJSONString(sp, "result", "list");
		
		GenericStoreProcedure gsp = new GenericStoreProcedure(sp.getString("name"), this.getDataSource(req));
		
		gsp.setNullAsString(true);
		
		if (parameters != null && !parameters.isEmpty()) {
			gsp.setParameters(parameters);	
		}
		
		String sql = gsp.getName();
		Object retorno = null;
		
		if (parameters != null && !parameters.isEmpty()) {
			
			Map params = new HashMap();
			List lstValues = new ArrayList();
			
			for (int i = 0; i < parameters.size(); i++) {
				
				JSONObject p = parameters.getJSONObject(i);
				String value = Util.getJSONString(p,"value",null);
				
				if (StringUtils.isNotBlank(value)) {
					params.put(p.getString("name"), value);
					lstValues.add(value);
					p.put("value", null);
				}
			}

			sql+=lstValues + ";";
			
			log.info("DEF-> PARAMETERS: " + parameters);
			log.info("VALUES: " + params);
			
			if ("list".equals(result)) {
				retorno = gsp.listDataJSON(params);
			} else {
				retorno = gsp.getDataJSON(params);
			}
			
		} else {
			
			sql+="();";
			
			if ("list".equals(result)) {
				retorno = gsp.listDataJSON();
			} else {
				retorno = gsp.getDataJSON();
			}
		}
		
		if (retorno == null) {
			retorno = new JSONObject().put("exito", true);
		}

		Map ret = new HashMap();
		ret.put("retorno", retorno);
		ret.put("sql", sql);
		
		return ret;
	}
	
	/**
	 * Ejecuta un StoreProcedure (SP) utilizando GenericStoreProcedure
	 * @param req
	 * @param resp
	 * @return
	 * @throws Exception
	 */
	public ModelAndView sp(HttpServletRequest req, HttpServletResponse resp) throws Exception {
		
		try {

			String jSp = RequestUtils.getRequiredStringParameter(req, "sp");
			Map ret = executeSP(req, jSp);
				
			return renderJson(this.ok("ok").put("result", new JSONObject().put("data", ret.get("retorno")).put("sql", ret.get("sql"))));
		
		} catch (Exception ex) {
			log.error("Error al ejecutar sql", ex);
			return renderJson(super.fail("Error al ejecutar sql, causa: " + ex.getMessage()));
		}
	}
	
	public static void main(String[] args) {
		
		
	}
	
	public static class JSONViewGzip implements View {
    	private JSONObject json;

    	public JSONViewGzip(JSONObject json) {
    	    this.json = json;
    	}
    	
		public void render(Map model, HttpServletRequest req, HttpServletResponse resp) throws Exception {
			resp.setCharacterEncoding("UTF-8");
			
			resp.setHeader("Content-Encoding", "gzip");

			
			try {
			    // remember to import java.util.zip.GZIPOutputStream
			    GZIPOutputStream gzos = new GZIPOutputStream(resp.getOutputStream());
			    gzos.write(toJSONString().getBytes());
			    gzos.close();
			  } catch(IOException ie) {
			    // handle the error here
			    
			  }
			//resp.getWriter().write(toJSONString());
		}

    	public String toJSONString() {
    	    if (json != null)
    		return json.toString();
    	    return "";
    	}

    	public JSONObject getJSON() {
    	    return this.json;
    	}
    }

	/**
	 * 
	 */
	protected ModelAndView renderJsonGzip(final JSONObject json) {	
		return new ModelAndView(new JSONViewGzip(json));
	}
	
	/**
	 * Ejecuta un StoreProcedure (SP) utilizando GenericStoreProcedure
	 * @param req
	 * @param resp
	 * @return
	 * @throws Exception
	 */
	public ModelAndView test1(HttpServletRequest req, HttpServletResponse resp) throws Exception {
		
		try {
			boolean isGzip = RequestUtils.getBooleanParameter(req, "gzip", false);
			
			String data = IOUtils.toString(new FileInputStream(new File("./notice.html")));
			
			JSONObject result = this.ok("ok").put("result", new JSONObject().put("data", data));
			
			if (isGzip) {	
				return renderJsonGzip(result);	
			} else {
				return renderJson(result);
			}
		
		} catch (Exception ex) {
			log.error("Error al ejecutar sql", ex);
			return renderJson(super.fail("Error al ejecutar sql, causa: " + ex.getMessage()));
		}
	}
}