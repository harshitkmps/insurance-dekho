import * as React from "react";
import Grid from "@mui/material/Grid";
import TextField from "./formComponents/TextField";
import Autocomplete from "./formComponents/Autocomplete";
import Pincode from "./formComponents/Pincode";
import Select from "./formComponents/Select";
import Radio from "./formComponents/Radio";
import CardRadio from "./formComponents/CardRadio";
import DatePicker from "./formComponents/DatePicker";
import DatePickerWithCrossIcon from "./formComponents/DatePickerWithCrossIcon";
import CheckBox from "./formComponents/CheckBox";
import Hint from "./formComponents/Hint";
import WhatsappCheckBox from "./formComponents/WhatsappCheckBox";
import TypoGraphyBox from "./formComponents/TypoGraphyBox";
import GenericCheckBox from "./formComponents/GenericCheckBox";
import MultiselectAutocomplete from "./formComponents/MultiselectAutocomplete";
import MultiselectReactselect from "./formComponents/MultiselectReactselect";
import SingleSelectReactselect from "./formComponents/SingleSelectReactselect";
import AsyncReactSelect from "./formComponents/AsyncReactSelect";
import ImageMultiSelect from "./formComponents/ImageMultiSelect";
import MultiSelectReactSelectWithNumbers from "./formComponents/MultiSelectReactSelectWithNumbers";
import MultiSelectWithoutImages from "./formComponents/MultiSelectWithoutImages";
import AddButton from "./formComponents/Add_Button";
import DateRangeWithHorizontal from "./formComponents/DateRangeWithHorizontal";
import HeadingComp from "./formComponents/HeadingComp";
import YesNoComp from "./formComponents/YesNoComp";
import DateRange from "./formComponents/DateRange";
import CheckBoxCounter from "./formComponents/CheckBoxCounter";
import CheckBoxIcon from "./formComponents/CheckBoxIcon";
import SelectWithLabel from "./formComponents/SelectWithLabel";
import Display from "./formComponents/Display";
import Button from "./formComponents/Button";
import AmountField from "./formComponents/AmountField";
import InputDropdown from "./formComponents/InputDropdown";
import { createDispatchHook } from "react-redux";
import { createSelectorHook } from "react-redux";
import Switch from "./formComponents/Switch";
import Upload from "./formComponents/Upload";
import SpanBox from "./formComponents/SpanBox"
import SubmitButton from "./formComponents/SubmitButton";
import DrawerWithContent from "./formComponents/DrawerWithContent";
import Group from "./formComponents/Group";

import './formbuilder.css';

export default function (props) {
  const useSelector = createSelectorHook(props.context);
  let customComponents = useSelector(
    (state) => state.ReactFormBuilderReducer.customComponents || {}
  );
  let field = false;
  switch (props.field.type) {
    case "TextField":
      field = <TextField {...props}></TextField>;
      break;
    case "Select":
      field = <Select {...props}></Select>;
      break;
    case "Button":
        field = <Button {...props}></Button>;
        break;
    case "SelectWithLabel":
      field = <SelectWithLabel {...props}></SelectWithLabel>;
      break;
    case "Radio":
      field = <Radio {...props}></Radio>;
      break;
    case "Hint":
      field = <Hint {...props}></Hint>;
      break;
    case "Display":
      field = <Display {...props}></Display>;
      break;
    case "HeadingComp":
      field = <HeadingComp {...props}></HeadingComp>;
      break;
    case "Switch":
      field = <Switch {...props}></Switch>;
      break;
    case "CardRadio":
      field = <CardRadio {...props}></CardRadio>;
      break;
    case "CheckBox":
      field = <CheckBox {...props}></CheckBox>;
      break;
    case "WhatsappCheckBox":
      field = <WhatsappCheckBox {...props}></WhatsappCheckBox>;
      break;
    case "GenericCheckBox":
      field = <GenericCheckBox {...props}></GenericCheckBox>;
      break;
    case "CheckBoxCounter":
      field = <CheckBoxCounter {...props}></CheckBoxCounter>;
      break;
    case "TypoGraphyBox":
      field = <TypoGraphyBox {...props}></TypoGraphyBox>;
      break;
    case "CheckBoxIcon":
      field = <CheckBoxIcon {...props}></CheckBoxIcon>;
      break;
    case "Pincode":
      field = <Pincode {...props}></Pincode>;
      break;
    case "Autocomplete":
      field = <Autocomplete {...props}></Autocomplete>;
      break;
    case "MultiselectAutocomplete":
      field = <MultiselectAutocomplete {...props}></MultiselectAutocomplete>;
      break;
    case "YesNoComp":
      field = <YesNoComp {...props}></YesNoComp>;
      break;
    case "ImageMultiSelect":
      field = <ImageMultiSelect {...props}></ImageMultiSelect>;
      break;
    case "MultiSelectReactSelectWithNumbers":
      field = (
        <MultiSelectReactSelectWithNumbers
          {...props}
        ></MultiSelectReactSelectWithNumbers>
      );
      break;
    case "MultiSelectWithoutImages":
      field = <MultiSelectWithoutImages {...props}></MultiSelectWithoutImages>;
      break;
    case "AddButton":
      field = <AddButton {...props}></AddButton>;
      break;
    case "DateRangeWithHorizontal":
      field = <DateRangeWithHorizontal {...props}></DateRangeWithHorizontal>;
      break;
    case "DateRange":
      field = <DateRange {...props}></DateRange>;
      break;
    case "MultiselectReactselect":
      field = <MultiselectReactselect {...props}></MultiselectReactselect>;
      break;
    case "SingleSelectReactselect":
      field = <SingleSelectReactselect {...props}></SingleSelectReactselect>;
      break;
    case "AsyncReactSelect":
      field = <AsyncReactSelect {...props}></AsyncReactSelect>;
      break;
    case "Upload":
      field = <Upload {...props}></Upload>;
      break;
    case "DatePicker":
      field = <DatePicker {...props}></DatePicker>;
      break;
    case "DatePickerWithCrossIcon":
      field = <DatePickerWithCrossIcon {...props}></DatePickerWithCrossIcon>;
      break;
    case "AmountField":
      field = <AmountField {...props}></AmountField>;
      break;
    case "InputDropdown":
      field = <InputDropdown {...props}></InputDropdown>;
      break;
      case "Group":
        field = <Group {...props}></Group>;
        break;
    case "SpanBox":
      field = <SpanBox {...props}></SpanBox>;
      break;
    case "SubmitButton":
      field = <SubmitButton {...props}></SubmitButton>;
      break;
    case "DrawerWithContent":
      field = <DrawerWithContent {...props}></DrawerWithContent>;
      break;
      case "Proxy":
        return(<></>)
        break;
  }

  if (!field && customComponents[props.field.type]) {
    let CustomComponent = customComponents[props.field.type];
    field = <CustomComponent {...props.field}></CustomComponent>;
    
  }

  return (
    <Grid item xs={12} sm={props.field.span || 12} className={props.field.parentClass || "" } >
      {field}
    </Grid>
  );
}
