/**
 * Redux Reducer : "FormBuilderReducer"
 * Purpose : Reducer provides a new state after state manipulation on a certain action
 */
let defaultState = {};

const FormBuilderReducer = (state = defaultState, action) => {
  switch (action.type) {
    case "INIT":
      return { ...state, ...action.payload };
    default: {
      if (state.events) {
        let sb = new SchemaBuilder(state);
        state.events(sb, action, action.dispatch);
        return sb.build();
      } else {
        return state;
      }
    }
  }
};
export default FormBuilderReducer;

class SchemaBuilder {
  constructor(state) {
    this.state = state;
    this.build = this.build.bind(this);
    this.refreshField = this.refreshField.bind(this);
  }

  setFieldAttribute(field, attribute, value) {
    this.state.schema.options.fields[field][attribute] = value;
    this.refreshField(field);
  }

  refreshField(field, value = false) {
    try {
      if (field) {
        let control = window.$("#" + this.state.formName).alpaca("get");
        if (control) {
          let alpacaField = control.childrenByPropertyId[field];
          if (alpacaField) {
            alpacaField.refresh();
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  build() {
    return { ...this.state };
  }
}
