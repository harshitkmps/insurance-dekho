import React, { useEffect, useState } from 'react';
import PanImage from '../../img/pan.png';
import AadhaarImage from '../../img/aadhaar.png';
import UploadImage from '../../img/upload.svg';
import { createSelectorHook, createDispatchHook } from "react-redux";
import { StartCkyc, StartOkyc } from '../../redux/actions/KycActions';
import { getSessionStorageItem, setSessionStorageItem, isProduct, getQueryParams } from '../../utils/globals';
import config from "../../app-configs/index";
import { getData } from '../../utils/api';
import {get} from 'lodash';

const Step1 = (props) => {

    let useSelector = createSelectorHook(props.context);
    let useDispatch = createDispatchHook(props.context);
    let productTypes = getSessionStorageItem('productType');  

    const dispatch = useDispatch();

    const [kycMode, setKycMode] = useState('');
    const [isCompanyVehicle,setIsCompanyVehicle] = useState('no');
    const [organizationType,setOrganizationType] = useState('individual');
    const [kycConfig,setKycConfig] = useState(getSessionStorageItem('kycConfig'));
    let lmsProduct = getQueryParams('product');

    const kycState = useSelector(
        (state) => state.KycReducer
    );

    useEffect(() => {
        if (kycState.identifierType) {
            setKycMode(kycState.identifierType);
        }
        if((isProduct('bike-insurance') || isProduct('car-insurance') || productTypes === 'motor-insurance') || (lmsProduct === 'motor-insurance')){
            fetchMasterApi(organizationType);
        }
        console.log("inside useeffect ===========>");
        window.onmessage = function(e) {
            if (e.data.eventType == 'set_kyc_session_storage') {
                console.log("inside onmessage ===========>",e);
                let kycEventPayload = get(e,"data.kycEventPayload",{});
                let kycRedirectBackUrl = get(e,"data.kycRedirectBackUrl",'');
                let metaData = get(e,"data.metaData",'');
                console.log("inside event ===========>",e.data);
                setSessionStorageItem('kycConfig',kycEventPayload);
                setSessionStorageItem('kycRedirectBackUrl',kycRedirectBackUrl);
                setSessionStorageItem('metaData',metaData);
                setKycConfig(kycEventPayload);
            }
        }
    }, []);

    const fetchMasterApi = async (customer_type) =>{
        try{
            let selectedQuotes = getSessionStorageItem('quotes');
            let insurerId = get(selectedQuotes,'insurerId');
            insurerId = insurerId? insurerId : getQueryParams('insurerId');
            if(!insurerId)
                return;
            const result = await getData(config.brokerageMasterUrl+`api/v1/master/kyc/config?insurer_id=${insurerId}&customer_type=${customer_type}`,{});
            if(get(result,'data')){
                setSessionStorageItem('kycConfig',result.data); 
                setKycConfig(result.data);
            }     
        }
        catch(err){
            console.log(err);
        }
    }

    const StartKyc=(e) =>{
        e.preventDefault();
        switch (kycMode) {
            case 'pan': {
                props.updateToParent({typeOfKyc:'ckyc'});
                dispatch(StartCkyc({identifierType:kycMode,step:'verify-pan'}));
                break;
            }
            case 'addressProof':{
                props.updateToParent({typeOfKyc:'okyc'});
                dispatch(StartOkyc({identifierType:kycMode, step:'address-proof'}));
                break;
            }
            case 'document':{
                props.updateToParent({typeOfKyc:'ovd'});
                dispatch(StartCkyc({identifierType:kycMode,step:'select-document'}));
                break;
            }
            default:
                break;
        }
    }
    const onTypeChange = (e) => {
        setKycMode(e.target.value);
    }
    const status_config = kycConfig?.status_config;
    return (
        <div className="KycStep1">
            <h4>Let’s get you KYC verified</h4>
            <p>As per IRDAI guidelines, it is now mandatory. </p>
            <h4> KYC Should Be Done For 18+ Only</h4>
            {(isProduct('bike-insurance') || isProduct('car-insurance') || productTypes === 'motor-insurance' || (lmsProduct === 'motor-insurance')) && 
                <div class="panVerify dis-blck">
                    <p>Is this vehicle in company’s name?</p>
                    <div class="linkingRadio" name="identifier_type">
                        <label>
                            <input 
                                id="yes" 
                                type="radio" 
                                name="link" 
                                value="yes" 
                                checked={isCompanyVehicle === 'yes'}
                                onChange={(e) =>{
                                    setIsCompanyVehicle('yes');
                                    fetchMasterApi("organization");
                                    setOrganizationType("organization");
                                }}
                            />{" "}
                            <span>Yes</span>
                        </label>
                        <label>
                            <input 
                                id="no" 
                                type="radio" 
                                name="link" 
                                value="no"
                                checked={isCompanyVehicle === 'no'}
                                onChange={(e) =>{
                                    setIsCompanyVehicle('no');
                                    fetchMasterApi("individual");
                                    setOrganizationType("individual");
                                }}
                            />{" "}
                            <span>No</span>
                        </label>
                    </div>
                </div>
            }
            <h3>Choose any 1 option</h3>

            <div className="kycOptions">
                <ul>
                    {(status_config && !!status_config.is_ckyc_enabled) && <li>
                        {/* {<li> */}
                        <label htmlFor="pan">
                            <div className="sinClick"><span>Instant KYC</span></div>
                            <input type="radio" id="pan" value="pan" name="kycoptions" checked={kycMode === 'pan'} onChange={onTypeChange} />
                            <div className="kycOptionsInner">
                                <div className="optionsText">
                                PAN {get(kycConfig,'status_config.is_id_module',0) ? " ":  "or CKYC No."}<span>(via Digital cKYC)</span>
                                </div>
                                <div>
                                    <img src={PanImage} alt="Pan" />
                                </div>
                            </div>
                        </label>
                    </li>}
                    {(status_config && !!status_config.is_okyc_enabled) && <li>
                        <label htmlFor="addressProof">
                            <div className="sinClick"><span>Instant KYC</span></div>
                            <input type="radio" id="addressProof" value="addressProof" name="kycoptions" checked={kycMode === 'addressProof'} onChange={onTypeChange} />
                            <div className="AadharOptionInner">
                                <div className='aadharInner'>
                                    <div className="optionsText">
                                        Address Proof<span>(Aadhar, Driving License, Passport, Voter ID, etc.)</span>
                                    </div>
                                    <div>
                                        <img src={AadhaarImage} alt="Address Proof" />
                                    </div>
                                </div>
                            </div>
                        </label>
                    </li>}
                    {(status_config && !!status_config.is_ovd_enabled) && <li>

                        <label htmlFor="document">
                        <div className="sinClick sinClick"><span className="red">Upto 6 hours</span></div>
                            <input type="radio" id="document" value="document" name="kycoptions" checked={kycMode === 'document'} onChange={onTypeChange} />
                            <div className="kycOptionsInner">
                                <div className="optionsText">
                                Upload Officially Valid Document (OVD)
                                </div>
                                <div>
                                    <img src={UploadImage} alt="Upload" />
                                </div>
                            </div>
                        </label>
                        {/* <span className="processNote">Using this process generates the policy within 20-25 mins</span> */}
                    </li>}
                </ul>
            </div>
            <div className="nextButton">
                <button disabled={(kycState.loader && kycState.loader.okyc_next ? true : false)} className="solidBtn" onClick={StartKyc}>Next {kycState.loader && kycState.loader.okyc_next ? <i className="whiteCircle_m"></i> : ''}</button>
            </div>
        </div>
    )
}

export default Step1;