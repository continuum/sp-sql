/**
 * @autor vutreras
 */
StringUtils = {
	
		isEmpty: function(s) {
			return s == undefined || s.blank();
		},
		
		isNotEmpty: function(s) {
			return !StringUtils.isEmpty(s);
		},
		
		isBlank: function(s) {
			if (s == undefined) {
				return false;
			} else {	
				return s.blank();
			}
		},
		
		isNotBlank: function(s) {
			return !StringUtils.isBlank(s);
		}
		
};