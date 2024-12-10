import React, { Fragment } from 'react';
import { BackStep, InprogressCkyc } from '../../redux/actions/KycActions';
import ErrorMessage from './ErrorMessage';
import FormValidator from "simple-react-validator";
import { getSessionStorageItem, toCapitalizeFirstLetter, uploadDocument, checkStepsToShow, setSessionStorageItem} from '../../utils/globals';
import { connect } from "react-redux";
import CustomDatePicker from '../elements/CustomDatePicker';
import {get} from 'lodash';

const defaultProps = {
  identifierValue:"",
  identifierType:"",
  dob:""
}
class Step2 extends React.Component{

  constructor(props, context){
    super(props, context);
    this.state = this.context.data || window.__INITIAL_STATE__ || defaultProps;
    this.submitHandler = this.submitHandler.bind(this);
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

  componentDidMount(){
    //This component only render for CKYC
    let kycConfig = getSessionStorageItem('kycConfig');
    this.setState({
      kycConfig:kycConfig,
      identifierType:get(kycConfig,'insurer_document_config.ckyc[0].document_slug'),
      pageFields:get(kycConfig,'insurer_document_config.ckyc[0].fields'),
      pageImageField:get(kycConfig,'insurer_document_config.ckyc[0].options')
    });
  }

  async submitHandler(e){
    e.preventDefault();
    this.props.updateToParent({typeOfDoc:this.state.identifierType});
    if (this.validator.allValid()) {
      let fields = [];
      get(this,'state.pageFields',[]).forEach((item)=>{
        if(item.step == 1){
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
        if(item.step == 1 && get(this.state,`${item.document_slug}`,0)){
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
      if(!checkStepsToShow(this.state.kycConfig,'ckyc',this.state.identifierType,2)){
        //No fields for next step so show so submit
        this.props.InprogressCkyc({ fields :fields });
      }
      else{
        //move to next step
        setSessionStorageItem('kycFieldsData',fields);
        this.props.BackStep({step: 'edge-case'})
      }
    } else {
      this.validator.showMessages();
      this.forceUpdate();
    }
  }

  inputHandler(e,slugToSet){
    let val = e.target.value;
    this.setState({[slugToSet]:val});
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
          <h4>Please fill your details</h4>
  
          <div className='panVerify disBlck'>
            <p>Verify using</p>
            <div className='linkingRadio' name="identifier_type">
              {
                get(this,'state.kycConfig.insurer_document_config.ckyc',[]).map((item,index)=>{
                  return (
                      <label>
                          <input
                            id="yes"
                            type="radio"
                            name="link"
                            value={item.document_slug}
                            checked={this.state.identifierType === item.document_slug}
                            onChange={(e) =>{
                              this.validator.purgeFields();
                              this.setState({ 
                                identifierType: item.document_slug,
                                pageFields: get(item,'fields',[]),
                                pageImageField:get(item,'options',[])
                              });
                            }}
                          />{" "}
                          <span>{toCapitalizeFirstLetter(item.document_name)}</span>
                      </label>
                  );
                })
              }
            </div>
            {this.validator.message('identifier_type', this.state.identifierType, 'required')}
          </div>
          {
            get(this,'state.pageImageField',[]).map((item)=>{
              if(item.step != 1)
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
              if(item.step != 1)
                return null;
              if(item.slug == 'dob' || item.input_type == 'date'){
                return <div name="date_of_birth">
                  <CustomDatePicker
                    key={item.slug}
                    id={item.slug}
                    label={toCapitalizeFirstLetter(item.slug) || item.description}
                    minDate={childMinDate}
                    maxDate={childMaxDate}
                    focusOnElm={true}
                    bodyScroll={false}
                    date={get(this.state,`${item.slug}`) ? new Date(get(this.state,`${item.slug}`)) : ''}
                    list="day"
                    onChange={(d) => {
                      let kyc_details_dob=d.toISOString().slice(0,10)
                      setSessionStorageItem('kyc_details_dob',kyc_details_dob);
                      this.setState({[item.slug]:d.toISOString().slice(0,10)})
                    }}
                  />
                  {this.validator.message('date_of_birth', get(this.state,`${item.slug}`), 'required')}
                </div>
              }
              if(item.input_type == "text") {
                  return (
                      <div className="panInput">
                          <div className="fldBtm20">
                              <label>{item.description || `Enter ${toCapitalizeFirstLetter(item.slug)} details`}</label>
                              <input
                                  type="text"
                                  name={item.slug}
                                  placeholder={item.description || `Enter ${toCapitalizeFirstLetter(item.slug)}`}
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
                            <label>{item.description || `Enter valid ${toCapitalizeFirstLetter(item.slug)} details`}</label>
                            <input
                                type="number"
                                name={item.slug}
                                placeholder={item.description || `Enter ${toCapitalizeFirstLetter(item.slug)}`}
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
                                    }>
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
                                    get(this.state,`${item.slug}`),
                                    "required"
                                )}
                            </div>
                        </div>
                    </div>
                );
              }
            })
          }
          {this.props.kycState.kycData && (this.props.kycState.kycData.kycVerified === false) && <ErrorMessage errorType={this.props.kycState.kycData.errorCode} />}
          
          
          <p>I give my consent to the insurance company to obtain CKYC.</p>
          <div className="nextButton">
            <button className="lineBtn" onClick={() => this.props.BackStep({ step: 'main' })}>Back</button>
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
  BackStep, InprogressCkyc
}
export default connect(mapStateToProps, mapDispatchToProps)(Step2);