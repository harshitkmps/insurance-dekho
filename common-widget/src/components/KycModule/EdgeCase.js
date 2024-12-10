import React, { Fragment } from 'react';
import { BackStep, InprogressOkyc, InprogressCkyc} from '../../redux/actions/KycActions';
import ErrorMessage from './ErrorMessage';
import FormValidator from "simple-react-validator";
import { connect } from "react-redux";
import CustomDatePicker from '../elements/CustomDatePicker';
import { getSessionStorageItem, toCapitalizeFirstLetter, uploadDocument} from '../../utils/globals';
import {get} from 'lodash';

const defaultProps = {
  selected:null,
  docNumber:'',
  dob:''
}


class EdgeCase extends React.Component{

  constructor(props, context){
    super(props, context);
    this.state = this.context.data || window.__INITIAL_STATE__ || defaultProps;
    this.submitHandler = this.submitHandler.bind(this);
    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.getKeyByValue = this.getKeyByValue.bind(this);
    this.inputHandler = this.inputHandler.bind(this);
    this.validator = new FormValidator({
      validators: {
        customRequired: {
          message: "The :attribute field is required.",
          rule: (item, params, validator) => {
            return !!item.value;
          },
          messageReplace: (message, params) =>{
            message.replace(":values", this.helpers.toSentence(params))
          }
        },
        customValidator: {
          message: "Please enter valid :attribute.",
          rule: (item, params, validator) => {
            return (
              validator.helpers.testRegex(
                item.value,
                item.regexString
              ) && params.indexOf(item.value) === -1
            );
          },
          messageReplace: (message, params) =>{
            message.replace(":values", this.helpers.toSentence(params))
          }
        },
        validateFile: {
          message: "Only jpeg, png, pdf files are allowed!",
          rule: (val, params, validate) => {
              const validExt = ['pdf', 'jpg', 'png', 'jpeg'];
              if(!val.name){
                  return false;
              }
              let valid = true;
              let fileExt = val.name.split('.').pop();
              valid = validExt.includes(fileExt);
              return valid;
             
          },
          messageReplace: (message, params) => message.replace(':values', this.helpers.toSentence(params)),
          required: true
        },
      },
    });
  }

  componentDidMount() {
    let kycConfig = getSessionStorageItem('kycConfig');
    let typeOfKyc = this.props.parentData?.typeOfKyc;
    let typeOfDoc = this.props.parentData?.typeOfDoc;
    let indexOfDoc = get(kycConfig,`insurer_document_config.${typeOfKyc}`,[]).findIndex((item)=>item.document_slug == typeOfDoc);
    this.setState({
      kycConfig:kycConfig,
      pageFields:get(kycConfig,`insurer_document_config.${typeOfKyc}[${indexOfDoc}].fields`),
      pageImageField:get(kycConfig,`insurer_document_config.${typeOfKyc}[${indexOfDoc}].options`)
    });
  } 

  inputHandler(e,slugToSet){
    let val = e.target.value;
    this.setState({[slugToSet]:val});
  }

  getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }
  
  onChangeHandler(e){
    let docNumber = e.target.value;
    this.setState({docNumber:docNumber})
  }
  async submitHandler(e){
    e.preventDefault();
    if (this.validator.allValid()) {
      let fields = getSessionStorageItem('kycFieldsData');
      get(this,'state.pageFields',[]).forEach((item)=>{
        if(item.step == 2){
          fields.push({
            "slug":item.slug,
            "value": get(this.state,`${item.slug}`),
            "is_additional_info": item.is_additional_info,
            "master_id": item.master_id,
            "frontImage" : "",
            "backImage" : ""
          })
        }
      })
      let imageField = get(this,'state.pageImageField',[]);
      for (let index = 0; index < imageField.length; index++) {
        let item = imageField[index];
        if(item.step == 2 && get(this.state,`${item.document_slug}`,0)){
          let docUploadRes = await uploadDocument(get(this.state,`${item.document_slug}`));
          if(docUploadRes.status == 200){
            fields.push({
              "slug": item.document_slug,
              "value": "",
              "is_additional_info": item.is_additional_info,
              "master_id": item.master_id,
              "frontImage" : docUploadRes.doc_id,
              "backImage" : ""
            })
          }
        }
      }
      if(get(this.props,'parentData.typeOfKyc') == 'ckyc'){
        //For ckyc use below funtion
        this.props.InprogressCkyc({ fields :fields });
      }
      else{
        //For okyc use below funtion
        this.props.InprogressOkyc({fields :fields})
      }
    } else {
      this.validator.showMessages();
      this.forceUpdate();
    }
  }
  render(){
    let childMinDate = new Date();
    let childMaxDate = new Date();
    childMinDate.setYear(childMinDate.getFullYear() - 100);
    childMaxDate.setYear(childMaxDate.getFullYear() - 1);
    childMinDate.setDate(childMinDate.getDate() + 1);
    return (
      <div className='KycStep2 kycFormFixed'>
        <form onSubmit={(e) => this.submitHandler(e)}>
          <h4>Please fill the following information</h4>
          {
            get(this,'state.pageImageField',[]).map((item)=>{
              if(item.step != 2)
                return null;
              return (
                <div className='panInput'>
                  <div>
                    <input type="file" id="file" onChange={(e)=>{
                      if(e.target.files && e.target.files.length == 0){
                          return;
                      }
                      this.setState({ [item.document_slug]: e.target.files[0] , [`${item.document_slug}_url`] : URL.createObjectURL(e.target.files[0])});
                    }}/>
                    {get(this.state,`${item.document_slug}_url`) ? 
                      <Fragment>
                        <span className="closeimage" onClick={()=>{
                          this.setState({ [item.document_slug]: "", [`${item.document_slug}_url`] : ""});
                        }}></span>
                        <img style={{ width: "100%" }} src={get(this.state,`${item.document_slug}_url`)}/>
                      </Fragment> 
                      :
                      <label htmlFor="file" class="btn">
                        <span className="addIcon">+</span>
                        <span className="chooseFile">
                          Upload {item.document_name} Photo
                        </span>
                        <span className="imgFormat">JPEG, PNG, PDF only</span>
                      </label>
                    }

                    {this.validator.message(item.document_slug,get(this.state,`${item.document_slug}`), 'required|validateFile')}
                  </div>
                </div>
              )
            })
          }
          {
            get(this,'state.pageFields',[]).map((item,index)=>{
              if(item.step != 2)
                return null;
              if(item.input_type == 'date'){
                return <div name="date_of_birth">
                  <CustomDatePicker
                    key={index}
                    id={`son`}
                    label={toCapitalizeFirstLetter(item.slug) || item.description}
                    minDate={childMinDate}
                    maxDate={childMaxDate}
                    focusOnElm={true}
                    bodyScroll={false}
                    date={this.state.dob ? new Date(this.state.dob) : ''}
                    list="day"
                    onChange={(d) => {
                      this.setState({dob:d.toISOString().slice(0,10)})
                    }}
                  />
                  {this.validator.message('date_of_birth', this.state.dob, 'required')}
                </div>
              }
              if(item.input_type == "text") {
                  return (
                      <div className="panInput">
                          <div className="fldBtm20">
                              <label>Enter valid {toCapitalizeFirstLetter(item.slug) || item.description} details</label>
                              <input
                                  type="text"
                                  name={item.slug}
                                  placeholder={`Enter ${toCapitalizeFirstLetter(item.slug) || item.description}`}
                                  value={get(this.state,`${item.slug}`)}
                                  id={item.slug}
                                  onChange={(e)=>this.inputHandler(e,item.slug)}
                                  onBlur={() => this.validator.errorMessages}
                              />
                              {this.validator.message(
                                  item.slug,
                                  {value:get(this.state,`${item.slug}`,""),regexString:item.validation_pattern},
                                  "customRequired|customValidator"
                              )}
                          </div>
                      </div>
                  );
              }
              if(item.input_type == "number") {
                return (
                    <div className="panInput">
                        <div className="fldBtm20">
                            <label>Enter valid {toCapitalizeFirstLetter(item.slug) || item.description} details</label>
                            <input
                                type="number"
                                name={item.slug}
                                placeholder={`Enter ${toCapitalizeFirstLetter(item.slug) || item.description}`}
                                value={get(this.state,`${item.slug}`)}
                                id={item.slug}
                                onChange={(e)=>this.inputHandler(e,item.slug)}
                                onBlur={() => this.validator.errorMessages}
                            />
                            {this.validator.message(
                                item.slug,
                                {value:get(this.state,`${item.slug}`,""),regexString:item.validation_pattern},
                                "customRequired|customValidator"
                            )}
                        </div>
                    </div>
                );
              }
              if(item.input_type == "dropdown"){
                return (
                    <div className="panInput">
                        <div className="verifyDocumentsSection">
                            <div className="selectDoc">
                                <select
                                    value={get(this.state,`${item.slug}`)}
                                    name={item.slug}
                                    onChange={(e) =>
                                      {
                                        let document_slug = item.slug;
                                        this.setState({[document_slug]: e.target.value})
                                      }
                                    }
                                    onBlur={() => this.validator.showMessageFor("document_type")}>
                                    <option value="" disabled selected hidden>Select {toCapitalizeFirstLetter(item.slug)}</option>
                                    {get(item,'options',[]).map(
                                        (ele) => {
                                            return (
                                                <option
                                                    value={ele}
                                                    key={ele}
                                                >
                                                    {ele}
                                                </option>
                                            );
                                        }
                                    )}
                                </select>
                                {this.validator.message(
                                  item.slug,
                                  {value:get(this.state,`${item.slug}`,""),regexString:item.validation_pattern},
                                  "customRequired|customValidator"
                                )}
                            </div>
                        </div>
                    </div>
                );
              }
              if(item.input_type == "radio"){
                return(
                <div className="panVerify dis-blck ">
                  <p>{toCapitalizeFirstLetter(item.slug) || item.description}</p>
                  <div class="linkingRadio" name={item.slug}>
                    {!!item.options.length && item.options.map((val)=>{
                      {console.log("inside options are",val)}
                    return  <label>
                          <input 
                              id={val} 
                              type="radio" 
                              name={val} 
                              value={val} 
                              checked={get(this.state,`${item.slug}`) === {val}}
                              onChange={(e) =>{
                                  let document_slug = item.slug;
                                  this.setState({[document_slug]: e.target.value})
                              }}
                          />{" "}
                          <span>{val}</span>
                      </label>
                    })}
                    </div>
                    {this.validator.message(
                        item.slug,
                        {value:get(this.state,`${item.slug}`,""),regexString:item.validation_pattern},
                        "customRequired|customValidator"
                    )}
                  </div>)
              }
            })
          }

          {this.props.kycState.kycData && (this.props.kycState.kycData.kycVerified === false) && <ErrorMessage errorType={this.props.kycState.kycData.errorCode} />}
          <div className="nextButton">
            <button className="lineBtn" onClick={() => {
              if(get(this.props,'parentData.typeOfKyc') == 'ckyc'){
                this.props.BackStep({ step: 'verify-pan' })
              }else if(get(this.props,'parentData.typeOfKyc') == 'okyc'){
                this.props.BackStep({ step: 'address-proof' })
              }
              else{
                this.props.BackStep({ step: 'main' })
              }
            }}>Back</button>
            <button disabled={(this.props.kycState.loader.ckyc_next ? true : false)} className={`solidBtn ${(this.props.kycState.loader.ckyc_next ? "whiteCircle_m" : '')}`} type='submit'>{(this.props.kycState.kycData && (this.props.kycState.kycData.kycVerified === false)) ? 'Try again' : 'Next'}</button>
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
  BackStep, InprogressOkyc, InprogressCkyc
}
export default connect(mapStateToProps, mapDispatchToProps)(EdgeCase);