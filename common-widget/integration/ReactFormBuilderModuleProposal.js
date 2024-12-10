let ReactFormBuilderModuleContainer = document.createElement("div");
ReactFormBuilderModuleContainer.setAttribute(
  "id",
  "ReactFormBuilderModuleContainer"
);
document.querySelector("body").appendChild(ReactFormBuilderModuleContainer);

var formBuilder = new CommonWidget(
  "ReactFormBuilderModuleContainer",
  "ReactFormBuilderModule"
);

formBuilder.init({
  formBuilder: {
    heading : "Travellers details",
    note:"Nominee should be 18+ years",
    progressBarType:"bullet",
    steps: [
      // {
      //   name: "Owner Details",
      //   submitButtonLabel: "Continue",
      //   fields: {
      //     petHeading:{
      //       type:"HeadingComp",
      //       id:"petHeading",
      //       name:"petHeading",
      //       label:"Basic Details",
      //       span:12,
      //     },
      //     dob: {
      //       type: "DatePicker",
      //       id: "dob",
      //       name: "dob",
      //       label: "Owner’s date of birth",
      //       variant: "filled",
      //       maxDate:'2022-01-01',
      //       minDate:'1990-01-01',
      //       span: 12,
      //       validators: ["isEmpty"],
      //       errormessages: ["This field is required"],
      //     },
      //     email: {
      //       type: "TextField",
      //       id: "email",
      //       name: "email",
      //       label: "Email",
      //       multiline : false,
      //       variant: "filled",
      //       // value: "saurabh@jain.com",
      //       span: 12,
      //       fieldType: "email",
      //       validators: ["isEmpty"],
      //       errormessages: ["This field is required"],
      //     },
      //     petHeading1:{
      //       type:"HeadingComp",
      //       id:"petHeading1",
      //       name:"petHeading1",
      //       label:"Address",
      //       span:12,
      //     },
      //     pincode:{
      //       type: "Pincode",
      //       id: "pincode",
      //       name: "pincode",
      //       label: "Pincode",
      //       multiline : false,
      //       variant: "filled",
      //       stateRequired : false ,
      //       // fieldType : "pincode",
      //       span: 12,
      //       validators: ["isEmpty"],
      //       errormessages: ["This field is required"],
      //       onChange: (event, step, next) => {
      //       let storeCityName = step.fields.pincode.value.city_name;
      //       let storeStateName=step.fields.pincode.value.state_name;
      //       step.fields["state"]["value"] = storeStateName;
      //       step.fields["city"]["value"] = storeCityName;
      //       next(step);
      //       },
      //     },
      //     state: 
      //     {
      //       type: "TextField",
      //       id: "state",
      //       name: "state",
      //       label: "State",
      //       value :"" ,
      //       readOnly : "true",
      //       variant: "filled",
      //       span: 12,
      //       validators: ["isEmpty"],
      //       errormessages: ["This field is required"],
      //   },
          
      //     city: {
      //       type: "TextField",
      //       id: "city",
      //       name: "city",
      //       label: "City",
      //       value : "",
      //       readOnly : "true",
      //       autoComplete: "given-name",
      //       variant: "filled",
      //       span: 12,
      //       validators: ["isEmpty"],
      //       errormessages: ["This field is required"],
      //     },
      //     address: {
      //       type: "TextField",
      //       id: "address",
      //       name: "address",
      //       label: "House No, Street, Building, Area",
      //       variant: "filled",
      //       // multiline : true,
      //       span: 12,
      //       validators: ["isEmpty"],
      //       errormessages: ["This field is required"],
      //     },
      //   },
      // },
      {
        name: "You",
        submitButtonLabel: "Save & Continue",
        fields: {
          yesNo: {
            type: "YesNoComp",
            id: "yesNo",
            name: "yesNo",
            label: "Have you lost any Pet Dog/s during the last three years?",
            validators: ["isEmpty"],
            errormessages: [
             "This field is required",
            ],
            options: [
              { value: "no", label: "No"},
            { value: "yes", label: "Yes"},
            ],
          },
          personname: {
            type: "TextField",
            id: "personname",
            name: "personname",
            label: "Full name",
            multiline : false,
            variant: "filled",
            span: 12,
            validators: ["isEmpty"],
            errormessages: ["This field is required"],
          },

          gender: {
            type: "Radio",
            options: [
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ],
            row : true,
            id: "gender",
            name: "gender",
            label: "Gender",
            labelPlacement:"start",
            variant: "filled",
            titlePlacement:"start",
            span: 12,
            value: "",
            validators: ["isEmpty"],
            errormessages: ["Gender is required field"],
          },
          dob: {
            type: "DatePicker",
            id: "dob",
            name: "dob",
            label: "Date of birth",
            variant: "filled",
            maxDate:'2022-01-01',
            minDate:'1990-01-01',
            span: 12,
            validators: ["isEmpty"],
            errormessages: ["This field is required"],
          },
          mobile: {
            type: "TextField",
            id: "mobile",
            name: "mobile",
            label: "Phone",
            multiline : false,
            variant: "filled",
            span: 12,
            fieldType: "mobile",
            validators: ["isEmpty"],
            errormessages: ["This field is required"],
          },
          email: {
            type: "TextField",
            id: "email",
            name: "email",
            label: "Email",
            multiline : false,
            variant: "filled",
            span: 12,
            fieldType: "email",
            validators: ["isEmpty"],
            errormessages: ["This field is required"],
          },
          passportnumber: {
            type: "TextField",
            id: "passportnumber",
            name: "passportnumber",
            label: "Passport Number",
            multiline : false,
            variant: "filled",
            span: 12,
            fieldType: "passportNumber",
            validators: ["isEmpty" , ["!isPassportNumber", "IN"]],
            errormessages: ["This field is required","Enter a valid Passport Number"],
          },
          typeofvisa: {
            type: "TextField",
            id: "typeofvisa",
            name: "typeofvisa",
            label: "Type of VISA",
            multiline : false,
            variant: "filled",
            span: 12,
            validators: ["isEmpty"],
            errormessages: ["This field is required"],
          },
          pincode:{
            type: "Pincode",
            id: "pincode",
            name: "pincode",
            label: "Pincode",
            multiline : false,
            variant: "filled",
            stateRequired : false ,
            span: 12,
            validators: ["isEmpty"],
            errormessages: ["This field is required"],
            onChange: (event, step, next) => {
            let storeCityName = step.fields.pincode.value.city_name;
            let storeStateName=step.fields.pincode.value.state_name;
            step.fields["state"]["value"] = storeStateName;
            step.fields["city"]["value"] = storeCityName;
            next(step);
            },
          },
          state: 
          {
            type: "TextField",
            id: "state",
            name: "state",
            label: "State",
            value :"" ,
            readOnly : "true",
            variant: "filled",
            span: 12,
            validators: ["isEmpty"],
            errormessages: ["This field is required"],
        },
          
          city: {
            type: "TextField",
            id: "city",
            name: "city",
            label: "City",
            value : "",
            readOnly : "true",
            autoComplete: "given-name",
            variant: "filled",
            span: 12,
            validators: ["isEmpty"],
            errormessages: ["This field is required"],
          },
          address: {
            type: "TextField",
            id: "address",
            name: "address",
            label: "Address",
            variant: "filled",
            multiline : true,
            span: 12,
            validators: ["isEmpty"],
            errormessages: ["This field is required"],
          },
        },
        onSubmit: function (data, resolve, reject) {
          console.log("personal_details onSubmit", data);
          if (data.age < 18) {
            reject({ message: "Age of driver cannot be less than 18" });
          } else {
            resolve({ message: "" });
          }
        },
      },
      {
        name: "Spouse",
        submitButtonLabel: "Save & Continue",
        fields: {
          spousename: {
            type: "TextField",
            id: "spousename",
            name: "spousename",
            label: "Name",
            multiline : false,
            variant: "filled",
            // value: "saurabh@jain.com",
            span: 12,
            validators: ["isEmpty"],
            errormessages: ["This field is required"],
          },
          genderspouse: {
            type: "Radio",
            options: [
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ],
            id: "genderspouse",
            name: "genderspouse",
            label: "Gender",
            row : true,
            labelPlacement:"start",
            variant: "filled",
            titlePlacement:"start",
            span: 9,
            value: "",
            validators: ["isEmpty"],
            errormessages: ["Gender is required field"],
          },
          passportnumberspouse: {
            type: "TextField",
            id: "passportnumberspouse",
            name: "passportnumberspouse",
            label: "Passport Number",
            multiline : false,
            variant: "filled",
            // fieldType : passport,
            span: 12,
            validators: ["isEmpty" , ["!isPassportNumber", "IN"]],
            errormessages: ["This field is required","Enter a valid Passport Number"],
          },
          typeofvisaspouse: {
            type: "TextField",
            id: "typeofvisaspouse",
            name: "typeofvisaspouse",
            label: "Type of VISA",
            multiline : false,
            variant: "filled",
            // fieldType : passport,
            span: 12,
            validators: ["isEmpty"],
            errormessages: ["This field is required"],
          },
          dobspouse: {
            type: "DatePicker",
            id: "dobspouse",
            name: "dobspouse",
            label: "Date of birth",
            variant: "filled",
            maxDate:'2022-01-01',
            minDate:'1990-01-01',
            span: 12,
            validators: ["isEmpty"],
            errormessages: ["This field is required"],
          },
        },
        onSubmit: function (data, resolve, reject) {
          console.log("personal_details onSubmit", data);
          if (data.age < 18) {
            reject({ message: "Age of driver cannot be less than 18" });
          } else {
            resolve({ message: "" });
          }
        },
      },
      {
        name: "Select Proposer",
        submitButtonLabel: "Save & Continue",
        fields: {
            gender: {
                type: "Radio",
                options: [
                  { value: "you", label: "You" },
                  { value: "spouse", label: "Spouse" },
                ],
                id: "gender",
                name: "gender",
                appearence:"buttonRadio",
                // label: "",
                // labelPlacement:"start",
                variant: "filled",
                span: 12,
                value: "",
                validators: ["isEmpty"],
                errormessages: ["This is required field"],
              },
            hintbubble:{
              type:"Hint",
              id:"hintbubble",
              name:"hintbubble",
              label:"Proposer is the person who has applied for the policy and is paying the premium on it. It can be different from the insured person",
          },
        },
        onSubmit: function (data, resolve, reject) {
          console.log("personal_details onSubmit", data);
          if (data.age < 18) {
            reject({ message: "Age of driver cannot be less than 18" });
          } else {
            resolve({ message: "" });
          }
        },
      },
      {
        name: "Nominee Details",
        note:"Nominee should be 18+ years",
        submitButtonLabel: "Save & Continue",
        fields: {
            personname: {
                type: "TextField",
                id: "personname",
                name: "personname",
                label: "Full name",
                multiline : false,
                variant: "filled",
                span: 12,
                validators: ["isEmpty"],
                errormessages: ["This field is required"],
              },
              relation: {
                type: "Autocomplete",
                options: [
                  { value: "wife", label: "Wife" },
                  { value: "husband", label: "Husband" },
                  { value: "brother", label: "Brother" },
                  { value: "sister", label: "Sister" },
                  { value: "father", label: "Father" },
                  { value: "mother", label: "Mother" },
                  { value: "uncle", label: "Uncle" },
                  { value: "aunt", label: "Aunt" },
                ],
                id: "relation",
                name: "relation",
                label: "Relation with insured",
                autoComplete: "given-name",
                variant: "filled",
                span: 12,
                validators: ["isEmpty"],
                errormessages: ["This field is required"],
              },
          //   hintbubble:{
          //     type:"Hint",
          //     id:"hintbubble",
          //     name:"hintbubble",
          //     label:"Nominee is a person's legitimate right on the proceeds of the policy.",
          // },
        },
        onSubmit: function (data, resolve, reject) {
          console.log("personal_details onSubmit", data);
          if (data.age < 18) {
            reject({ message: "Age of driver cannot be less than 18" });
          } else {
            resolve({ message: "" });
          }
        },
      }, 
      {
        name: "Select Proposer",
        submitButtonLabel: "Save & Continue",
        fields: {
            gender: {
                type: "Radio",
                options: [
                  { value: "you", label: "You" },
                  { value: "spouse", label: "Spouse" },
                ],
                id: "gender",
                name: "gender",
                variant : "filled",
                appearence:"buttonRadio",
                span: 12,
                value: "",
                validators: ["isEmpty"],
                errormessages: ["This is required field"],
              },
            hintbubble:{
              type:"Hint",
              id:"hintbubble",
              name:"hintbubble",
              label:"Proposer is the person who has applied for the policy and is paying the premium on it.",
          },
        },
        onSubmit: function (data, resolve, reject) {
          console.log("personal_details onSubmit", data);
          if (data.age < 18) {
            reject({ message: "Age of driver cannot be less than 18" });
          } else {
            resolve({ message: "" });
          }
        },
      }, 
      {
        name: "Select Proposer",
        submitButtonLabel: "Save & Continue",
        fields: {
            gender: {
                type: "Radio",
                options: [
                  { value: "you", label: "You" },
                  { value: "spouse", label: "Spouse" },
                ],
                id: "gender",
                name: "gender",
                appearence:"buttonRadio",
                variant: "filled",
                span: 12,
                value: "",
                validators: ["isEmpty"],
                errormessages: ["This is required field"],
              },
              mobile: {
                type: "TextField",
                id: "mobile",
                name: "mobile",
                label: "Phone",
                multiline : false,
                variant: "filled",
                span: 12,
                fieldType: "mobile",
                validators: ["isEmpty"],
                errormessages: ["This field is required"],
              },
              email: {
                type: "TextField",
                id: "email",
                name: "email",
                label: "Email",
                multiline : false,
                variant: "filled",
                span: 12,
                fieldType: "email",
                validators: ["isEmpty"],
                errormessages: ["This field is required"],
              },
            hintbubble:{
              type:"Hint",
              id:"hintbubble",
              name:"hintbubble",
              label:"Proposer is the person who has applied for the policy and is paying the premium on it. It can be different from the insured person",
          },
        },
        onSubmit: function (data, resolve, reject) {
          console.log("personal_details onSubmit", data);
          if (data.age < 18) {
            reject({ message: "Age of driver cannot be less than 18" });
          } else {
            resolve({ message: "" });
          }
        },
      },
    ],
    activeStep: 0,
    customValidators: {
      isFullName: function (str) {
        var regexp = new RegExp(
          /^[a-z]([-']?[a-z]+)*( [a-z]([-']?[a-z]+)*)+$/i
        );
        return regexp.test(str);
      },
    },
  },
}
);