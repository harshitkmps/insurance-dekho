"use strict";

import React from "react";
import PropTypes from "prop-types";
import "./ShimmerEffect.scss";
const defaultProps = {
  visible: false,
  height: 150,
  count: 1,
  type: "grid",
};

const ShimmerEffect = (props, context) => {
  let count = props.count ? props.count : 1;
  let shimmer = function () {
    var h = [];
    for (let i = 0; i < count; i++) {
      h.push(
        <div key={i} className={props.columnCls}>
          <div className="contentLoader ">
            <div className="animated-backgroundlarge firstRow"> </div>
            <div
              className="animated-backgroundlarge secondRow"
              style={{ height: "8px", width: "85%" }}
            >
              {" "}
            </div>
            <div
              className="animated-backgroundlarge secondRow"
              style={{ height: "8px", width: "75%" }}
            >
              {" "}
            </div>
            <div
              className="animated-backgroundlarge secondRow"
              style={{ height: "8px", width: "65%" }}
            >
              {" "}
            </div>
            <div
              className="animated-background"
              style={{ height: props.height, marginBottom: "0px" }}
            >
              {" "}
            </div>
          </div>
        </div>
      );
    }

    return h;
  };

  let listShimmer = function () {
    var h = [];
    for (let i = 0; i < count; i++) {
      h.push(
        <div key={i} className="gsc_col-xs-12">
          <div className="contentLoader ListView">
            <div className="gsc_row">
              <div className="gsc_col-xs-12 gsc_col-sm-4">
                <div className="animated-background "> </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return h;
  };

  return <div className="gsc_row">{listShimmer()}</div>;
};
export default ShimmerEffect;

ShimmerEffect.propTypes = {
  count: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  visible: PropTypes.bool,
  type:
    PropTypes.string &&
    function (props, propName, componentName) {
      let value = props[propName];
      var converttoarray = value.split(",");
      var checker = function (arrayvalue) {
        return (
          arrayvalue.indexOf("list") > -1 ||
          arrayvalue.indexOf("grid") > -1 ||
          arrayvalue.indexOf("") > -1
        );
      };
      return converttoarray.every(checker)
        ? null
        : new Error(
            propName +
              " in " +
              componentName +
              " should have only grid or list(empty value will be considered as grid)"
          );
    },
};

ShimmerEffect.defaultProps = defaultProps;
