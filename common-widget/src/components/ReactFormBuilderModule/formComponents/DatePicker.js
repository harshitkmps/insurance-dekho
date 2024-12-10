"use strict";

import React, { Fragment } from "react";
import TextField from "@mui/material/TextField";
import formatDate from "../../../utils/formatDate";
import Modal from "./Modal";
import { createDispatchHook } from "react-redux";
import { createSelectorHook } from "react-redux";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import { Grid } from "@mui/material";
import { FormLabel } from "@mui/material";
import "./css/customDatePicker.scss";

let icon = null;
icon = <img src="/common-widgets/icons/ic-calendar.svg" alt="" />;

const monthNamesShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function (props) {
  const useSelector = createSelectorHook(props.context);
  const useDispatch = createDispatchHook(props.context);
  const dispatch = useDispatch();
  let activeStep = useSelector(
    (state) => state.ReactFormBuilderReducer.activeStep
  );
  let step = useSelector(
    (state) => state.ReactFormBuilderReducer.steps[props.activeStep]
  );
  let field = useSelector(
    (state) =>
      state.ReactFormBuilderReducer.steps[props.activeStep].fields[props.field.name]
  );
  let customValidators = useSelector(
    (state) => state.ReactFormBuilderReducer.customValidators || {}
  );
  let handleChange = function (value) {
    dispatch({
      type: "UPDATE_FIELD_VALUE",
      payload: {
        value: value,
        field: props.field.name,
      },
    });
    dispatch({
      type: "VALIDATE_FIELD_VALUE",
      payload: {
        field: field,
        customValidators: customValidators,
      },
    });
    if (field.onChange) {
      field.onChange(value, step, (newstep) => {
        if (newstep) {
          dispatch({
            type: "UPDATE_STEP",
            payload: { step: newstep },
          });
        }
      });
    }
  };
  let fieldProps = field;
  let helperText = field.helperText;
  // delete field.helperText;
  field.date = (field.value && new Date(field.value)) || "";
  let commonDate = (
    <CustomDatePicker
      {...fieldProps}
      onChange={handleChange}
    ></CustomDatePicker>
  );
  return (
    <FormControl error={field.error} className="fb_selectWlabel " fullWidth={true}>
    {field.title ? (
      <Grid container className="fb_row">
        <Grid item xs={4} sm={5} className="leftLabel">
          <FormLabel>{field.title}</FormLabel>
        </Grid>
        <Grid className="fb_datepick" item xs={8} sm={7}>{commonDate}</Grid>
      </Grid>
    ) : (
      commonDate
    )}
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
}

class CustomDatePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      registration: "",
      month: "",
      date: "",
      list: "year",
      days: [],
      dateChange: false,
      showDatePicker: false,
      monthNames: monthNamesShort,
      years: [],
      dateIsDefault: false,
    };
    this.state.datePresent = this.state.date != "";
    this.openPopup = this.openPopup.bind(this);
    this.renderMonth = this.renderMonth.bind(this);
    this.renderYear = this.renderYear.bind(this);
    this.renderDay = this.renderDay.bind(this);
    this.checkDate = this.checkDate.bind(this);
    this.getSelectedDate = this.getSelectedDate.bind(this);
    this.getSelectedMonth = this.getSelectedMonth.bind(this);
    this.getSelectedYear = this.getSelectedYear.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    let prevState = state;
    if (props) {
      if (props.maxDate) {
        prevState.maxDate = new Date(props.maxDate);
      }
      if (props.minDate) {
        prevState.minDate = new Date(props.minDate);
      }
    }
    if (props && props.date && props.date != state.date) {
      prevState.date = props.date;
      if (props.list) {
        prevState.list = props.list;
      }
    }
    if (props && props.date == "" && props.registrationDateChanged) {
      prevState.date = "";
      prevState.list = "year";
      props.changeRegDateFlag(false);
    }

    if (prevState.minDate) {
      prevState["minDateOfMonth"] = prevState.minDate.getDate();
      prevState["minMonth"] = prevState.minDate.getMonth();
      prevState["minYear"] = prevState.minDate.getFullYear();
    }
    if (prevState.maxDate) {
      prevState["maxDateOfMonth"] = prevState.maxDate.getDate();
      prevState["maxMonth"] = prevState.maxDate.getMonth();
      prevState["maxYear"] = prevState.maxDate.getFullYear();
    }

    if (props.scrollToYear) {
      let currDate = new Date();
      prevState.scrollToYear = currDate.getFullYear() - props.scrollToYear;
    }

    return prevState;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.focusOnElm) {
      setTimeout(() => {
        if (
          (prevProps.date && prevProps.date.getFullYear()) ||
          this.state.scrollToYear
        ) {
          let year = prevProps.date
            ? prevProps.date.getFullYear()
            : this.state.scrollToYear;
          let elm = document.getElementById(year.toString());
          if (elm) {
            elm.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }
      }, 100);
    }
  }

  select(fieldName, fieldValue) {
    let newDate = this.state.date == "" ? new Date() : this.state.date;
    let set_state = { dateChange: true };
    if (fieldName == "year") {
      newDate.setFullYear(fieldValue);
      set_state["list"] = "month";
    } else if (fieldName == "month") {
      if (fieldValue != newDate.getMonth()) {
        newDate.setDate(1);
        //set_state['dateIsDefault'] = true;
      }
      newDate.setMonth(fieldValue);
      set_state["list"] = "day";
    } else if (fieldName == "days") {
      newDate.setDate(fieldValue);
      set_state["dateIsDefault"] = false;
      set_state["showDatePicker"] = false;

      var dd = String(newDate.getDate()).padStart(2, "0");
      var mm = String(newDate.getMonth() + 1).padStart(2, "0");
      var yyyy = newDate.getFullYear();

      this.props.onChange(yyyy + "-" + mm + "-" + dd);
    }

    set_state["datePresent"] = true;
    set_state["date"] = newDate;
    this.setState(set_state);
  }

  checkDate() {
    if (!this.state.dateIsDefault && this.state.date == "") {
      this.setState({ showDatePicker: false });
    } else if (
      !this.state.dateIsDefault &&
      this.state.date.getTime() >= this.state.minDate.getTime() &&
      this.state.date.getTime() <= this.state.maxDate.getTime()
    ) {
      this.setState({ showDatePicker: false });
      this.props.onChange(this.state.date);
    } else {
      let list = "day";
      this.setState({ list });
    }
  }

  openList(showList) {
    if (this.state.date != "") {
      this.setState({ list: showList }, () => {});
    }
  }

  openPopup() {
    this.setState({ showDatePicker: true });
  }

  renderYear() {
    if (this.state.list == "year") {
      let years = [];
      let allowedYears = [];

      for (let i = this.state.maxYear; i >= this.state.minYear; i--) {
        allowedYears.push(i);
      }
      for (let i = this.state.maxYear + 7; i >= this.state.minYear - 6; i--) {
        years.push(i);
      }
      return (
        <Fragment>
          <h3>{this.props.label}</h3>
          <span>Select Year</span>
          <ul style={{ listStyleType: "none", paddingInlineStart: "0px" }}>
            {years.map((value, i) => {
              let cls =
                this.state.date != "" && this.state.date.getFullYear() == value
                  ? "active"
                  : "";
              if (allowedYears.indexOf(value) != -1) {
                return (
                  <li
                    id={value}
                    className={cls}
                    onClick={this.select.bind(this, "year", value, i)}
                    key={i}
                  >
                    {value}
                  </li>
                );
              } else {
                return (
                  <li id={value} className={`${cls} year disabled`} key={i}>
                    {value}
                  </li>
                );
              }
            })}
          </ul>
        </Fragment>
      );
    }
  }

  renderMonth() {
    if (this.state.list == "month") {
      let allowedMonths = {};
      this.state.monthNames.forEach((value, i) => {
        allowedMonths[i] = value;
      });
      let tmp = {};

      if (this.state.minYear == this.state.date.getFullYear()) {
        tmp = {};
        Object.entries(allowedMonths).forEach((item) => {
          if (item[0] >= this.state.minMonth) {
            tmp[item[0]] = item[1];
          }
        });
        allowedMonths = tmp;
      }

      if (this.state.maxYear == this.state.date.getFullYear()) {
        tmp = {};
        Object.entries(allowedMonths).forEach((item) => {
          if (item[0] <= this.state.maxMonth) {
            tmp[item[0]] = item[1];
          }
        });
        allowedMonths = tmp;
      }

      return (
        <Fragment>
          <h3>{this.props.label}</h3>
          <span>Select Month</span>
          <ul style={{ listStyleType: "none", paddingInlineStart: "0px" }}>
            {this.state.monthNames.map((value, i) => {
              let cls =
                allowedMonths[this.state.date.getMonth()] == i ? "active" : "";
              if (allowedMonths[i]) {
                return (
                  <li
                    className={cls}
                    onClick={this.select.bind(this, "month", i)}
                    key={i}
                  >
                    {value}
                  </li>
                );
              } else {
                return (
                  <li className={`${cls} month disabled`} key={i}>
                    {value}
                  </li>
                );
              }
            })}
          </ul>
        </Fragment>
      );
    }
  }

  firstDay(year, month) {
    let fDay = new Date(year, month, 1);
    return fDay.getDay();
  }

  maxDay(year, month) {
    let lDay = new Date(year, month + 1, 0);
    return lDay.getDate();
  }

  renderDay() {
    if (this.state.list == "day") {
      let maxDay = this.maxDay(
        this.state.date.getFullYear(),
        this.state.date.getMonth()
      );
      let days = [];
      for (let i = 1; i <= maxDay; i++) {
        days.push(i);
      }
      let allowedDays = [...days];

      if (
        this.state.minYear == this.state.date.getFullYear() &&
        this.state.minMonth == this.state.date.getMonth()
      ) {
        allowedDays = allowedDays.filter((v) => v >= this.state.minDateOfMonth);
      }

      if (
        this.state.maxYear == this.state.date.getFullYear() &&
        this.state.maxMonth == this.state.date.getMonth()
      ) {
        allowedDays = allowedDays.filter((v) => v <= this.state.maxDateOfMonth);
      }

      let fDay = this.firstDay(
        this.state.date.getFullYear(),
        this.state.date.getMonth()
      );
      let blanks = [];
      for (let i = 0; i < fDay; i++) {
        blanks.push(
          <li className={`day blank`} key={"b" + i}>
            {""}
          </li>
        );
      }

      return (
        <Fragment>
          <h3>{this.props.label}</h3>
          <span>Select Day</span>
          <ul style={{ listStyleType: "none", paddingInlineStart: "0px" }}>
            <li className={`day name`} key={"Sun"}>
              {"S"}
            </li>
            <li className={`day name`} key={"M"}>
              {"M"}
            </li>
            <li className={`day name`} key={"Tue"}>
              {"T"}
            </li>
            <li className={`day name`} key={"W"}>
              {"W"}
            </li>
            <li className={`day name`} key={"Thu"}>
              {"T"}
            </li>
            <li className={`day name`} key={"F"}>
              {"F"}
            </li>
            <li className={`day name`} key={"Sat"}>
              {"S"}
            </li>
            {blanks}
            {days.map((value, i) => {
              let cls =
                this.state.date.getDate() == value && !this.state.dateIsDefault
                  ? "active"
                  : "";
              if (allowedDays.indexOf(value) != -1) {
                return (
                  <li
                    className={`${cls} day`}
                    onClick={this.select.bind(this, "days", value)}
                    key={i}
                  >
                    {value}
                  </li>
                );
              } else {
                return (
                  <li className={`day disabled`} key={i}>
                    {value}
                  </li>
                );
              }
            })}
          </ul>
        </Fragment>
      );
    }
  }

  getSelectedDate() {
    if (this.state.date == "") {
      return "--";
    }
    return this.state.dateIsDefault
      ? "--"
      : this.state.date.getDate() < 10
      ? "0" + this.state.date.getDate()
      : this.state.date.getDate();
  }

  getSelectedMonth() {
    if (this.state.date == "") {
      return "--";
    }
    return this.state.monthNames[this.state.date.getMonth()];
  }

  getSelectedYear() {
    if (this.state.date == "") {
      return "--";
    }
    return this.state.date.getFullYear();
  }

  render() {
    return (
      <div>
        <TextField
          style={{
            background: "#F5F5F6",
            borderRadius:"8px"
          }}
          variant="filled"
          fullWidth={true}
          label={this.props.label ? this.props.label : "Date of Birth"}
          onClick={this.openPopup}
          value={
            this.state.date == "" ? "" : formatDate(this.state.date, "d/sm/Y")
          }
          autoComplete="off"
          disabled= {this.props.disabled ? this.props.disabled : false}
          InputProps={{ disableUnderline: true, endAdornment: !this.props.disabled ? icon : "", readOnly: true }}
        ></TextField>

        <Modal
          open={this.state.showDatePicker}
          {...(this.props.bodyScroll != undefined
            ? { bodyScroll: this.props.bodyScroll }
            : null)}
        >
          {
            <div>
              <div
                className="overlaydatePicker"
                onClick={() => this.checkDate()}
              ></div>
              <div className="customDatePicker">
                {this.renderYear()}
                {this.renderMonth()}
                {this.renderDay()}

                <div className="dateHeading">
                  <span onClick={this.openList.bind(this, "day")}>
                    {this.getSelectedDate()}
                  </span>
                  <span onClick={this.openList.bind(this, "month")}>
                    {this.getSelectedMonth()}
                  </span>
                  <span onClick={this.openList.bind(this, "year")}>
                    {this.getSelectedYear()}
                  </span>
                </div>
              </div>
            </div>
          }
        </Modal>
      </div>
    );
  }
}
