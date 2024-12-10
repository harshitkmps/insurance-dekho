import React from 'react';
import { BackStep, InprogressUpdateImage } from '../../redux/actions/KycActions';
import { connect } from "react-redux";
import axios from 'axios';
import config from '../../app-configs/index';
import FormValidator from "simple-react-validator";

const defaultProps = {
  doc_id:null,
  preview:null,
  file:null
}
const validExt = ['jpg', 'png', 'jpeg'];

class UploadImage extends React.Component{

  constructor(props, context){
    super(props, context);
    this.state = this.context.data || window.__INITIAL_STATE__ || defaultProps;
    this.submitHandler = this.submitHandler.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.validator = new FormValidator({
      validators: {
      validate_doc:{
          message: 'Please select the document type',
          rule: (val, params, validator) => {
              if (val != 'Select Document') {
                  return true;
              }
              return false;
          },
          required: true,
          },
          validateFile: {
              message: "Only jpg, png, jpeg files are allowed!",
              rule: (val, params, validate) => {
                  if (val.name) {
                      let fileExt = val.name.split('.').pop();
                      return validExt.includes(fileExt);
                  }
                  return false;
              },
          }
      },
  });
  }

  submitHandler(e){
    e.preventDefault();
    if (this.validator.allValid()) {
      this.props.InprogressUpdateImage({ photoId: this.state.doc_id });
    } else {
      this.validator.showMessages();
      this.forceUpdate();
    }
  }
  handleUpload(e){
    let file = e.target.files[0]
    let previewUrl = URL.createObjectURL(file);
    this.setState({preview:previewUrl,file:file});
    let formData = new FormData();
    formData.append("file", file);
    let url = `${config.kycApiBaseUrl}/v2/kyc/document-upload`;
    axios.post(url, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }).then((response) => {
        let doc_id = response?.data?.data?.doc_id;
        this.setState({doc_id})
    }).catch((error) => {
        console.log(error);
    });
}
  render(){
    return (
      <div className='KycStep2 kycFormFixed'>
        <form onSubmit={(e) => this.submitHandler(e)}>
          <div className='panInput'>
          <input type="file" id="file" name='passport_image' onChange={this.handleUpload} accept='.jpg, .png, .jpeg'/>
         <label htmlFor="file" class="btn"> 
          {this.state.preview ? 
            <img style={{ width: "100%" }} src={this.state.preview} /> 
            :<span><span className="addIcon">+</span><span className="chooseFile">Upload Passport Size Photo</span><span className="imgFormat">JPEG, PNG, JPG only</span></span>}
          </label>     
          </div>
          {this.validator.message('passport_image', this.state.file, 'required|validateFile')}
          <p>By clicking next, i authorise Girnar Insurance Brokers Private Limited to validate my details from the secured cKYC repository.</p>
          <div className="nextButton">
            <button className="lineBtn" onClick={() => this.props.BackStep({ step: 'main' })}>Back</button>
            <button disabled={(this.props.kycState.loader.upload_image_next ? true : false)} className={`solidBtn ${(this.props.kycState.loader.upload_image_next ? "whiteCircle_m" : '')}`} type='submit'>{(this.props.kycState.kycData && (this.props.kycState.kycData.kycVerified === false)) ? 'Try again' : 'Next'}</button>
          </div>
        </form>
      </div>
    )
  }
}
const mapStateToProps = (state) =>{
  return {kycState:state.KycReducer}
}
const mapDispatchToProps = {
  BackStep, 
  InprogressUpdateImage
}
export default connect(mapStateToProps, mapDispatchToProps)(UploadImage);