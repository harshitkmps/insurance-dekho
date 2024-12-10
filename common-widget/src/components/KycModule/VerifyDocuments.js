import React from 'react';
import { connect } from "react-redux";
import { BackStep, StartOvd,UploadImage, edgeCaseOvd } from '../../redux/actions/KycActions';
import axios from 'axios';
import config from '../../app-configs/index';
import FormValidator from "simple-react-validator";
import { getSessionStorageItem, setSessionStorageItem, toCapitalizeFirstLetter } from '../../utils/globals';
import {get} from 'lodash';

const defaultProps = {
    selected:'',
    docNumber:'',
    front:null,
    frontDoc:null,
    backDoc:null,
    back:null,
    confirm:null,

    tempFields:{},
    fields:[],

    nextStepFields:[],
    nextStepOptions:[],

    requireOvd:[],    
    optionalOvd:[],

    mandatory:false,
    stepFields :[],
    stepOptions :[],

}

const kycConfig = getSessionStorageItem("kycConfig");
const ovd = kycConfig?.insurer_document_config?.ovd;
class VerifyDocuments extends React.Component{
    constructor(props, context) {
        super(props, context);
        this.state = this.context.data || window.__INITIAL_STATE__ || defaultProps;
        this.handleUpload = this.handleUpload.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
        this.setInitialState = this.setInitialState.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleChange = this.handleChange.bind(this);
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

    //to upload file and set the url for view
    handleUpload(e){
        if(e.target.files && e.target.files.length == 0){
            return;
        }
        let file = e.target.files[0];
        let formData = new FormData();
        formData.append("file", file);
        let url = `${config.kycApiBaseUrl}/v2/kyc/document-upload`;
        axios.post(url, formData, {
            headers: {"Content-Type": "multipart/form-data"},
        }).then((response) => {
            let doc_id = response?.data?.data?.doc_id;
            this.setState({[e.target.name]:doc_id,[`${e.target.name}_file`]:file,[`${e.target.name}_url`]:URL.createObjectURL(file)})
        }).catch((error) => {
            console.log(error);
        });
    }

    submitHandler(e){
        e.preventDefault();
        if (this.validator.allValid()) {
            let requireOvd = this.state.requireOvd;
            let optionalOvd = this.state.optionalOvd;
            let fields = this.state.fields
            if(this.state.mandatory){
                this.state.requireOvd.map((item,index)=>{
                    if(item.document_slug === this.state.selected){
                        item.fields.length && item.fields.map(val=>{ 
                            if(val.step == 1){
                                let field = {};
                                field["slug"] = val.slug;
                                field["value"] = this.state[val.slug];
                                field["master_id"] = val.master_id;
                                field["is_additional_info"] = val.is_additional_info;
                                field["frontImage"] = "";
                                field["backImage"] = "";
                                
                                fields.push(field);
                                this.setState({fields});
                            } else if(val.step == 2){
                                let nextStepFields = this.state.nextStepFields;
                                nextStepFields.push(val);
                            }   
                        })
                        item.options.length && item.options.map(val=>{
                            if(val.step == 1){
                                let field = {};
                                field["slug"] = val.document_slug;
                                field["value"] = ""
                                field["master_id"] = val.master_id;
                                field["is_additional_info"] = val.is_additional_info;
                                let docSlug = val.document_slug;
                                if(docSlug && docSlug.includes('back')){
                                    field["backImage"] = get(this.state,`${val.document_slug}`,"");
                                    field["frontImage"] = "";
                                }else{
                                    field["frontImage"] = get(this.state,`${val.document_slug}`,"");
                                    field["backImage"] = "";
                                }
                                fields.push(field);
                                this.setState({fields});    
                            } else if(val.step == 2){
                                let nextStepOptions = this.state.nextStepOptions;
                                nextStepOptions.push(val);
                            } 
                            

                        })
                        requireOvd.splice(index, 1);
                        let mandatory = !! requireOvd.length;
                        this.setState({selected:'',mandatory,requireOvd,stepFields:[],stepOptions:[]});                        
                    }
                })
            } else{
                optionalOvd.map((item,index)=>{
                    if(item.document_slug === this.state.selected){
                        item.fields.length && item.fields.map(val=>{
                            if(val.step == 1){
                                let field = {};
                                field["slug"] = val.slug;
                                field["value"] = this.state[val.slug];
                                field["master_id"] = val.master_id;
                                field["is_additional_info"] = val.is_additional_info;
                                field["frontImage"] = "";
                                field["backImage"] = "";
                                fields.push(field);
                                this.setState({fields});
                            } else if(val.step == 2){
                                let nextStepFields = this.state.nextStepFields;
                                nextStepFields.push(val);
                            }  
                        })
                        item.options.length && item.options.map(val=>{
                            if(val.step == 1){
                                let field = {};
                                field["slug"] = val.document_slug;
                                field["value"] = "";
                                field["master_id"] = val.master_id;
                                field["is_additional_info"] = val.is_additional_info;
                                let docSlug = val.document_slug;
                                if(docSlug && docSlug.includes('back')){
                                    field["backImage"] = get(this.state,`${val.document_slug}`,"");
                                    field["frontImage"] = "";
                                }else{
                                    field["frontImage"] = get(this.state,`${val.document_slug}`,"");
                                    field["backImage"] = "";
                                }
                                fields.push(field);
                                this.setState({fields});
                            }else if(val.step == 2){
                                let nextStepOptions = this.state.nextStepOptions;
                                nextStepOptions.push(val);
                            }   
                          
                        })
                    }
                });
            if(this.state.nextStepFields.length || this.state.nextStepOptions.length){
                setSessionStorageItem("kycFieldsData",this.state.fields);
                this.props.edgeCaseOvd({nextStepFields:this.state.nextStepFields, nextStepOptions: this.state.nextStepOptions, is_id_module:kycConfig.status_config.is_id_module})
            } else{
                this.props.StartOvd({payload:{fields,is_id_module:kycConfig.status_config.is_id_module}});
            }
            }
          } else {
            this.validator.showMessages();
            this.forceUpdate();
          }
        }
    //When user select an option from available options 
    handleSelect(e,activeOvd){
        this.validator.purgeFields();
        activeOvd.map((val, ind)=>{
            
            if(e.target.value === val.document_slug){
                let stepFields=[],stepOptions=[];
                val.fields.length && val.fields.map(item=>{
                    if(item.step == 1){
                        stepFields.push(item);
                    }
                })
                val.options.length && val.options.map(item=>{
                    if(item.step == 1){
                        stepOptions.push(item);
                    }
                })
                this.setState({selected:e.target.value, stepFields, stepOptions, tempFields:{}});
            }
        });
    }
    handleChange(e){
        let slug = e.target.name;
        this.setState({[slug]: e.target.value})
    }
    setInitialState(){
        let requireOvd = [];
        let optionalOvd = [];
        ovd && ovd.forEach( option => {
            option.mandatory ? requireOvd.push(option) : optionalOvd.push(option)
        });
        let mandatory = (requireOvd.length) ? true : false;
        this.setState({requireOvd,optionalOvd,mandatory})
    }

    componentDidMount(){
        this.setInitialState();
        this.setState({fields:[],nextStepFields:[],nextStepOptions:[]});
    }

    render(){
        let activeOvd = (this.state.mandatory) ? this.state.requireOvd : this.state.optionalOvd;
        return(
            <div className='verifyDocumentsSection kycFormFixed'>
                <h4>Verify by Officially Valid<br /> Document (OVD)</h4>
                <div className='selectDoc'>
                    <select value={this.state.selected} name="document_type" onChange={(e) => this.handleSelect(e,activeOvd)} onBlur={() => this.validator.showMessageFor('document_type')}>
                        <option disabled value='' key="select_doc">
                            Select Document
                        </option>
                    {console.log("inside the map12",activeOvd)}
                        {activeOvd.map((value, index) => {
                            return (
                                <option value={value.document_slug} key={index}>
                                    {value.document_name}
                                </option>
                            );
                        })}
                    </select>
                    {this.validator.message('document_type', this.state.selected, 'required')}
                </div>
                <div className='verifyDetails'>
                    {console.log("inside the map1",this.state.stepFields)}
                    {this.state.stepFields.map((item,i)=>{
                        if(item.input_type == "text") {
                            return (
                                <div className="panInput" key={i}>
                                    <div className="fldBtm20">
                                        <label>{item.description || `Enter valid ${toCapitalizeFirstLetter(item.slug)} details`}</label>     
                                        <input
                                            type="text"
                                            name={item.slug}
                                            placeholder={item.description || `Enter ${toCapitalizeFirstLetter(item.slug)}`}
                                            value={get(this.state,`${item.slug}`)}
                                            id={item.slug}
                                            onChange={this.handleChange}
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
                                            onChange={this.handleChnage}
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
                    })}
                    {!!(this.state.stepOptions).length && 
                        <div>
                            <div className='uploadCondition'>
                                <h5>Please upload the selected document</h5>
                                <p>
                                    Image should be clear with all details visible</p>
                            </div>
                        <div className='uploadDocuments '>
                        {console.log("inside the map123",this.state.stepOptions)}
                        { this.state.stepOptions.map((item,key)=>{
                            return (
                                <div key={key}>
                                    <div className='uploadInner' >
                                    <input type="file" id="file" name={item.document_slug} 
                                        onChange={this.handleUpload}
                                        accept={(item.document_file_type).toString()}/>
                                    {get(this.state,`${item.document_slug}_url`) ? <img style={{ width: "100%" }} src={get(this.state,`${item.document_slug}_url`)}/>:"" }
                                    </div>
                                    <p className="uploadStatus">{item.document_name.replaceAll('_', ' ')}</p>
                                    <div>
                                        {this.validator.message(item.document_slug,get(this.state,`${item.document_slug}_file`), 'required|validateFile')}
                                    </div>
                                </div>
                            )
                            })}
                        </div>
                        </div>
                    
                    }
                    
                    <div className='confirmCheck'>
                        <p>Any incorrect information on the document may lead policy cancellation.</p> 
                    </div>
                </div>
                <div className="nextButton">
                        <button className="lineBtn" onClick={() => this.props.BackStep({ step: 'main' })}>Back</button>
                        <button className="solidBtn" disabled={(this.props.kycState.loader && this.props.kycState.loader.verify_doc_next)?true:false} type='submit' onClick={this.submitHandler}>Next { this.props.kycState.loader && this.props.kycState.loader.verify_doc_next?<i className="whiteCircle_m"></i>:''}</button>
                    </div>
            </div>
        )
        
    }
    
}
const mapStateToProps = (state) =>{
    return {kycState:state.KycReducer}
  }
  const mapDispatchToProps = {
    BackStep, StartOvd,UploadImage, edgeCaseOvd 
  }
export default connect(mapStateToProps, mapDispatchToProps)(VerifyDocuments);