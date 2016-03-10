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
         
         // set i18n model
         var i18nModel = new ResourceModel({
            bundleName : "de.demo.timepicker.i18n.lang"
         });
         this.setModel(i18nModel, "i18n");
      }
   });
});
