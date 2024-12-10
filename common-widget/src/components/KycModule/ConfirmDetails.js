import React, { useEffect, useState } from 'react';
import FormValidator from "simple-react-validator";
import { fetchOkycDetails, mainPage, BackStep, UpdateLmw, OkycLmw } from '../../redux/actions/KycActions';
import { useHistory } from 'react-router-dom'
import { createSelectorHook, createDispatchHook } from "react-redux";
import { getQueryParams, removeParams, setSessionStorageItem } from '../../utils/globals';
import ErrorMessage from './ErrorMessage';
function ConfirmDetails(props) {
    
  let useSelector = createSelectorHook(props.context);
  let useDispatch = createDispatchHook(props.context);

  const history = useHistory();
  const [, updateState] = useState();
  const [checked, setChecked] = useState('');
  const [showError, setShowError] = useState(false);
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const dispatch = useDispatch();
  const kycState = useSelector(
    (state) => state.KycReducer
  );

  const okycData = kycState.okycData;

  let validator = new FormValidator({validators: {}});
    useEffect(()=>{
        dispatch(fetchOkycDetails());
        },[]);
        
    const onConfirmHandler = () =>{
        if (validator.allValid()) {
            setSessionStorageItem("okycDetails",okycData);
            let kycId = getQueryParams("kycId")
            dispatch(OkycLmw({kycId,history}));  

        }else{
            setShowError(true);
            validator.showMessageFor('confirm');
            forceUpdate();
        }
    }
    const handleBack = () =>{
        let url = removeParams(['okycStatus'])
        url && history.replace({ pathname: url.pathname, search: url.search});
        dispatch(BackStep({step : "main"}));  

    }
    const renderConfirmation=()=>{
        return(<div><h4>We found your KYC details</h4>
        <p>Please verify the below KYC details</p>
        <div className='confirmKycDetails'>
            <p><span>AADHAAR :</span> {okycData && okycData.aadharId} </p>
            <p><span>NAME :</span>{okycData && okycData.kycName}</p>
            <p><span>ADDRESS :</span> {okycData && okycData.address}</p>
        </div>
        <div className='confirmCheck'>
            <label>
                <input type="checkbox" name="confirm" checked={checked} onChange={(e)=>{let value = e.target.checked ? true : '';setChecked(value)}}/>
                {showError && validator.showMessageFor('confirm')}
                {validator.message('confirm', checked, 'required')}
            </label>
            <p>I hereby confirm that the above information is correct to the best of my knowledge. I understand that in the event of my information
            being found false or incorrect at any stage will lead to cancellation of my policy</p>
        </div>
        <div className="nextButton">
        <button className="lineBtn" onClick={handleBack}>Not My Details</button>
        <button className="solidBtn" onClick={onConfirmHandler}>Confirm</button>
        </div></div>)
    }
    const renderNameMismatch=()=>{
        return(<div>
            <ErrorMessage errorType='NAME_MISMATCH'/>
            <div className="nextButton">
                <button className="lineBtn" onClick={handleBack}>Try Again</button>
            </div>
        </div>)
    }
        return(
            <div className='confirmDetails'>
                {okycData && (okycData.kycVerified ? renderConfirmation() : renderNameMismatch())}
            </div>
        )
    }

export default ConfirmDetails;
