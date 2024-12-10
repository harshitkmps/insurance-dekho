
let FormBuilderModuleContainer = document.createElement("div");
FormBuilderModuleContainer.setAttribute("id", "FormBuilderModuleContainer");
document.querySelector('body').appendChild(FormBuilderModuleContainer)


var formBuilder = new CommonWidget(
  "FormBuilderModuleContainer",
  "FormBuilderModule"
);

formBuilder.init({
  initialSchema: {
    schema: {
      title: "MMV Selector",
      type: "object",
      properties: {
        name: {
          type: "string",
          title: "Name",
          required: true,
        },
        make: {
          type: "number",
          title: "Make",
          required: true,
        },

        model: {
          type: "number",
          title: "Model",
          required: true,
        },
      },
    },
    options: {
      fields: {
        make: {
          type: "select",
          events: ["change"],
        },
        model: {
          type: "select",
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
    view: {
      layout: {
        template:
          "<div class='container-fluid'><div class='row'><div class='col-md-12' id='column-1-1'></div></div><div class='row'><div class='col-md-6' id='column-2-1'></div><div class='col-md-6' id='column-2-2'></div></div></div>",
        bindings: {
          name: "#column-1-1",
          make: "#column-2-1",
          model: "#column-2-2",
        },
      },
    },
  },
  eventHandler: function (schemaBuilder, action, next) {
    switch (action.type) {
      case "form:load": {
        let api =
          "https://masters.insurancedekho.com/api/v1/motor/getBkgMasterData?fetchData=fw_mmv&fetchOnly=all_make&sortBy=popularity&tags=make,make_id,popularity_rank";
        axios.get(api).then((res) => {
          let newOptions = [];
          if (res.status == 200) {
            if (res.data) {
              res.data.data.map((m) => {
                newOptions.push({ text: m.make, value: m.make_id });
              });
            }
          }
          schemaBuilder.setFieldAttribute("make", "dataSource", newOptions);
        });

        return schemaBuilder;
      }
      case "make:change": {
        let api =
          "https://masters.insurancedekho.com/api/v1/motor/getBkgMasterData?fetchData=fw_mmv&fetchOnly=all_parent_model&sortBy=modelPopularity&tags=make,make_id,model,model_id,model_display_name,model_popularity_rank,status,image_url,mobile_image_url&city=&connectoid=a0795390-3fe0-ec4d-e396-bed361fbe1d3&sessionid=&makeId=" +
          action.payload;
        axios.get(api).then((res) => {
          let newOptions = [];
          if (res.status == 200) {
            if (res.data) {
              res.data.data.map((m) => {
                newOptions.push({ text: m.model, value: m.model_id });
              });
            }
            schemaBuilder.setFieldAttribute("model", "dataSource", newOptions);
          }
        });
        return schemaBuilder;
      }
    }
    return schemaBuilder;
  },
});
