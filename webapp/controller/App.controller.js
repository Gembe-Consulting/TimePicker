sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/resource/ResourceModel"
	], function (Controller, JSONModel, ResourceModel) {
	"use strict";
	return Controller.extend("de.demo.timepicker.controller.App", {
		onInit : function () {

			var oModel = new JSONModel();
			var oData = {
				time : "0130"
			};
			oModel.setData(oData);

			this.getView().setModel(oModel, "someSourceModel");

		},
		onTimeChange : function (oEvent) {
			var sValue = oEvent.getParameter("newHhmmss");
			this.byId("showText").setText(sValue);
		}

	});
});
