export default function processCustomFieldType(field) {
  switch (field.fieldType) {
    case "mobile":
      {
        delete field.fieldType;
        field.autoComplete = "phone";
        field.inputProps = { ...field.inputProps, maxLength: 10 };
        field.validators = [...field.validators, "!isMobilePhone"];
        field.errormessages = [
          ...field.errormessages,
          "Please enter a valid mobile number",
        ];
      }
      break;
      // case "pincode":
      //   {
      //     delete field.fieldType;
      //     field.autoComplete = "pincode";
      //     field.inputProps = { ...field.inputProps, maxLength: 6 };
      //     field.validators = [...field.validators, "!isMobilePhone"];
      //     field.errormessages = [
      //       ...field.errormessages,
      //       "Please enter a valid pincode",
      //     ];
      //   }
      //   break;
    // case "passportNumber":
    //     {
    //       delete field.fieldType;
    //       field.autoComplete = "passportNumber";
    //       field.inputProps = { ...field.inputProps, maxLength: 8 };
    //       field.validators = [...field.validators, "!isPassportNumber(field.input , IN)"];
    //       field.errormessages = [
    //         ...field.errormessages,
    //         "Please enter a Passport Number",
    //       ];
    //     }
    //     break;
    case "email": {
      delete field.fieldType;
      field.autoComplete = "email";
      if(field.validators)field.validators = [...field.validators, "!isEmail"];
      if(field.errormessages)field.errormessages = [...field.errormessages, "Email is not valid"];
    }
  }
}
