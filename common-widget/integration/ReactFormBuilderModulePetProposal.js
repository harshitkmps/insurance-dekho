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
      {
            name: "Dog Details",
            submitButtonLabel: "Continue",
            fields: {
                dogname: {
                    type: "TextField",
                    id: "dogname",
                    name: "dogname",
                    label: "Dog name",
                    multiline : false,
                    variant: "filled",
                    // value: "saurabh@jain.com",
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
                    label: "Dog gender",
                    labelPlacement:"start",
                    variant: "filled",
                    titlePlacement:"start",
                    span: 12,
                    value: "",
                    validators: ["isEmpty"],
                    errormessages: ["Gender is required field"],
                  },
                  petHeading1:{
                    type:"HeadingComp",
                    id:"petHeading1",
                    name:"petHeading1",
                    label:"Dog photos",
                    span:12,
                  },
                  identificationMarks: {
                    type: "TextField",
                    id: "identificationMarks",
                    name: "identificationMarks",
                    label: "Identification mark",
                    multiline : false,
                    variant: "filled",
                    // value: "saurabh@jain.com",
                    span: 12,
                    validators: ["isEmpty"],
                    errormessages: ["This field is required"],
                  },
                  petHeading2:{
                    type:"HeadingComp",
                    id:"petHeading2",
                    name:"petHeading2",
                    note:"note",
                    label:"Type “NONE” if there is no any identification",
                    span:12,
                  },
                  petHeading3:{
                    type:"HeadingComp",
                    id:"petHeading3",
                    name:"petHeading3",
                    // note:"note",
                    label:"Select the names of vaccinations provided to your dog",
                    span:12,
                  },
                  Rabies: {
                    type: "CheckBox",
                    id: "Rabies",
                    name: "Rabies",
                    label: "",
                    span: 12,
                    validators: [],
                    errormessages: [],
                    options: [
/*                     { value: ["check"], label: <div style={{display:"inline-block",}}>Rabies</div>},
                    { value: ["check"], label: <div style={{display:"inline-block",}}>Rabies</div>},
                    { value: ["check"], label: <div style={{display:"inline-block",}}>Rabies</div>},
                    { value: ["check"], label: <div style={{display:"inline-block",}}>Rabies</div>},
                    { value: ["check"], label: <div style={{display:"inline-block",}}>Rabies</div>},
                    { value: ["check"], label: <div style={{display:"inline-block",}}>Rabies</div>},
 */                    ],
                  },
                  petHeading4:{
                    type:"HeadingComp",
                    id:"petHeading4",
                    name:"petHeading4",
                    // note:"note",
                    label:"Microchip details on the dog (Optional)",
                    span:12,
                  },
                  microchipNum: {
                    type: "TextField",
                    id: "microchipNum",
                    name: "microchipNum",
                    label: "Microchip number",
                    multiline : false,
                    variant: "filled",
                    // value: "saurabh@jain.com",
                    span: 12,
                    validators: ["isEmpty"],
                    errormessages: ["This field is required"],
                  },
            },
      },
      {
        name: "Owner Details",
        submitButtonLabel: "Continue",
        fields: {
            Disp : {
                type: "Display",
                id: "Disp",
                name: "Disp",
                label: "Anurag Shukla",
                num:"Mobile : 98765 43210",
                image:"http://localhost:3773/icons/Group 3.svg",
            },
          petHeading:{
            type:"HeadingComp",
            id:"petHeading",
            name:"petHeading",
            label:"Basic Details",
            span:12,
          },
          dob: {
            type: "DatePicker",
            id: "dob",
            name: "dob",
            label: "Owner’s date of birth",
            variant: "filled",
            maxDate:'2022-01-01',
            minDate:'1990-01-01',
            span: 12,
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
            // value: "saurabh@jain.com",
            span: 12,
            fieldType: "email",
            validators: ["isEmpty"],
            errormessages: ["This field is required"],
          },
          petHeading1:{
            type:"HeadingComp",
            id:"petHeading1",
            name:"petHeading1",
            label:"Address",
            span:12,
          },
          pincode:{
            type: "Pincode",
            id: "pincode",
            name: "pincode",
            label: "Pincode",
            multiline : false,
            variant: "filled",
            stateRequired : false ,
            // fieldType : "pincode",
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
            label: "House No, Street, Building, Area",
            variant: "filled",
            // multiline : true,
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
        name: "Dog Details",
        submitButtonLabel: "Continue",
        fields: { 
            Disp : {
                type: "Display",
                id: "Disp",
                name: "Disp",
                label: "Labrador",
                num:"5 years old",
                image:"http://localhost:3773/icons/Dog.svg",
              },
            dogname: {
                type: "TextField",
                id: "dogname",
                name: "dogname",
                label: "Dog name",
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
                label: "Dog gender",
                labelPlacement:"start",
                variant: "filled",
                titlePlacement:"start",
                span: 12,
                value: "",
                validators: ["isEmpty"],
                errormessages: ["Gender is required field"],
              },
              petHeading1:{
                type:"HeadingComp",
                id:"petHeading1",
                name:"petHeading1",
                label:"Dog photos",
                span:12,
              },
              upload1 :{
                type:"Upload",
                id:"upload1",
                name:"upload1",
                icon:"http://localhost:3773/icons/Frame 2987.svg",
                label:"Front photo",
                span:6,
              },
              upload2 :{
                type:"Upload",
                id:"upload2",
                name:"upload2",
                label:"Left side photo" ,
                icon:"http://localhost:3773/icons/Frame 2987 (1).svg",
                span:6,
              },
              upload3 :{
                type:"Upload",
                id:"upload3",
                name:"upload3",
                label:"Right side photo",
                icon:"http://localhost:3773/icons/Frame 2987 (3).svg",
                span:12,
              },
              identificationMarks: {
                type: "TextField",
                id: "identificationMarks",
                name: "identificationMarks",
                label: "Identification mark",
                multiline : false,
                variant: "filled",
                // value: "saurabh@jain.com",
                span: 12,
                validators: ["isEmpty"],
                errormessages: ["This field is required"],
              },
              petHeading2:{
                type:"HeadingComp",
                id:"petHeading2",
                name:"petHeading2",
                note:"note",
                label:"Type “NONE” if there is no any identification",
                span:12,
              },
              petHeading3:{
                type:"HeadingComp",
                id:"petHeading3",
                name:"petHeading3",
                // note:"note",
                label:"Select the names of vaccinations provided to your dog",
                span:12,
              },
              Rabies: {
                type: "CheckBox",
                id: "Rabies",
                name: "Rabies",
                label: "",
                span: 12,
                validators: [],
                errormessages: [],
                options: [
                { value: "rabies", label: "Rabies"},
                { value: "distemper", label: "Distemper"},
                { value: "hepatitis", label: "Hepatitis"},
                { value: "adeno", label: "Adeno"},
                { value: "leptosirosis", label: "Leptosirosis"},
                ],
              },
              petHeading4:{
                type:"HeadingComp",
                id:"petHeading4",
                name:"petHeading4",
                // note:"note",
                label:"Microchip details on the dog (Optional)",
                span:12,
              },
              microchipNum: {
                type: "TextField",
                id: "microchipNum",
                name: "microchipNum",
                label: "Microchip number",
                multiline : false,
                variant: "filled",
                // value: "saurabh@jain.com",
                span: 12,
                validators: ["isEmpty"],
                errormessages: ["This field is required"],
              },
              petHeading5:{
                type:"HeadingComp",
                id:"petHeading5",
                name:"petHeading5",
                // note:"note",
                label:"Birth mark (Optional)",
                span:12,
              },
              upload4 :{
                type:"Upload",
                id:"upload4",
                name:"upload4",
                label:"Birth mark",
                icon:"http://localhost:3773/icons/Frame 2987 (2).svg",
                span:12,
              },
              petHeading6:{
                type:"HeadingComp",
                id:"petHeading6",
                name:"petHeading6",
                // note:"note",
                label:"Certificate of good health issued by a qualified veterinary doctor (Optional)",
                span:12,
              },
              upload5 :{
                type:"Upload",
                id:"upload5",
                name:"upload5",
                label:"Certificate",
                icon:"http://localhost:3773/icons/Frame 2987 (4).svg",
                span:12,
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
        name: "Addtional questions",
        submitButtonLabel: "Review Details",
        fields: {
            yesNo: {
                type: "YesNoComp",
                id: "yesNo",
                name: "yesNo",
                label: "Do you own any other dog apart from the one you are insuring?",
                validators: ["isEmpty"],
                errormessages: [
                 "This field is required",
                ],
                options: [
                  { value: "no", label: "No"},
                { value: "yes", label: "Yes"},
                ],
              },
              yesNo1: {
                type: "YesNoComp",
                id: "yesNo1",
                name: "yesNo1",
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
              yesNo2: {
                type: "YesNoComp",
                id: "yesNo2",
                name: "yesNo2",
                label: "Do you have access to a Veterinary Doctor for your Pet Dog(s)",
                validators: ["isEmpty"],
                errormessages: [
                 "This field is required",
                ],
                options: [
                  { value: "no", label: "No"},
                { value: "yes", label: "Yes"},
                ],
              },
              yesNo3: {
                type: "YesNoComp",
                id: "yesNo3",
                name: "yesNo3",
                label: "Do you use dog for commercial purposes?",
                validators: ["isEmpty"],
                errormessages: [
                 "This field is required",
                ],
                options: [
                  { value: "no", label: "No"},
                { value: "yes", label: "Yes"},
                ],
              },
          petHeading1:{
            type:"HeadingComp",
            id:"petHeading1",
            name:"petHeading1",
            label:"Let us know your previous dog insurance experience for the last 3 years. (Optional)",
            span:12,
          },
          Exp: {
            type: "CheckBox",
            id: "Exp",
            name: "Exp",
            label: "",
            span: 12,
            validators: [],
            errormessages: [],
            options: [
            { value: "1", label: "Insurer declined insurance of any of you pet dogs"},
            { value: "2", label: "Insurer declined to renew the insurance"},
            { value: "3", label: "Insurer increased your premium or imposed special conditions on renewal"},
            { value: "4", label: "None of the above"}
            ],
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