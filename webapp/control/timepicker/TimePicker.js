sap.ui.define([
        "sap/ui/commons/ComboBox",
        "sap/ui/core/format/DateFormat",
        "sap/ui/model/type/Time"
    ], function (ComboBox, DateFormat, Time) {
    "use strict";

    var TimePicker = ComboBox.extend("de.demo.timepicker.control.timepicker.TimePicker", {

            metadata : {

                properties : {

                    /**
                     * Defines the time as a "HHmmss" string, independent from the format used.
                     * The inherited sap.ui.commons.ComboBox "value" attribute uses the time format as configured via the locale.
                     */
                    hhmmss : {
                        type : "string",
                        group : "Misc",
                        defaultValue : null
                    },
                    /**
                     * Defines the locale (language and country), e.g. "en-US", whose translations and Date formatters should be used to render the TimePicker.
                     * If the value property is bound to a model using a Date type the locale will be ignored, because the locale information of the model are used.
                     */
                    locale : {
                        type : "string",
                        group : "Misc",
                        defaultValue : null
                    },
                    /**
                     * Defines the style, e.g. "short", "medium" or "long", which is used to format time value within the listbox and the value field.
                     * We will use the locale default style (medium most of the time).
                     */
                    style : {
                        type : "string",
                        group : "Misc",
                        defaultValue : "medium"
                    },
                    /**
                     * Defines the method how the time value list is created:
                     * <ul>
                     * <li>'0' of type <code>int</code> : No List is created.</li>
                     * <li>'1/2/3/4/5/6/10/12/15/20/30' of type <code>int</code> : Creates a list depending on the given number. </li>
                     * </ul>
                     */
                    timeValueListStep : {
                        type : "int",
                        group : "Misc",
                        defaultValue : 0
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

            //var sTimeFormatStyle = this.getTimeFormatStyle();
            //var sTimeSourcePattern = this.getTimeSourcePattern();

            //Set up a helper to for the hhmmss property
            this._oFormatHhmmss = DateFormat.getTimeInstance({
                    pattern : "HHmmss",
                    strictParsing : true
                });

            this._oMinDate = new Date(1, 0, 1);
            this._oMinDate.setFullYear(1); // otherwise year 1 will be converted to year 1901
            this._oMaxDate = new Date(9999, 11, 31, 23, 59, 59, 99);
            this._oDate = new Date();
        };

        TimePicker.prototype.exit = function () {

            this._oDate = undefined;

            this._oLocale = undefined;

        };

        TimePicker.prototype.onAfterRendering = function () {

            ComboBox.prototype.onAfterRendering.apply(this, arguments);

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

            // Update hhmmss property
            var sHhmmss = "";
            if (this._oDate) {
                sHhmmss = this._oFormatHhmmss.format(this._oDate);
            }
            this.setProperty("hhmmss", sHhmmss, true);

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

        TimePicker.prototype.setLocale = function (sLocale) {

            var sOldLocale = this.getLocale();
            if (sLocale == sOldLocale) {
                return this;
            }

            // Saving the supplied locale:
            // "true" to suppress rendering. Rendering done on VALUE change.
            this.setProperty("locale", sLocale, true);

            var that = this;
            _checkLocaleAllowed(that);

            // get locale object and save it as it is used in the formatter
            this._oLocale = new sap.ui.core.Locale(sLocale);

            // to create new formatter according to locale
            this._sUsedPattern = undefined;

            // format value according to new locale
            var sValue = "";
            if (this._bValueSet) {
                // value was set, maybe locale set later -> parse again
                sValue = this.getValue();

                if (sValue) {
                    this._oDate = this._parseValue(sValue);
                    if (!this._oDate || this._oDate.getTime() < this._oMinDate.getTime() || this._oDate.getTime() > this._oMaxDate.getTime()) {
                        this._oDate = undefined;
                        jQuery.sap.log.warning("Value can not be converted to a valid date", this);
                    }
                } else {
                    this._oDate = undefined;
                }

                var sHhmmss = "";
                if (this._oDate) {
                    sHhmmss = this._oFormatHhmmss.format(this._oDate);
                }

                this.setProperty("hhmmss", sHhmmss, true);
            } else {
                // hhmmss set or date set -> format to value again
                if (this._oDate) {
                    sValue = this._formatValue(this._oDate);
                }
                this.setProperty("value", sValue, true);
            }

            //repopulate value list if it has already been set
            if (this._bTimeValueListStepSet) {
                this._bTimeValueListStepSet = undefined; //reset flag to allow repopulating
                this.setTimeValueListStep(this.getTimeValueListStep());
            }

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
         * Fire event change to attached listeners.
         *
         * Provides the following event parameters:
         * <ul>
         * <li>'newValue' of type <code>string</code> The new / changed value of the TimePicker.</li>
         * <li>'newHhmmss' of type <code>string</code> The new / changed Yyyymmdd of the TimePicker. </li>
         * <li>'invalidValue' of type <code>boolean</code> The new / changed value of the TimePicker is not a valid date. </li>
         * </ul>
         *
         * @param {boolean} bInvalidValue true is value is invalid
         * @return {TimePicker} <code>this</code> to allow method chaining
         * @protected
         */
        TimePicker.prototype.fireChange = function (bInvalidValue) {

            this.fireEvent("change", {
                newValue : this.getValue(),
                newHhmmss : this.getHhmmss(),
                invalidValue : bInvalidValue
            });

            return this;

        };

        /**
         * Parses a time string into a Date object
         * Using sap.ui.core.format.DateFormat.getTimeInstance().parse()
         */
        TimePicker.prototype._parseValue = function (sValue) {

            var that = this;

            var oFormat = _getFormatter(that);

            // convert to date object
            var oDate = oFormat.parse(sValue);
            return oDate;

        };

        /**
         * Formats a Date object into a time string
         * Using sap.ui.core.format.DateFormat.getTimeInstance().format()
         */
        TimePicker.prototype._formatValue = function (oDate) {

            var that = this;

            var oFormat = _getFormatter(that);

            // convert to date object
            var sValue = oFormat.format(oDate);
            return sValue;

        };

        /**
         * Returns the Formatter which is used to format the time value.
         * Format is eitehr defined by databinding or the value property, or by users lacale format.
         * The format patterns is defined in LDML Date Format notation.
         * For the output, the use of a style ("short, "medium", "long" or "full") instead of a pattern is preferred, as it will automatically use a locale dependent time pattern.
         */
        function _getFormatter(oThis) {

            var sPattern = "";
            var bRelative = false;
            var oBinding = oThis.getBinding("value");
            var oLocale;
            //First check if value is given by binding and if binding type is a instance of sap.ui.model.type.Time
            //If yes, we use the pattern given by binding type
            if (oBinding && oBinding.oType && (oBinding.oType instanceof Time)) {
                sPattern = oBinding.oType.getOutputPattern();
                bRelative = !!oBinding.oType.oOutputFormat.oFormatOptions.relative;
            }
            if (!sPattern) {
                // no databinding is used -> use pattern from controls locale or sap.ui.core
                oLocale = _getUsedLocale(oThis);
                var oLocaleData = sap.ui.core.LocaleData.getInstance(oLocale);

                var sStyle = oThis.getStyle();

                sPattern = oLocaleData.getTimePattern(sStyle);

            }
            if (sPattern != oThis._sUsedPattern) {
                oThis._sUsedPattern = sPattern;
                if (sPattern == "short" || sPattern == "medium" || sPattern == "long") {
                    oThis._oFormat = DateFormat.getTimeInstance({
                            style : sPattern,
                            strictParsing : true,
                            relative : bRelative
                        }, oLocale);
                } else {
                    oThis._oFormat = DateFormat.getTimeInstance({
                            pattern : sPattern,
                            strictParsing : true,
                            relative : bRelative
                        }, oLocale);
                }
            }
            return oThis._oFormat;
        }

        /**
         * Retruns the locale of the control, either from its locale property
         * or from sap.ui.core configuration.
         * See sapui5 help to learn how sap.ui.core discovers the locale and its format pattern.
         */
        function _getUsedLocale(oThis) {

            // Fetch and check if the Control locale can be supported:
            var sLocale = oThis.getLocale();

            var oLocale;
            if (sLocale) {
                var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();

                if (sLanguage != sLocale) {
                    jQuery.sap.log.error("TimePicker " + oThis.getId() + ": Using locale " + sLocale + " with different language " + sLanguage + " is not supported");
                    jQuery.sap.log.error("TimePicker " + oThis.getId() + ": Wont be able to parse user input. Setting _oLocale to default");

                    oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
                } else {
                    oLocale = oThis._oLocale;
                }
            } else {
                oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
            }
            return oLocale;
        }

        /**
         * Checks if a locale is given and a binding type is used at the same time
         * If binding type is used, we need to prevent the usage of controls locale property
         */
        function _checkLocaleAllowed(oThis) {

            var oBinding = oThis.getBinding("value");
            var sLocale = oThis.getLocale();

            if (oBinding && oBinding.oType && (oBinding.oType instanceof Time) && sLocale) {
                jQuery.sap.log.warning("TimePicker " + oThis.getId() + ": Using a locale and Databinding at the same time is not supported");
                oThis._bIgnoreLocale = true;
            }
        }

        /**
         * Override default setter for proper formatting
         */
        TimePicker.prototype.setHhmmss = function (sHhmmss) {

            var sOldHhmmss = this.getHhmmss();
            if (sHhmmss == sOldHhmmss) {
                return this;
            }

            this.setProperty("hhmmss", sHhmmss, true);
            var sValue = "";

            if (sHhmmss) {
                this._oDate = this._oFormatHhmmss.parse(sHhmmss);
                if (!this._oDate || this._oDate.getTime() < this._oMinDate.getTime() || this._oDate.getTime() > this._oMaxDate.getTime()) {
                    this._oDate = undefined;
                    jQuery.sap.log.error("Value can not be converted to a valid time", this);
                }
            } else {
                this._oDate = undefined;
            }

            if (this._oDate) {
                sValue = this._oFormatHhmmss.format(this._oDate);
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

        TimePicker.prototype.setStyle = function (sStyle) {
            var sStyleOld = this.getStyle();
            if (sStyleOld == sStyle) {
                return this;
            }

            this.setProperty("style", sStyle, true);

            //repopulate value list if it has already been set
            if (this._bTimeValueListStepSet) {
                this._bTimeValueListStepSet = undefined; //reset flag to allow repopulating
                this.setTimeValueListStep(this.getTimeValueListStep());
            }
        };

        TimePicker.prototype.setTimeValueListStep = function (iStep) {

            var iStepOld = this.getTimeValueListStep();
            if (this._bTimeValueListStepSet && iStep == iStepOld) {
                return this;
            }

            var HOURSPERDAY = 24;
            var MINSPERHOUR = 60;

            var iMinuteMaxIterator;

            switch (iStep) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 10:
            case 12:
            case 15:
            case 20:
            case 30:
            case 60:
                iMinuteMaxIterator = HOURSPERDAY * MINSPERHOUR;
                break;
            case 0:
                iMinuteMaxIterator = 0;
                break;
            default:
                jQuery.sap.log.error(iStep + " is not a valid step length. Must be 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60", this);
                return this;
            }

            this.setProperty("timeValueListStep", iStep, true);
            this._bTimeValueListStepSet = true;

            var oData = null;
            var counter = 0;

            if (iMinuteMaxIterator > 0) {

                oData = {
                    "generatedTimeValues" : []
                };

                for (var i = 0; i < iMinuteMaxIterator; i++) {
                    if ((i % (iStep)) == 0) {

                        //We need to preven JS calculation instead of concatination
                        var hours = String(parseInt(i / MINSPERHOUR) % HOURSPERDAY);
                        var minutes = String(i % MINSPERHOUR);
                        var result = (hours.length == 1 ? "0" + hours : hours) + (minutes.length == 1 ? "0" + minutes : minutes);

                        oData.generatedTimeValues.push({
                            "text" : result,
                            "key" : result
                        });

                        counter++;
                    }
                }
            }

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setSizeLimit(counter); //set iSizeLimit to counter (default: 100) to see all time items
            oModel.setData(oData);

            this.setModel(oModel);

            var oLocale = _getUsedLocale(this);

            var sStyle = this.getStyle();

            var oLocaleData = sap.ui.core.LocaleData.getInstance(oLocale);
            var sPattern = oLocaleData.getTimePattern(sStyle);

            var oOutputType = new sap.ui.model.type.Time({
                    source : {
                        pattern : "HHmm"
                    },
                    pattern : sPattern
                });

            var oListItemTemplate = new sap.ui.core.ListItem({
                    text : {
                        path : "text",
                        type : oOutputType,
                        mode : sap.ui.model.BindingMode.OneTime
                    },
                    key : {
                        path : "key",
                        mode : sap.ui.model.BindingMode.OneTime
                    }
                });

            this.bindItems({
                path : "/generatedTimeValues",
                template : oListItemTemplate,
                mode : sap.ui.model.BindingMode.OneTime
            });
        };

    }
        ());

    return TimePicker;

}, true);
