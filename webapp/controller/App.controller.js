sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/resource/ResourceModel"
	], function (Controller, JSONModel, ResourceModel) {
	"use strict";
	return Controller.extend("de.demo.timepicker.controller.App", {
		onInit : function () {

			var oDataModel = new JSONModel({
				time1: "223001",
				time2: "174502",
				time3: "174503",
				time4: "081506",
				time5: "100101",
				time6: "175832"
			});
			this.getView().setModel(oDataModel,"source");

		},
		onTimeChange : function (oEvent) {
			var sValue = oEvent.getParameter("newHhmmss");
			this.byId("showText").setText(sValue);
		}

	});
});
