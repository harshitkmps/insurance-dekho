import React from 'react';
import CompleteImage from '../../img/complete.png';
import PendingImage from '../../img/pending.svg';
import { createSelectorHook, createDispatchHook } from "react-redux";
import { mainPage } from '../../redux/actions/KycActions';

function KycComplete(props){
  let useSelector = createSelectorHook(props.context);
  let useDispatch = createDispatchHook(props.context);
  const dispatch = useDispatch();
  const kycState = useSelector(
    (state) => state.KycReducer
  );
  const moduleOptions = useSelector(
    (state) => state.CommonReducer.moduleOptions
  );
  const handleClose = ()=>{
    dispatch(mainPage());
    moduleOptions.eventListener("close_button", {success:"true"});
  }
    return(
        <div className='kycCompleteStep'>
            {props.status =="pending" ? 
            
            <span>
              <h2>KYC Pending</h2>
              <img src={PendingImage} alt="Pending" />
            </span>: 
            <span>
              <img src={CompleteImage} alt="Complete" />
              <h2>KYC Completed</h2>
              <p>Your KYC is completed and we have received your details.</p>
            </span>}
            <button onClick={handleClose}>Close</button>
        </div>
    )
}

export default KycComplete;