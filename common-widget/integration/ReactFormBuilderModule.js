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
    stepsLayout:"Accordion",
    steps: [
      {
        heading: "You",
        submitButtonLabel: "Save & Continue",
        fields: {
          mobile: {
            type: "TextField",
            id: "mobile",
            name: "mobile",
            label: "Phone",
            multiline: false,
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
            multiline: false,
            variant: "filled",
            span: 12,
            fieldType: "email",
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
        heading: "Spouse",
        submitButtonLabel: "Save & Continue",
        fields: {
          spousename: {
            type: "TextField",
            id: "spousename",
            name: "spousename",
            label: "Name",
            multiline: false,
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
            row: true,
            labelPlacement: "start",
            variant: "filled",
            titlePlacement: "start",
            span: 9,
            value: "",
            validators: ["isEmpty"],
            errormessages: ["Gender is required field"],
          },

          typeofvisaspouse: {
            type: "TextField",
            id: "typeofvisaspouse",
            name: "typeofvisaspouse",
            label: "Type of VISA",
            multiline: false,
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
            maxDate: "2022-01-01",
            minDate: "1990-01-01",
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
        heading: "Select Proposer",
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
            appearence: "buttonRadio",
            // label: "",
            // labelPlacement:"start",
            variant: "filled",
            span: 12,
            value: "",
            validators: ["isEmpty"],
            errormessages: ["This is required field"],
          },
          hintbubble: {
            type: "Hint",
            id: "hintbubble",
            name: "hintbubble",
            label:
              "Proposer is the person who has applied for the policy and is paying the premium on it. It can be different from the insured person",
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
      checkMaxbreedsSelected: function (str) {
        //console.log(str)
        let arr = str.split(",");
        if (arr.length >= 1 && arr.length <= 10) return false;
        else return true;
      },
    },
  },
});
