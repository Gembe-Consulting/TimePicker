// Provides default renderer for control Time Picker
sap.ui.define(['sap/ui/commons/ComboBoxRenderer', 'sap/ui/core/Renderer'],
	function(ComboBoxRenderer, Renderer) {
	"use strict";


	/**
	 * Renderer for the Time Picker
	 */
	var TimePickerRenderer = Renderer.extend(ComboBoxRenderer);


	TimePickerRenderer.renderExpander = function(rm, oCmb){

		rm.write("<div");
		rm.writeAttributeEscaped('id', oCmb.getId() + '-icon');
		rm.writeAttribute('unselectable', 'on');
		if ( sap.ui.getCore().getConfiguration().getAccessibility()) {
			rm.writeAttribute("role", "presentation");
		}
		rm.addClass("ciberUiTfTimePickerIcon");
		rm.writeClasses();
		rm.write(">&#9660;</div>");

	};

	return TimePickerRenderer;

}, true);
