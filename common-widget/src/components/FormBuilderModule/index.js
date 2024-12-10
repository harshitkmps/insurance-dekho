import { useEffect } from "react";
import alpacaForms from "./alpaca";
import processSchema from "./processschema";
import { createDispatchHook, createSelectorHook } from "react-redux";
import getRandomHash from '../../utils/getRandomHash'
import "./formbuilder.css";

export default function FormBuilder({ context }) {
  const formName = getRandomHash(7);
  const useSelector = createSelectorHook(context);
  const useDispatch = createDispatchHook(context);
  const dispatch = useDispatch();
  const moduleOptions = useSelector(
    (state) => state.CommonReducer.moduleOptions
  );
  dispatch({
    type: "INIT",
    payload: {
      schema: processSchema(moduleOptions.initialSchema, dispatch),
      events: moduleOptions.eventHandler,
      formName:formName
    },
  });
  const schema = useSelector((state) => state.FormBuilderReducer.schema);

  useEffect(() => {
    alpacaForms(formName, schema);
  }, []);

  return <div id={formName}></div>;
}
