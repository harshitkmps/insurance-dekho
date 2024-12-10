/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-globals */
import React, {useState, useEffect} from "react";
import "../../LearningModule/css/CommonGlobal.css";
import editIcon from "../../../img/editIcon.svg";
import downloadIcon from "../../../img/download.svg";
import share from "../../../img/share.svg"
import backicon from "../../../img/v2_arrow_left.svg";
import loadingImg from "../../../img/loading-white.svg";
import Modal from "../../elements/Modal";
import CloseIcon from '../../../img/v2_close.svg';
import InputFieldV2 from "../../elements/InputFieldV2";
import detect from '../../../utils/detect';
import { createDispatchHook, createSelectorHook } from 'react-redux'
import { getBanner, getCustomBanner, resetCustomBanner, addBanner, deleteBanner , editBannerCategory} from "../../../redux/actions/PromotionalBannerActions";
import config from '../../../app-configs/index'
import { useHistory } from 'react-router-dom'

export default function BannerPanel(props) {
  let useDispatch = createDispatchHook(props.context)
  let useSelector = createSelectorHook(props.context)
  const history = useHistory();
  let [openModal,setOpenModal] = useState(false);
  let [editValue,setEditValue] = useState([]);
  let [editMenu,setEditMenu] = useState(false);
  let [bannerId,setBannerId] = useState('');
  let [editableList,setEditableList] = useState([]);
  let apiResponse = {};
  let [bannerSelected,setBannerSelected] = useState('');
  let [categorySelected,setCategorySelected] = useState('All');
  let [submitClicked,setSubmitClicked] = useState(false);
  let [showLoader,setShowLoader] = useState(false);
  let validEntry=false;

  let dispatch = useDispatch();
  
  useEffect(() => {
    if(openModal){
      history.push('#viewbanner')
    }
  },[openModal]);
  
  useEffect(() => {
    if(editMenu){
      history.push('#editbanner')
    }
  },[editMenu]);

  useEffect(() => {
    return history.listen(location => {
      if (history.action === 'POP') {
        console.log(51, history)
        if(location.hash == ''){
          closeModal()
        }else if(location.hash == '#viewbanner'){
          setEditMenu(false);
        }
      }
    })
  }, [ history.action ])

  useEffect(() => {
    let options;
    if(categorySelected != 'All'){
      options = {category : categorySelected,pageSize:500}
    }
    else{
      options = {pageSize:500}
    }
    dispatch(getBanner(options))
  }, [categorySelected]);

  apiResponse = useSelector((state) => (state.PromotionalBannerReducer && state.PromotionalBannerReducer.banners)?state.PromotionalBannerReducer.banners:{})

  function onChange(e){
    let temp=editValue;
    temp[e.target.id].value = e.target.value;
    setEditValue([...temp]);
  }

  function setPrefilledValue(list){
    list = list.map((item)=> {
      let tempVar =item;
      tempVar.value='____';
      if(config.promotionalBannerModule && config.promotionalBannerModule.prefilledVariable && config.promotionalBannerModule.prefilledVariable.indexOf(item.variable) != -1)
      {
        tempVar.value=props.moduleOptions[item.variable] ? props.moduleOptions[item.variable] : '____' ;
      }
      else{
        tempVar.value='____';
      }
      return tempVar;
    })
    return list;
  }
  function getCustomBannerFromValue(){
    if(validEntry){
      let options ={
        imageId : bannerId,
        editableList : editValue
      }
      dispatch(getCustomBanner({options:options,history:history,setShowLoader:setShowLoader}))
      setSubmitClicked(false);
    }
    else{
      setSubmitClicked(true);
    }
  }

  const handleShare = async(imageUrl)=> {
    try {
      if (detect.isAndroid()) {
        window.Android.shareImage(imageUrl, "Sharing the image");
      } else if (detect.isIphone()) {
        window.webkit.messageHandlers.common.postMessage(
            JSON.stringify({
              event: "shareImage",
              data: imageUrl,
            }),
        );
      } else {
        console.log(`system does not support sharing files.`);
      }
    } catch (err) {
      console.error("Error while sending message to devices:", err);
    }
  }
  
  let customBanner = useSelector((state)=>(state.PromotionalBannerReducer && state.PromotionalBannerReducer.customBanner)?state.PromotionalBannerReducer.customBanner:'')
  function closeModal(back = false){
    setOpenModal(false);
    setBannerId('');
    setEditMenu(false);
    setEditableList([]);
    setEditValue([]);  //Edited values set
    dispatch(resetCustomBanner());
    setSubmitClicked(false);
    if(back){
      history.goBack();
    }
  }
  
  function validateString(value){
    if(value && value.trim().length>0)
      return true;
    return false;
  }

  function download(source){
    const fileName = source.split('/').pop();
    var el = document.createElement("a");
    el.setAttribute("href", source);
    el.setAttribute("download", fileName);
    document.body.appendChild(el);
    el.click();
    el.remove();
  }


  useEffect(() => {
    let timeoutId = setTimeout(function () {
        let element = document.getElementsByClassName('editBanSec');
        if(element && element[0])
            element[0].classList.add('bottom0')
    }, 10);

    return () => {
        // Anything in here is fired on component unmount.
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }
  },[editMenu]);

  function renderEditMenu(editableList){
    validEntry = true;
    return (
      <div className="editBanSec">
        <h4>Edit Banner</h4>
        { editableList && editableList.length>0 && editableList.map((item,index)=>{
            if(!validateString(editValue[index].value))
              validEntry = false;
            return (
              <div>
                <InputFieldV2
                  inputProps={{
                    id: index,
                    type: "text",
                    name: item.title,
                    value: editValue[index].value,
                    onChange : onChange,
                  }}
                  labelProps={{
                      label: item.title
                  }}
                  className='left1rem'
              />
              {submitClicked && !validateString(editValue[index].value) &&
                <div className='srv-validation-message'>
                    The {item.title} field is required.
                </div>
              }
            </div>
          )})
        }

        <div className="btnGrp">
            <div className="wrapper"><button className="light-btn" onClick={()=>{setEditMenu(false);history.goBack()}}>Cancel</button>
            </div>
            <div className="wrapper">
            <button className="dark-btn" onClick={()=>getCustomBannerFromValue()}>Submit</button>
            </div>
        </div>
      </div>
      );
  }

  let addBannerField = [
    {
        "title": "Category",
        "variable": "category",
        "value": ""
    },
    {
        "title": "Vizard Link",
        "variable": "vizardUrl",
        "value": ""
    }
  ];

  let editBannerField = [
    {
        "title": "Category",
        "variable": "category",
        "value": ""
    }
  ];

  let [bannerField,setBannerField] = useState(addBannerField);
  let [addBannerButton,setAddBannerButton] = useState(false);
  let [showSuccessMessage,setShowSuccessMessage] = useState(false);
  let [showErrorMessage,setShowErrorMessage] = useState(false);
  let [errorMessage,setErrorMessage] = useState('');
  let [editBanner,setEditBanner] = useState(false);
  let [editBannerDetail,setEditBannerDetail] = useState({});
  let [editBannerButton,setEditBannerButton] = useState(false);

  function onChangeAddBanner(e){
    let temp = [...bannerField];
    temp[e.target.id].value = e.target.value;
    setBannerField([...temp]);
  }

  function isInValidateString(value,title){
    if(value && value.trim().length>0)
      return "";
    return `The ${title} field is required.`;
  }

  function callback(response){
    if(response.status === 200 || response.code === 200)
    {
      setShowSuccessMessage(true);
      setBannerField(addBannerField);
      let options;
      if(categorySelected != 'All'){
        options = {category : categorySelected,pageSize:500}
      }
      else{
        options = {pageSize:500}
      }
      dispatch(getBanner(options))
      setAddBannerButton(false)
    }
    else{
      setShowErrorMessage(true);
      if(response.errorResp && response.errorResp.message)
        setErrorMessage(response.errorResp.message)
    }
  }

  function handleAddBanner(){
    setAddBannerButton(true);
    for(let i in bannerField){
      if(isInValidateString(bannerField[i].value,bannerField[i].title))
        return false;
    }
    let options = {};
    options["vizardUrl"]= bannerField[1].value;
    options["active"]=true;
    options["tags"]=["best"];
    options["category"]= bannerField[0].value;
    options["description"]="Image added by admin";
    options["userId"]="admin";
    dispatch(addBanner({options:options,callback:callback}))
  }

  function callbackEditDelete(){
    let options;
    if(categorySelected != 'All'){
      options = {category : categorySelected,pageSize:500}
    }
    else{
      options = {pageSize:500}
    }
    dispatch(getBanner(options))
  }

  function handleDeleteBanner(item){
    let options = {
      id:item._id,
      active:false
    }
    dispatch(deleteBanner({options:options,callback:callbackEditDelete}))
  }

  useEffect(()=>{
    if(apiResponse && apiResponse.category && apiResponse.category.length>0 && apiResponse.category.indexOf(categorySelected) === -1){
      setCategorySelected('All')
    }
  },[apiResponse])

  useEffect(()=>{
    if(showSuccessMessage){
      setTimeout(()=>{
        setShowSuccessMessage(false);
      },5000)
    }
    if(showErrorMessage){
      setTimeout(()=>{
        setShowErrorMessage(false);
        setErrorMessage('');
      },5000)
    }
  },[showSuccessMessage,showErrorMessage]);

  function renderAddBanner(){
    return (
      <div style={{"max-width":"500px"}}>
        {bannerField &&
          bannerField.length > 0 &&
          bannerField.map((item, index) => {
            return (
              <div>
                <InputFieldV2
                  inputProps={{
                    id: index,
                    type: "text",
                    name: item.title,
                    value: bannerField[index].value,
                    onChange: onChangeAddBanner,
                  }}
                  labelProps={{
                    label: item.title,
                  }}
                  className="left1rem"
                />
                {addBannerButton && isInValidateString(bannerField[index].value,item.title) &&
                  <div className="srv-validation-message">
                    {isInValidateString(bannerField[index].value,item.title)}
                  </div>
                }
              </div>
            );
          })}
          <button className="dark-btn" onClick={()=>handleAddBanner()}>Add Banner</button>
      </div>
    );
  }

  function closeEditBanner(){
    setEditBanner(false);
  }

  function handleEditBanner(){
    setEditBannerButton(true);
    for(let i in editBannerField){
      if(isInValidateString(editBannerDetail[editBannerField[i].variable],editBannerField[i].title))
        return false;
    }
    let payload = {};
    console.log(editBannerDetail)
    payload['id']=editBannerDetail['_id']
    payload['category']=editBannerDetail['category']
    dispatch(editBannerCategory({options:payload,callback:callbackEditDelete}))
    closeEditBanner();
  }

  function handleEditPopup(item){
    setEditBanner(true);
    setEditBannerDetail(item)
  }

  function onChangeEditValue(e){
    e.preventDefault();
    let temp = {...editBannerDetail};
    temp[e.target.id] = e.target.value;
    setEditBannerDetail({...temp});
  }

  useEffect(() => {
    let timeoutId = setTimeout(function () {
        let element = document.getElementsByClassName('editBanSec');
        if(element && element[0])
            element[0].classList.add('bottom0')
    }, 10);

    return () => {
        // Anything in here is fired on component unmount.
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }
  },[editBanner]);

  function renderEditBanner(){
    return <Modal open={editBanner}>
          <div className={detect.isDesktop()?'commonsteppopup width400':'editBanSec'}>
            <h4>Edit Video</h4>
            <div className="popup_closeBtn" onClick={() => closeEditBanner()}><img src={CloseIcon} alt="close"/></div>
            {editBannerField &&
              editBannerField.length > 0 &&
              editBannerField.map((item, index) => {
                return (
                  <div>
                    <InputFieldV2
                      inputProps={{
                        id: item.variable,
                        type: "text",
                        name: item.title,
                        value: editBannerDetail[item.variable],
                        onChange: onChangeEditValue,
                      }}
                      labelProps={{
                        label: item.title,
                      }}
                      className="left1rem"
                    />
                    {editBannerButton && isInValidateString(editBannerDetail[item.variable],item.title) && (
                      <div className="srv-validation-message">
                        {isInValidateString(editBannerDetail[item.variable],item.title)}
                      </div>
                    )}
                  </div>
                );
              })}

            <div className="btnGrp">
              <div className="wrapper">
                <button className="light-btn" onClick={()=>closeEditBanner()}>Cancel</button>
              </div>
              <div className="wrapper">
                <button className="dark-btn" onClick={()=>handleEditBanner()}>Submit</button>
              </div>
            </div>
          </div>
      </Modal>
  }

  if(props.userRole !== 'admin')
    return null;
  return (
    <div className="commonContainer980">
      <div className={props.moduleOptions.product !== "IDEDGE" ? "roundBorder" : ""}>
        {props.moduleOptions.product !== "IDEDGE" && <h2>Promotional Banners</h2>}
        
        <div className="commonWidgets">
          <h3>Add Banner</h3>
          {
            renderAddBanner()
          }
          {showSuccessMessage && 
            <div className="success-message">
              {`Banner Added Successfully`}
            </div>
          }
          {showErrorMessage && 
            <div className="error-message">
              {(errorMessage && errorMessage.length>0)? errorMessage : "Something Went Wrong"}
            </div>
          }
        </div>

        <div class="gsc_ta_scroll  gsc_ta_scroll_move ">
          <ul class="gsc-ta-clickWrap " data-track-section="tab">
            <li title="All" className={"All" == categorySelected ? "gsc-ta-active" : ""} onClick={()=>setCategorySelected('All')}>
              All
            </li>
            {
              apiResponse && apiResponse.category && apiResponse.category.map((item)=>{
                return (<li title={item} className={item == categorySelected ? "gsc-ta-active" : ""} onClick={()=>setCategorySelected(item)}>
                {item}
              </li>)
              })
            }
          </ul>
        </div>
        <ul className="gridStyle">
          {
            apiResponse && apiResponse.results && apiResponse.results.map((item)=>{
              return <li style={{"height":"auto"}}>
                  <div className="imgbox"><img src={item.imageUrl} alt="Banner" onClick={()=>{
                    setShowLoader(true)
                    setBannerId(item._id);
                    setEditableList(item.editableList);

                    let temp = item.editableList
                    temp = setPrefilledValue(temp)
                    setEditValue(temp);
                    let options ={
                      imageId : item._id,
                      editableList : temp
                    }
                    dispatch(getCustomBanner({options:options,setOpenModal:setOpenModal,setShowLoader:setShowLoader}))
                    setBannerSelected(item.imageUrl);
                }}/>
                </div>
                <div className="btnGrp">
                  <div className="wrapper">
                    <button className="light-btn" onClick={()=>handleEditPopup(item)}>Edit</button>
                  </div>
                  <div className="wrapper">
                    <button className="light-btn" onClick={()=>handleDeleteBanner(item)}>Delete</button>
                  </div>
                </div>
              {showLoader && item._id === bannerId && <div className="loader"><img src={loadingImg} alt="loading"/></div>}
              </li>
            })
          }
        </ul>
        
        <Modal open={openModal}>
          {detect.isDesktop() ? 
            <div className={`commonsteppopup  ${editMenu && "wide"}`}>
              <div className="popup_closeBtn" onClick={() => {closeModal(true);}}><img src={CloseIcon} alt="close"/></div>
                <div className="flexGrp">
                <div className="imgLeft">
                  <img src={customBanner?customBanner:bannerSelected} className="bmg" alt="Banner"/>
                  {!editMenu && 
                    <div class="btnGrp">
                     <div className="wrapper">
                       <button className="light-btn" onClick={()=>{setEditMenu(true);}}><img src={editIcon} alt=""/>Edit Banner</button>
                        </div>
                        <div className="wrapper">
                      {detect.isMobile() && props.moduleOptions.product == "IDEDGE" ? 
                        <button className="light-btn" onClick={()=>{
                          if(customBanner)
                            download(customBanner) // Put your image url here.
                          else
                            download(bannerSelected)
                        }}><img src={share} alt=""/> Share</button>:

                        <button className="light-btn" onClick={()=>{
                          if(customBanner)
                            download(customBanner) // Put your image url here.
                          else
                            download(bannerSelected)
                        }}><img src={downloadIcon} alt=""/> Download</button>
                    }
                    </div>
                    </div>
                  }
                </div>
                <div className="editRight">
                  {editMenu && renderEditMenu(editableList)}
                </div>

              </div>
            </div> 
            :
            <div className={`commonsteppopup poupMobi`}>
              <div className="popup_closeBtn2" onClick={closeModal}><img src={backicon} alt="close"/></div>
              
              <div className="innerGrp">
                  <div>
                    <div className="imgLeft">
                      <img src={customBanner?customBanner:bannerSelected} className="bmg" alt="Banner"/>
                    </div>
                    
                    <div className="btnGrp">
                      <div className="wrapper">
                        <button className="light-btn" onClick={()=>{setEditMenu(true);}}><img src={editIcon} alt=""/>Edit Banner</button>
                      </div>
                      <div className="wrapper">
                        {detect.isMobile() && props.moduleOptions.product == "IDEDGE" ? 
                          <button className="light-btn" onClick={()=>{
                          if(customBanner)
                            handleShare(customBanner) // Put your image url here.
                          else
                            handleShare(bannerSelected)
                        }}><img src={share} alt=""/> Share</button>:
                        <button className="light-btn" onClick={()=>{
                          if(customBanner)
                            download(customBanner) // Put your image url here.
                          else
                            download(bannerSelected)
                        }}><img src={downloadIcon} alt=""/> Download</button>
                      }
                      </div>
                    </div>                      
                  </div>
                  <Modal open={editMenu}>
                    {renderEditMenu(editableList)}
                  </Modal>
              </div>
            </div>
          }
        </Modal>
      </div>

      {renderEditBanner()}
    </div>
  );
}
