import React, { Fragment } from "react";

class FormInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { lable: "", bgColor: "" };
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.ref = React.createRef();
  }

  componentDidMount() {
    if (this.props.focusOnVisible) {
      this.ref.current.focus();
    }
  }

  onBlur(e) {
    let value = e.target.value;
    if (value === undefined || value === "") {
      this.setState({ lable: "", bgColor: "" });
    }
    if (this.props.onBlur) {
      this.props.onBlur(e);
    }
  }

  onFocus(e) {
    let value = e.target.value;
    let activeLable = "active";
    if (
      this.props.inputProps.readOnly !== undefined &&
      (value === undefined || value === "")
    ) {
      activeLable = "";
    }
    this.setState({ lable: activeLable, bgColor: "white" });
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
  }

  render() {
    let props = this.props;
    let className = props.className ? props.className : "";
    let borderColor = this.props.error
      ? "b-red"
      : this.props.borderColor
      ? this.props.borderColor
      : "";
    return (
      <Fragment>
        <div className="gs_control-group">
          <div
            data-gsmtl-container
            className={`inputborderbox ${
              props.inputProps.showSearchIcon ? "locationSearch" : ""
            } ${borderColor} ${
              props.inputProps.value ? "white" : this.state.bgColor
            } ${className}`}
          >
            <div className="gsc_mtl_field">
              <div className="input-field">
                {props.inputProps.type === "text-area" ? (
                  <textarea
                    {...props.inputProps}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                  ></textarea>
                ) : (
                  <div>
                    <input
                      {...props.inputProps}
                      onFocus={this.onFocus}
                      onBlur={this.onBlur}
                      ref={this.ref}
                    />
                  </div>
                )}

                <label
                  htmlFor={props.inputProps.id}
                  className={
                    props.inputProps.value ? "active" : `${this.state.lable}`
                  }
                >
                  {props.labelProps.label}
                </label>
              </div>
              {props.inputProps &&
              props.inputProps.disabled &&
              props.prefixElement
                ? props.prefixElement
                : null}
            </div>
          </div>
        </div>
        {this.props.error}
      </Fragment>
    );
  }
}

export default FormInput;
