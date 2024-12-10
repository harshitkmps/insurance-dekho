/**
 * Redux Saga : "LoginListing"
 * Purpose : Generator functions that deals with ajax calls and performs followup action
 */
import validator from "validator";
import processCustomFieldType from '../../utils/processCustomFieldType'

class FieldValidator {
  constructor(field, customValidators) {
    this.customValidators = customValidators;
    this.field = field;
    this.validateField = this.validateField.bind(this);
    this.build = this.build.bind(this);
    this.checkIfValidationFailed = this.checkIfValidationFailed.bind(this);
  }

  validateField() {
    let isMasked = ["mobile", "email"].includes(this.field.name) && this.field.value && this.field.value.includes("***");
    if(this.field.hide === true || isMasked){
      this.field.error = false;
      this.field.helperText = "";
      return;
    }
    let hasError = false;
    let helperText = "";
    let validators = this.field.validators || [];
    let errormessages = this.field.errormessages || [];
    if(validators.length > 0){
      this.field.error = false;
      this.field.helperText = "";
    }
    let currentValue = this.field.value || "";
    let out = { error: hasError, helperText: helperText };

    if (!(this.field.validators && Array.isArray(this.field.validators))) {
      return out;
    }

    for (let i = 0; i < validators.length; i++) {
      let v = validators[i];
      if (this.checkIfValidationFailed(v, currentValue)) {
        this.field.error = true;
        this.field.helperText = errormessages[i];
        break;
      }
    }

    return out;
  }

  /**
   *
   * @returns list of validation methods in validator library which requires second parameter as locale
   */
  getFunctionsWithLocales() {
    return [
      "isMobilePhone",
      "isAlpha",
      "isAlphanumeric",
      "isIdentityCard",
      "isLicensePlate",
    ];
  }

  processValidation(v) {
    let options = false;
    if (Array.isArray(v)) {
      options = v[1];
      v = v[0];
      return [v, options];
    }
    return [v, options];
  }

  checkIfValidationFailed(validation, val) {
    let [v, options] = this.processValidation(validation);

    let isValidationNegative = false;
    if (v.startsWith("!")) {
      v = v.replace("!", "");
      isValidationNegative = true;
    }

    let params = [new String(val)];
    if (this.getFunctionsWithLocales().includes(v)) {
      params.push("en-IN");
    }
    if (options) {
      params.push(options);
    }

    //check if custom validator exists
    if (!validator[v] && this.customValidators[v]) {
      return this.checkValidation(isValidationNegative,this.customValidators[v], params);
    }
    return this.checkValidation(isValidationNegative, validator[v], params);
  }

  checkValidation(isValidationNegative, val, params) {
    return (
      val &&
      (isValidationNegative
        ? !val.apply(this, params)
        : val.apply(this, params))
    );
  }

  build() {
    return this.validateField();
  }
}

class FormValidator {

  constructor(step, customValidators) {
    this.customValidators = customValidators;
    this.step = step;
    this.fields = step.fields;
    this.validate = this.validate.bind(this);
    this.build = this.build.bind(this);
  }

  validate() {
    Object.keys(this.fields).map((field) => {
      new FieldValidator(this.fields[field], this.customValidators).build();
      if (this.fields[field].error) {
        this.step.errors = this.step.errors || {};
        this.step.errors[field] = this.fields[field].helperText;
      } else if (this.step.errors && this.step.errors[field]) {
        delete this.step.errors[field];
      }
    });
  }

  build() {
    return this.validate();
  }
}


export function* initReactFormBuilder({ payload }) {
  try {
    let steps = payload.steps;
    for (let stepName in steps) {
      let step = steps[stepName];
      for (let fieldName in step.fields) {
        processCustomFieldType(step.fields[fieldName]);
      }
    }
  } catch (error) {
    console.log("error", error);
  }
}

export function* validateFieldValue({ payload }) {
  try {
    let fieldValidator = new FieldValidator(
      payload.field,
      payload.customValidators
    );
    fieldValidator.build();
  } catch (error) {
    console.log("error", error);
  }
}

export function* validateAndSubmitFromStep({ payload }) {
  try {
    // console.log("validateAndSubmitFromStep saga", payload);
    let formValidator = new FormValidator(
      payload.step,
      payload.customValidators
    );
    formValidator.build();
  } catch (error) {
    console.log("error", error);
  }
}
