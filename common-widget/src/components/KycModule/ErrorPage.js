import React from 'react';
import { updateStep } from '../../redux/actions/KycActions';
import { connect } from "react-redux";
import NoResult from '../../../src/img/v2_no_result.svg';

const defaultProps = {}
class ErrorPage extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = this.context.data || window.__INITIAL_STATE__ || defaultProps;
    }

    render() {
        return (

            <div className='noResultPage'>
                <div className="resultBack" onClick={(e)=>{this.props.updateStep({ step: 'main' })}}><a href="#"><section>
                    <span class="left"></span>
                </section></a></div>
                <div className="noResultimg"> <img src={NoResult} alt="No Result"/></div>
                <div className="noResultCon"><p>Your KYC is failed, Please go back and try another option.</p></div>
                <div className="resultBackButton">
                    <button className="solidBtn" type='submit' onClick={(e)=>{this.props.updateStep({ step: 'main' })}}>Go Back</button>
                </div>
            </div>

        )
    }
}
const mapStateToProps = (state) =>{
    return {kycState:state.KycReducer}
  }
const mapDispatchToProps = {
    updateStep
  }
export default connect(mapStateToProps, mapDispatchToProps)(ErrorPage);