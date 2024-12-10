let ReviewModule = document.createElement("div");
ReviewModule.setAttribute("id", "ReviewModuleContainer");
document.querySelector("body").appendChild(ReviewModule);

var ReviewWidget = new CommonWidget("ReviewModuleContainer", "ReviewModule");
ReviewWidget.setEventListener(function (event, payload) {
  console.log(event, payload);
});
ReviewWidget.init({
  Cards: {
    PreviousPage: {
      cardType: "PreviousPage",
      span: 12,
      logo: "http://localhost:3773/icons/Frame%202353.svg",
      previous: (option) => console.log(15, "Go To Previous Page", option),
    },
    PaymentDetails: {
      heading: "Review Details",
      cardType: "PaymentDetails",
      span: 12,
      insurerName: "Tata AIG",
      insurerLogo: "http://localhost:3773/icons/logos-square.svg",
      insurerPlan: "Travel Guard Silver Plus",
      Details: [
        {
          "Sum Insured": "1,00,000",
          "Member Covered": "You, Spouse, 1 Kid",
          "Travelling To": "Bhutan, Nepal, China, Bangladesh",
          "Trip Starting": "17 May 2022",
          "Trip Ending": "22 May 2022",
        },
      ],
      amount: "₹13,800",
      amountSubheading: "(Inclusive GST)",
      onLoad: function (step, next) {
        // Array of countries to string
        let str = step.fields.Details[0]["TravellingTo"]
          .toString()
          .replace(/,/g, ", ");
        // Object of Travelling Members to string
        let obj = step.fields.Details[0]["Member Covered"];
        let str2 = "";
        if (obj.selfCheckBox) str2 += "You, ";
        if (obj.spouseCheckBox) str2 += "Spouse, ";
        if (obj.sonCheckBox || obj.daughterCheckBox) {
          let total = obj.daughterCheckBox + obj.sonCheckBox;
          if (total == 1) {
            str2 += total.toString() + " Kid, ";
          } else {
            str2 += total.toString() + " Kids, ";
          }
        }
        if (obj.fatherCheckBox) str2 += "Father, ";
        if (obj.motherCheckBox) str2 += "Mother";
        step.fields.Details[0]["TravellingTo"] = str;
        step.fields.Details[0]["Member Covered"] = str2;
        next(step);
      },
    },
    TravellerDetails: {
      edit: (option) => console.log(58, "editTravellers", option),
      heading: "Travellers Details",
      subheading: "Proposer",
      cardType: "TravellerDetails",
      span: 12,
      Proposer: [
        {
          DOB: "20 May 1991",
          Gender: "Male",
          Mobile: "97160 41xxx",
          Email: "yarujxxxxxxx@gmail.com",
          Address:
            "131, Mohyal Colony, Mata Mandir Road, Sector 40, Gurugram, Haryana 122003",
          "Visa Type": "Travel",
          "Passport No.": "D3456789",
        },
      ],
      Members: [
        {
          Member: "Ankita",
          DOB: "20 May 1991",
          Gender: "Female",
          "Visa Type": "Travel",
          "Passport N0.": "D3456789",
        },
      ],
    },
    NomineeDetails: {
      cardType: "NomineeDetails",
      subheading: "Nominee",
      edit: (option) => console.log(88, "editNominee", option),
      Nominee: [
        {
          Name: "Kavita",
          Relation: "Spouse",
        },
      ],
    },
    PremiumBreakup: {
      heading: "Premium Breakup",
      cardType: "PremiumBreakup",
      span: 12,
      Premium: [
        {
          "Plan Premium": "₹1,727",
          GST: "+ ₹134",
        },
      ],
      TotalPayable: "+ ₹12,273",
    },
    MakePayment: {
      cardType: "MakePayment",
      span: 12,
      amount: "₹13,800",
      amountSubheading: "(Inclusive GST)",
      onCTAClick:function(){
        console.log("Make Payment clicked")
      }
    },
  },
});
