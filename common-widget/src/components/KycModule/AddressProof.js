import React, { Fragment } from 'react';
import { BackStep, InprogressOkyc } from '../../redux/actions/KycActions';
import ErrorMessage from './ErrorMessage';
import FormValidator from "simple-react-validator";
import { connect } from "react-redux";
import CustomDatePicker from '../elements/CustomDatePicker';
import { getSessionStorageItem, toCapitalizeFirstLetter, uploadDocument, checkStepsToShow, setSessionStorageItem} from '../../utils/globals';
import {get} from 'lodash';

const defaultProps = {
  selected:null,
  docNumber:'',
  dob:''
}

class AddressProof extends React.Component{

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

  inputHandler(e,slugToSet){
    let val = e.target.value;
    this.setState({[slugToSet]:val});
  }
  
  componentDidMount() {
    let kycConfig = getSessionStorageItem('kycConfig');
    this.setState({
      kycConfig:kycConfig,
      pageFields:[],
      pageImageField:[]
    });
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
      if(!checkStepsToShow(this.state.kycConfig,'okyc',this.state.identifierType,2)){
        //No fields for next step so show so submit
        this.props.InprogressOkyc({ fields :fields });
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
  render(){
    let childMinDate = new Date();
    let childMaxDate = new Date();
    childMinDate.setYear(childMinDate.getFullYear() - 100);
    childMaxDate.setYear(childMaxDate.getFullYear() - 1);
    childMinDate.setDate(childMinDate.getDate() + 1);
    return (
      <div className='KycStep2 kycFormFixed'>
        <form onSubmit={(e) => this.submitHandler(e)}>
          <h4>Please select any Address Proof for verification</h4>

          <div className="panInput">
            <div className="verifyDocumentsSection">
              <div className="selectDoc">
                    <select
                        value={get(this.state,`identifierType`,"")}
                        name="document_type"
                        onChange={(e) =>
                          {
                            this.validator.purgeFields();
                            this.setState({identifierType: e.target.value},()=>{
                              let objSelected = get(
                                  this.state,
                                  "kycConfig.insurer_document_config.okyc",
                                  []
                              ).find(
                                  (item) =>
                                      item.document_slug ==
                                      this.state.identifierType
                              );
                              this.setState({
                                  pageFields: get(objSelected, "fields"),
                                  pageImageField: get(objSelected, "options"),
                              });
                            });
                          }
                        }>
                        <option value="" disabled selected hidden>Select Document</option>
                        {get(this.state,'kycConfig.insurer_document_config.okyc',[]).map(
                            (ele) => {
                                return (
                                    <option
                                        value={ele.document_slug}
                                        key={ele.document_slug}
                                    >
                                        {ele.document_name}
                                    </option>
                                );
                            }
                        )}
                    </select>
                    {this.validator.message(
                      "document_type",
                      this.state.identifierType,
                      "required"
                    )}
                </div>
            </div>
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
                      this.setState({ [item.document_slug]: e.target.files[0],[`${item.document_slug}_url`] : URL.createObjectURL(e.target.files[0])});
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
                              <label>{item.description || `Enter valid ${toCapitalizeFirstLetter(item.slug)} details`}</label>
                              <input
                                  type="text"
                                  name={item.slug}
                                  placeholder={item.description || `Enter ${toCapitalizeFirstLetter(item.slug)}`}
                                  value={get(this.state,`${item.slug}`)}
                                  id={item.slug}
                                  onChange={(e)=>this.inputHandler(e,item.slug)}
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
                                        this.setState({[item.slug]: e.target.value})
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
  BackStep, InprogressOkyc
}
export default connect(mapStateToProps, mapDispatchToProps)(AddressProof);