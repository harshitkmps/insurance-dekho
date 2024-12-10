import React from "react";
import "./kycModule.scss";
import IdLogo from '../../src/img/id-main-logo-new.svg';
import Step1 from "../components/KycModule/Step1";
import Step2 from "../components/KycModule/Step2";
import AddressProof from "../components/KycModule/AddressProof";
import KycComplete from "../components/KycModule/KycComplete";
import { connect } from "react-redux";
import ConfirmDetails from "../components/KycModule/ConfirmDetails";
import VerifyDocuments from "../components/KycModule/VerifyDocuments";
import FormValidator from "simple-react-validator";
import { BackStep } from "../redux/actions/KycActions";
import { getQueryParams } from "../utils/globals";
import { BrowserRouter } from "react-router-dom";
import ErrorPage from "../components/KycModule/ErrorPage";
import EdgeCase from "../components/KycModule/EdgeCase";
import EdgeCaseOvd from "../components/KycModule/EdgeCaseOvd";

const Kyc = React.lazy(() =>
  import("../components/KycModule/index")
);
class KycModule extends React.Component {
  constructor(props) {
    super(props);
    this.updateToParent = this.updateToParent.bind(this);
    this.validator = new FormValidator({
        validators: {
          document_type:{
            message: 'Please select the document type',
            rule: (val, params, validator) => {
                if (val != 'Select Document') {
                    return true;
                }
                return false;
            },
            required: true,
            }
        },
    });
}

  updateToParent(fieldsToUpdate){
    this.setState({...fieldsToUpdate});
  }

  RenderSteps (){
    let step = this.props.kycState && this.props.kycState.step
    switch (step) {
      case 'main':
        return <Step1 context={this.props.context} updateToParent={this.updateToParent} parentData = {this.state}/>
      case 'verify-pan':
        return <Step2 context={this.props.context} updateToParent={this.updateToParent} parentData = {this.state}/>
      case 'address-proof':
        return <AddressProof context={this.props.context} updateToParent={this.updateToParent} parentData = {this.state}/>
      case 'success':
        return <KycComplete context={this.props.context} status="success"/>
      case 'pending':
        return <KycComplete context={this.props.context} status="pending"/>
      case 'select-document':
        return <VerifyDocuments context={this.props.context}/>
      case 'aadhar-confirm':
        return <ConfirmDetails  context={this.props.context}/>
      case "error-page":
        return <ErrorPage context={this.props.context}/>
      case "edge-case":
        return <EdgeCase context={this.props.context} updateToParent={this.updateToParent} parentData = {this.state}/>
      case "edge-case-ovd":
        return <EdgeCaseOvd context={this.props.context}/>
      default:
        return <>No Available options...</>
    }
  }

  render(){
    return(
      <BrowserRouter>
      <div className="KycModuleSection">
        <div className="KycHeader">
          <img src={IdLogo} alt="InsuranceDekho Logo" className="idLogo" />
        </div>
        {this.RenderSteps()}
      </div> 
      </BrowserRouter>  
    )
  }
}
const mapStateToProps = (state) =>{
  return {kycState:state.KycReducer}
}
const mapDispatchToProps = {
  BackStep
}
export default connect(mapStateToProps, mapDispatchToProps)(KycModule);
