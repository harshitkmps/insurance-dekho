export default function processSchema(schema, dispatch) {
  if (!schema.processed) {
    let fields = schema.options.fields;
    if (fields) {
      Object.keys(fields).forEach((field) => {
        if (fields[field].events) {
          let tmpEvents = {};
          fields[field].events.map((event) => {
            tmpEvents[event] = function (e) {
              dispatch({
                type: `${field}:${event}`,
                payload: this.getValue(),
                dispatch: dispatch,
                event: e,
              });
            };
          });
          schema.options.fields[field]["events"] = tmpEvents;
        }
      });
    }
    schema.postRender = function () {
      dispatch({ type: "form:load", payload: {}, dispatch: dispatch });
    };
    schema.processed = true;
  }
  return schema;
}
