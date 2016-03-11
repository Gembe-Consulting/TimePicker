sap.ui.define([
        "sap/ui/commons/ComboBox",
        "sap/ui/core/format/DateFormat"
    ], function (ComboBox, DateFormat) {
    "use strict";

    var TimePicker = ComboBox.extend("de.demo.timepicker.control.timepicker.TimePicker", {

            metadata : {

                properties : {

                    /**
                     * Defines the time as a "HHmm" string, independent from the format used. The inherited textField "value" attribute uses the time format as configured via the locale.
                     * The date is interpreted as gregorian date
                     */
                    HHmm : {
                        type : "string",
                        group : "Misc",
                        defaultValue : null
                    },
                    /**
                     * Source Pattern
                     */
                    timeSourcePattern : {
                        type : "string",
                        group : "Misc",
                        defaultValue : "HHmm",
                        bindable : false
                    },
                    /**
                     * Display Pattern
                     */
                    timeFormatStyle : {
                        type : "string",
                        group : "Misc",
                        defaultValue : "short",
                        bindable : false
                    },
                    /**
                     *
                     */
                    predefinedTimeValuesUrl : {
                        type : "string",
                        group : "Misc",
                        defaultValue : null
                    },
                    /**
                     *
                     */
                    predefinedTimeValuesPath : {
                        type : "string",
                        group : "Misc",
                        defaultValue : null
                    }
                }
            }
        });
    (function () {
        /**
         * Initializes the control.
         * It is called from the constructor.
         * @private
         */
        TimePicker.prototype.init = function () {

            ComboBox.prototype.init.apply(this, arguments);

            var sTimeFormatStyle = this.getTimeFormatStyle();
            var sTimeSourcePattern = this.getTimeSourcePattern();

            this._oFormatHHmm = DateFormat.getTimeInstance({
                    style : sTimeFormatStyle,
                    strictParsing : true
                });

            this._oParseHHmm = DateFormat.getTimeInstance({
                    source : {
                        pattern : sTimeSourcePattern
                    },
                    strictParsing : true
                });

            this._oMinDate = new Date(1, 0, 1);
            this._oMinDate.setFullYear(1); // otherwise year 1 will be converted to year 1901
            this._oMaxDate = new Date(9999, 11, 31, 23, 59, 59, 99);
            this._oDate = new Date();

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setSizeLimit(300); //set iSizeLimit to 300 (default: 100) to see all time items
            oModel.loadData("./data/TimeValues.json");
            this.setModel(oModel);

            var oListItemTemplate = new sap.ui.core.ListItem({
                    text : {
                        path : "text",
                        type : new sap.ui.model.type.Time({
                            source : {
                                pattern : sTimeSourcePattern
                            },
                            style : sTimeFormatStyle
                        }),
                        mode : sap.ui.model.BindingMode.OneTime
                    },
                    key : {
                        path : "key",
                        mode : sap.ui.model.BindingMode.OneTime
                    }
                });

            this.bindItems({
                path : "/timeValues",
                template : oListItemTemplate,
                mode : sap.ui.model.BindingMode.OneTime
            });

        };

        TimePicker.prototype.exit = function () {

            this._oDate = undefined;

        };

        TimePicker.prototype.setValue = function (sValue) {

            var sOldValue = this.getValue();
            if (sValue == sOldValue) {
                return this;
            }

            this.setProperty("value", sValue, true);
            this._bValueSet = true;

            if (sValue) {
                this._oDate = this._parseValue(sValue);
                if (!this._oDate || this._oDate.getTime() < this._oMinDate.getTime() || this._oDate.getTime() > this._oMaxDate.getTime()) {
                    this._oDate = undefined;
                    jQuery.sap.log.error("Value can not be converted to a valid time", this);
                }
            } else {
                this._oDate = undefined;
            }

            var sHHmm = "";
            if (this._oDate) {
                sHHmm = this._oFormatHHmm.format(this._oDate);
            }

            this.setProperty("HHmm", sHHmm, true);

            if (this.getDomRef()) {
                // update value in input field
                var sOutputValue = "";
                var $Input = jQuery(this.getInputDomRef());
                if (this._oDate) {
                    // format date again - maybe value uses not the right pattern ???
                    sOutputValue = sValue;
                }
                $Input.val(sOutputValue);
            }

            return this;

        };

        /**
         * Parses a time string into a Date object
         * Using sap.ui.core.format.DateFormat.getTimeInstance().parse()
         */
        TimePicker.prototype._parseValue = function (sValue) {
            // convert to date object
            var oDate = this._oParseHHmm.parse(sValue);
            return oDate;
        };

        /**
         * Formats a Date object into a time string
         * Using sap.ui.core.format.DateFormat.getTimeInstance().format()
         */
        TimePicker.prototype._formatValue = function (oDate) {
            // convert to date object
            var sValue = this._oFormatHHmm.format(oDate);
            return sValue;
        };

        /**
         * Override default setter for proper formatting
         */
        TimePicker.prototype.setHHmm = function (sHHmm) {

            var sOldHHmm = this.getHHmm();
            if (sHHmm == sOldHHmm) {
                return this;
            }

            this.setProperty("HHmm", sHHmm, true);
            var sValue = "";

            if (sHHmm) {
                this._oDate = this._oFormatHHmm.parse(sHHmm);
                if (!this._oDate || this._oDate.getTime() < this._oMinDate.getTime() || this._oDate.getTime() > this._oMaxDate.getTime()) {
                    this._oDate = undefined;
                    jQuery.sap.log.error("Value can not be converted to a valid time", this);
                }
            } else {
                this._oDate = undefined;
            }

            if (this._oDate) {
                sValue = this._oFormatHHmm.format(this._oDate);
            }
            this.setProperty("value", sValue, true);

            if (this.getDomRef()) {
                // update value in combo box
                var sOutputValue = "";
                var $Input = jQuery(this.getInputDomRef());
                if (this._oDate) {
                    // format date again - maybe value uses not the right pattern ???
                    sOutputValue = sValue;
                }
                $Input.val(sOutputValue);
            }

            return this;

        };

    }());

    return TimePicker;

}, true);
