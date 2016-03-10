sap.ui.define([
   "sap/ui/core/UIComponent",
   "sap/ui/model/json/JSONModel",
   "sap/ui/model/resource/ResourceModel"
], function (UIComponent, JSONModel, ResourceModel) {
   "use strict";
   return UIComponent.extend("sap.ui.demo.wt.Component", {
            metadata : {
		          rootView: "de.demo.timepicker.view.App"
	},
      init : function () {
         UIComponent.prototype.init.apply(this, arguments);
      }
   });
});
