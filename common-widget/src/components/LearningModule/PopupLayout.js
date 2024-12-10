import React from "react";

const defaultProps = {};
export default class PopupLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...defaultProps };
    this.closePopup = this.closePopup.bind(this);
  }

  componentDidMount() {}

  closePopup() {
    if (this.props.cbClose != undefined) {
      this.props.cbClose();
    }
  }

  render() {
    return (
      <div>
        <div className="popuplayoutwrap">
          <div className="gsc_thin_scroll variantsMobileHold popupbgdesktop">
            <div className="popuplayoutcontain active  ">
              <div className="gsc_modalWrapper insuranceRenew relative">
                {this.props.popupTitle && (
                  <div className="title">{this.props.popupTitle}</div>
                )}
                {this.props.subTitle && (
                  <div className="subtitle">{this.props.subTitle}</div>
                )}
                <div className="scrolldiv">{this.props.children}</div>
                {this.props.cbClose && (
                  <span 
                    className="gsc_closeBtn academyVideoClose"
                    title="close"
                    onClick={(e) => {
                      this.closePopup();
                    }}
                  >
                    ×
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <span class="gsc_overlay1"></span>
      </div>
    );
  }
}
