import React from 'react';

function ErrorMessage(props){
    return(
        <div className='errorMessageSection'>
            {(props.errorType =='NAME_MISMATCH')?
            <span>
                <div className='errorMessage'>Name Mismatch</div>
                <div className='nameError'>Please ensure the Name on your Card is<br /> same as filled in the propsal form</div>
            </span>
            :<div className='errorMessage'>Details Not Found</div>
            }
        </div>
    )
}

export default ErrorMessage;