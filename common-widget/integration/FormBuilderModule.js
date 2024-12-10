let FormBuilderModuleContainer = document.createElement("div");
FormBuilderModuleContainer.setAttribute("id", "FormBuilderModuleContainer");
document.querySelector("body").appendChild(FormBuilderModuleContainer);

var formBuilder = new CommonWidget(
  "FormBuilderModuleContainer",
  "FormBuilderModule"
);

formBuilder.init({
  initialSchema: {
    schema: {
      title: "Pincode Selector",
      type: "object",
      properties: {
        pincode: {
          type: "string",
          title: "Pincode",
        },
      },
    },
    options: {
      fields: {
        pincode: {
          type: "pincode",
          id: "pincode",
          events: ["change"],
        },
      },
      form: {
        attributes: {
          action: "http://httpbin.org/post",
          method: "post",
        },
        buttons: {
          submit: {
            title: "Send Form Data",
            click: function () {
              var val = this.getValue();
              if (this.isValid(true)) {
                alert("Valid value: " + JSON.stringify(val, null, "  "));
                this.ajaxSubmit().done(function () {
                  alert("Posted!");
                });
              } else {
                alert("Invalid value: " + JSON.stringify(val, null, "  "));
              }
            },
          },
        },
      },
    },
  },
  eventHandler: function (schemaBuilder, action, next) {
    switch (action.type) {
      case "form:load": {
        return schemaBuilder;
      }
    }
    return schemaBuilder;
  },
});
