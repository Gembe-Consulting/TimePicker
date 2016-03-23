sap.ui.define([
        "sap/ui/commons/ComboBox",
        "sap/ui/core/format/DateFormat",
        "sap/ui/model/type/Time"
    ], function (ComboBox, DateFormat, Time) {
   "use strict";

   var TimePicker = ComboBox.extend("de.demo.timepicker.control.timepicker.TimePicker", {

      metadata: {

         properties: {
            /**
             * Defines the time as a "HHmmss" string, independent from the format used.
             * The inherited sap.ui.commons.ComboBox "value" attribute uses the time format as configured via the locale.
             */
            hhmmss: {
               type: "string",
               group: "Misc",
               defaultValue: null
            },

            /**
             * Defines the style, e.g. "short", "medium" or "long", which is used to format time value within the listbox and the value field.
             * As default we will use the locale default style (medium most of the time).
             */
            style: {
               type: "string",
               group: "Misc",
               defaultValue: "medium"
            },

            /**
             * Defines the method how the time value list is created:
             * <ul>
             * <li>'0' of type <code>int</code> : No List is created.</li>
             * <li>'1/2/3/4/5/6/10/12/15/20/30' of type <code>int</code> : Creates a list depending on the given number.</li>
             * </ul>
             */
            timeValueListStep: {
               type: "int",
               group: "Misc",
               defaultValue: 0
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

            // The DateFormat class can be used to parse a string representing a date, time or datetime into a JavaScript date object and vice versa (also known as format).
            // The format pattern must be defined in LDML date format notation. The following options are available:
            // style: Can be "short", "medium", "long" or "full" and will use a locale dependent pattern
            // pattern: A date pattern in LDML date format notation
            // In case both, style and pattern, are defined, the pattern is used and the style ignored.

            // Setup a helper to for the hhmmss property
            this._oFormatHhmmss = DateFormat.getTimeInstance({
               pattern: "HHmmss", // Our data source will always provide this format
               strictParsing: true
            });

            // Locale represents a locale setting, consisting of a language, script, region, variants, extensions and private use section
            this._oLocale = sap.ui.getCore().getConfiguration().getLocale();

            this._oMinDate = new Date(1, 0, 1);
            this._oMinDate.setFullYear(1); // otherwise year 1 will be converted to year 1901
            this._oMaxDate = new Date(9999, 11, 31, 23, 59, 59, 99);
            this._oDate = new Date();
         };

         TimePicker.prototype.exit = function () {

            this._oDate = undefined;

         };

         TimePicker.prototype.onAfterRendering = function () {

            ComboBox.prototype.onAfterRendering.apply(this, arguments);

         };

         /*
          * Overwrite default setter for property "value":
          * 1) Check if value has been changed
          * 2) Update value property
          * 3) Update this.oDate by parsing value
          * 4) Update hhmmss property by formatting this.oDate
          * 5) Reformat and Write value to DOM
          */
         TimePicker.prototype.setValue = function (sValue) {

            var sOldValue = this.getValue();
            if (sValue == sOldValue) {
               return this;
            }

            if (sValue) {
               this._oDate = this._parseValue(sValue);
               if (!this._oDate || this._oDate.getTime() < this._oMinDate.getTime() || this._oDate.getTime() > this._oMaxDate.getTime()) {
                  this._oDate = undefined;
                  jQuery.sap.log.error("Value can not be converted to a valid time", this);
               }
            } else {
               this._oDate = undefined;
            }

            // format date again - maybe value uses not the right pattern
            sValue = this._formatValue(this._oDate);

            // Update value property
            this.setProperty("value", sValue, true);
            this._bValueSet = true;

            // Update hhmmss property
            var sHhmmss = "";
            if (this._oDate) {
               sHhmmss = this._oFormatHhmmss.format(this._oDate);
            }
            this.setProperty("hhmmss", sHhmmss, true);

            // Update value in combo box
            if (this.getDomRef()) {
               var sOutputValue = "";
               var $Input = jQuery(this.getInputDomRef());
               if (this._oDate) {
                  sOutputValue = sValue;
               }
               $Input.val(sOutputValue);
            }

            return this;

         };

         /**
          * Override default setter for proper formatting
          */
         TimePicker.prototype.setHhmmss = function (sHhmmss) {

            var sOldHhmmss = this.getHhmmss();
            if (sHhmmss == sOldHhmmss) {
               return this;
            }

            if (sHhmmss) {
               this._oDate = this._oFormatHhmmss.parse(sHhmmss);
               if (!this._oDate || this._oDate.getTime() < this._oMinDate.getTime() || this._oDate.getTime() > this._oMaxDate.getTime()) {
                  this._oDate = undefined;
                  jQuery.sap.log.error("Value can not be converted to a valid time", this);
               }
            } else {
               this._oDate = undefined;
            }


            // Update hhmmss property
            this.setProperty("hhmmss", sHhmmss, true);
            this._bHhmmssSet = true;

            // Update value property
            var sValue = "";
            if (this._oDate) {
               sValue = this._formatValue(this._oDate);
            }
            this.setProperty("value", sValue, true);

            // Update value in combo box
            if (this.getDomRef()) {
               var sOutputValue = "";
               var $Input = jQuery(this.getInputDomRef());
               if (this._oDate) {
                  sOutputValue = sValue;
               }
               $Input.val(sOutputValue);
            }

            return this;

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
                  "generatedHHmmss": []
               };

               for (var i = 0; i < iMinuteMaxIterator; i++) {
                  if ((i % (iStep)) == 0) {

                     //We need to prevent JS number calculation instead of string concatination
                     var hours = String(parseInt(i / MINSPERHOUR) % HOURSPERDAY);
                     var minutes = String(i % MINSPERHOUR);
                     var result = (hours.length == 1 ? "0" + hours : hours) + (minutes.length == 1 ? "0" + minutes : minutes) + "00";

                     oData.generatedHHmmss.push({
                        "text": result,
                        "key": counter
                     });

                     counter++;
                  }
               }
            }

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setSizeLimit(counter); //set iSizeLimit to counter (default: 100) to see all time items
            oModel.setData(oData);

            this.setModel(oModel);

            var sPattern = this._discoverOutputPattern();

            var oOutputType = new sap.ui.model.type.Time({
               source: {
                  pattern: "HHmmss"
               },
               pattern: sPattern
            });

            var oListItemTemplate = new sap.ui.core.ListItem({
               text: {
                  path: "text",
                  type: oOutputType
               },
               key: {
                  path: "key"
               }
            });

            this.bindItems({
               path: "/generatedHHmmss",
               template: oListItemTemplate
            });
         };

         TimePicker.prototype.setStyle = function (sStyle) {
            var sStyleOld = this.getStyle();
            if (sStyleOld == sStyle) {
               return this;
            }

            // Check if property is valid. If not, set default style "medium"
            if (sStyle !== "short" && sStyle !== "medium" && sStyle !== "long") {
               sStyle = "medium";
            }

            this.setProperty("style", sStyle, true);
            this._bStyleSet = true;

            //repopulate value list if it has already been set
            if (this._bTimeValueListStepSet) {
               this._bTimeValueListStepSet = undefined; //reset flag to allow repopulating
               this.setTimeValueListStep(this.getTimeValueListStep());
            }
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
               newValue: this.getValue(),
               newHhmmss: this.getHhmmss(),
               invalidValue: bInvalidValue
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

            jQuery.sap.log.info("TimePicker " + this.getId() + ": parsing value " + sValue);

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

            jQuery.sap.log.info("TimePicker " + this.getId() + ": formatting date " + oDate.toLocaleString());

            // convert to date object
            var sValue = oFormat.format(oDate);
            return sValue;

         };

         TimePicker.prototype._discoverOutputPattern = function () {

            var sPattern = "";

            var oBinding = this.getBinding("value");

            //First check if value is given by binding and if binding type is a instance of sap.ui.model.type.Time
            //If yes, we use the pattern given by binding type
            if (oBinding && oBinding.oType && (oBinding.oType instanceof Time)) {
               sPattern = oBinding.oType.getOutputPattern();
            }

            // Pattern not defined by binding type?
            if (!sPattern) {

               var sStyle = this.getStyle();

               // LocaleData provides access to locale-specific data, like date formats, number formats, currencies, etc.
               var oLocaleData = new sap.ui.core.LocaleData(this._oLocale);

               sPattern = oLocaleData.getTimePattern(sStyle);

            }

            return sPattern;
         };

         /**
          * Returns the Formatter which is used to format the time value.
          * Format is eitehr defined by databinding or the value property, or by users lacale format.
          * The format patterns is defined in LDML Date Format notation.
          * For the output, the use of a style ("short, "medium", "long" or "full") instead of a pattern is preferred, as it will automatically use a locale dependent time pattern.
          */
         function _getFormatter(oThis) {

            var sPattern = oThis._discoverOutputPattern();

            oThis._oFormat = DateFormat.getTimeInstance({
               source: {
                  pattern: "HHmmss"
               },
               pattern: sPattern,
               strictParsing: true,
               relative: false
            }, oThis._oLocale);

            return oThis._oFormat;
         }
      }
      ());

   return TimePicker;

}, true);
