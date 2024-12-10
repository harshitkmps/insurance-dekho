import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './modalCss.css'
const Modal = (props)=>{
    let [open,setOpen] = useState(props.open?props.open:false);
    let [className] = useState(props.className);
    let [children,setChildren] = useState(props.children);

    useEffect(()=>{
        setOpen(props.open);
        setChildren(props.children);
       
    },[props])

    if(typeof document == "undefined"){
        return null;
    }

    if(open !== true && document && document.body){
        if(props.bodyScroll == undefined || props.bodyScroll == true){
            document.body.classList.remove("gsc_Noscroll");
        }
        return null;
    }
    
    function closePopup() {
        if(typeof props.closeClickOnOutsideElement == 'function') {
            props.closeClickOnOutsideElement()
        }
    }

    function createElement(){
        document.body.classList.add("gsc_Noscroll");
        if(document.getElementById("modal-popup") == undefined){
            let dc = document.createElement("div");
            dc.id = "modal-popup";
            document.body.appendChild(dc);
        }
        return (<div className={`ModelPopUi ${className?className:""}`}>
        <div onClick={() => closePopup() } className="modelPopBg"></div>
        {children}
        </div>);
    }

    return ReactDOM.createPortal(
        createElement(),
        document.getElementById('modal-popup')
      )
   
}
export default Modal;