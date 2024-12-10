/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-globals */
import React, {useState, useEffect} from "react";
import "../LearningModule/css/CommonGlobal.css";
import editIcon from "../../img/editIcon.svg";
import downloadIcon from "../../img/download.svg";
import share from "../../img/share.svg"
import backicon from "../../img/v2_arrow_left.svg";
import loadingImg from "../../img/loading-white.svg";
import Modal from "../elements/Modal";
import CloseIcon from '../../img/v2_close.svg';
import InputFieldV2 from "../elements/InputFieldV2";
import detect from '../../utils/detect';
import { createSelectorHook, createDispatchHook } from 'react-redux'
import { getBanner, getCustomBanner, resetCustomBanner} from "../../redux/actions/PromotionalBannerActions";
import config from '../../app-configs/index'
import { useHistory } from 'react-router-dom'
import rightArrow from "../../img/arrowRight.svg";


export default function PromotionalBanner(props) {
  let useSelector = createSelectorHook(props.context)
  let useDispatch = createDispatchHook(props.context)
  const history = useHistory();
  let [openModal, setOpenModal] = useState(false);
  let [editValue, setEditValue] = useState([]);
  let [editMenu, setEditMenu] = useState(false);
  let [bannerId, setBannerId] = useState('');
  let [customBannerCategory, setCustomBannerCategory] = useState('');
  let [editableList, setEditableList] = useState([]);
  let apiResponse = {};
  let [bannerSelected, setBannerSelected] = useState('');
  let [categorySelected, setCategorySelected] = useState('All');
  let [submitClicked, setSubmitClicked] = useState(false);
  let [showLoader, setShowLoader] = useState(false);
  let validEntry = false;

  let dispatch = useDispatch();

  useEffect(() => {
    if (openModal) {
      history.push('#viewbanner')
    }
  }, [openModal]);

  useEffect(() => {
    if (editMenu) {
      history.push('#editbanner')
    }
  }, [editMenu]);

  useEffect(() => {
    return history.listen(location => {
      if (history.action === 'POP') {
        console.log(51, history)
        if (location.hash == '') {
          closeModal()
        } else if (location.hash == '#viewbanner') {
          setEditMenu(false);
        }
      }
    })
  }, [history.action])

  useEffect(() => {
    let options;
    if (!props?.moduleOptions.mostDownloadedContent) {
      if (categorySelected != 'All') {
        options = {category: categorySelected, pageSize: 500}
      } else {
        options = {pageSize: 500}
      }
    } else {
      options = {
        product: ["POS", "IDEDGE"].includes(props.moduleOptions.product) ? "POS" : null,
        mostDownloadedContent: props.moduleOptions.mostDownloadedContent
      };
    }
    dispatch(getBanner(options))
  }, [categorySelected]);

  apiResponse = useSelector((state) => (state.PromotionalBannerReducer && state.PromotionalBannerReducer.banners) ? state.PromotionalBannerReducer.banners : {})

  function onChange(e) {
    let temp = editValue;
    temp[e.target.id].value = e.target.value;
    setEditValue([...temp]);
  }

  function setPrefilledValue(list) {
    list = list.map((item) => {
      let tempVar = item;
      tempVar.value = '____';
      if (config.promotionalBannerModule && config.promotionalBannerModule.prefilledVariable && config.promotionalBannerModule.prefilledVariable.indexOf(item.variable) != -1) {
        tempVar.value = props.moduleOptions[item.variable] ? props.moduleOptions[item.variable] : '____';
      } else {
        tempVar.value = '____';
      }
      return tempVar;
    })
    return list;
  }

  function getCustomBannerFromValue() {
    if (validEntry) {
      let options = {
        imageId: bannerId,
        editableList: editValue,
        tags: "custom_edit",
        user_id: props.moduleOptions.user_id ? props.moduleOptions.user_id : "",
        user_name: props.moduleOptions.name ? props.moduleOptions.name : "",
        email: props.moduleOptions.email ? props.moduleOptions.email : "",
        mobile: props.moduleOptions.phone ? props.moduleOptions.phone : "",
        banner_category: customBannerCategory,
        gcd_code: props.moduleOptions.gcd_code ? props.moduleOptions.gcd_code : "",
        source: props.moduleOptions.product ? props.moduleOptions.product : "",
        uuid: props.moduleOptions.uuid ? props.moduleOptions.uuid : "",
      }
      dispatch(getCustomBanner({options: options, history: history, setShowLoader: setShowLoader, setEditMenu}))
      setSubmitClicked(false);
    } else {
      setSubmitClicked(true);
    }
  }

  const handleShare = async (imageUrl) => {
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

  const handleCustomShare = async(item)=> {
    setShowLoader(true);
    setBannerId(item._id)
    setCustomBannerCategory(item.category)
    let editedList = setPrefilledValue(item.editableList);
    let options ={
      imageId : item._id,
      editableList : editedList,
      tags : "custom_share",
      user_id:props.moduleOptions.user_id?props.moduleOptions.user_id:"",
      user_name:props.moduleOptions.name?props.moduleOptions.name:"",
      email:props.moduleOptions.email?props.moduleOptions.email:"",
      mobile:props.moduleOptions.phone?props.moduleOptions.phone:"",
      banner_category:item.category,
      gcd_code:props.moduleOptions.gcd_code?props.moduleOptions.gcd_code:"",
      source : props.moduleOptions.product?props.moduleOptions.product:"",
      uuid: props.moduleOptions.uuid ? props.moduleOptions.uuid : "",
    }
    dispatch(getCustomBanner({options:options,customShare:1,setShowLoader:setShowLoader}))
  }
  
  let customBanner = useSelector((state)=>(state.PromotionalBannerReducer && state.PromotionalBannerReducer.customBanner)?state.PromotionalBannerReducer.customBanner:'')
  function closeModal(back = false){
    setOpenModal(false);
    setBannerId('');
    setCustomBannerCategory('');
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

  function downloadCustomImage(item){
    setShowLoader(true);
    setBannerId(item._id);
    setCustomBannerCategory(item.category)
    let editedList = setPrefilledValue(item.editableList);
    let options ={
      imageId : item._id,
      editableList : editedList,
      tags : "custom_download",
      user_id:props.moduleOptions.user_id?props.moduleOptions.user_id:"",
      user_name:props.moduleOptions.name?props.moduleOptions.name:"",
      email:props.moduleOptions.email?props.moduleOptions.email:"",
      mobile:props.moduleOptions.phone?props.moduleOptions.phone:"",
      banner_category:item.category,
      gcd_code:props.moduleOptions.gcd_code?props.moduleOptions.gcd_code:"",
      source : props.moduleOptions.product?props.moduleOptions.product:"",
      uuid: props.moduleOptions.uuid ? props.moduleOptions.uuid : "",
    }
    dispatch(getCustomBanner({options:options,download:download,setShowLoader:setShowLoader}))
    // saveAs(url,name)
  }

  const handleBannerClick = (banner) => {
    setShowLoader(true)
    setBannerId(banner._id);
    setCustomBannerCategory(banner.category);
    setEditableList(banner.editableList);

    let temp = banner.editableList
    temp = setPrefilledValue(temp)
    setEditValue(temp);
    let options ={
      imageId : banner._id,
      editableList : temp,
      tags:"banner_click",
      user_id:props.moduleOptions.user_id?props.moduleOptions.user_id:"",
      user_name:props.moduleOptions.name?props.moduleOptions.name:"",
      email:props.moduleOptions.email?props.moduleOptions.email:"",
      mobile:props.moduleOptions.phone?props.moduleOptions.phone:"",
      banner_category:banner.category,
      gcd_code:props.moduleOptions.gcd_code?props.moduleOptions.gcd_code:"",
      source : props.moduleOptions.product?props.moduleOptions.product:"",
      uuid: props.moduleOptions.uuid ? props.moduleOptions.uuid : "",
    }
    dispatch(getCustomBanner({options:options,setOpenModal:setOpenModal,setShowLoader:setShowLoader}))
    setBannerSelected(banner.imageUrl);
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
      <div className={`editBanSec ${props?.moduleOptions.mostDownloadedContent ? "downloadFields" : ""}`}>
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
                  className="left1rem"
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
            <div className="wrapper"><button className="light-btn" onClick={()=>{setEditMenu(false);history.replace("#viewbanner");}}>Cancel</button>
            </div>
            <div className="wrapper">
            <button className="dark-btn" onClick={()=>{getCustomBannerFromValue();}}>Submit</button>
            </div>
        </div>
      </div>
      );
  }

  const handleViewAllClick = (e) => {
    e.preventDefault();
    const url = props.moduleOptions.product === "POS" ? `${origin}/promotional-banner` : `${origin}/promotionalbanner`;
    if (typeof Android !== undefined && typeof Android !== 'undefined') {
      window["Android"].loadNewPageInApp(url);
    } else {
      window.location = url;
    }
  }

  return (
    <>
      {!props?.moduleOptions.mostDownloadedContent ? (
        <div className="commonContainer980">
        <div className={props.moduleOptions.product != "IDEDGE" ? "roundBorder" : ""}>
          {props.moduleOptions.product != "IDEDGE" && <h2>Promotional Banners</h2>}
          <div className="gsc_ta_scroll  gsc_ta_scroll_move ">
            <ul className="gsc-ta-clickWrap " data-track-section="tab">
              <li title="All" className={"All" == categorySelected ? "gsc-ta-active" : ""} onClick={()=>setCategorySelected('All')}>
                All
              </li>
              {
                apiResponse && apiResponse.category && apiResponse.category.map((item, idx)=>{
                  return (<li key={idx} title={item} className={item == categorySelected ? "gsc-ta-active" : ""} onClick={()=>setCategorySelected(item)}>
                  {item}
                </li>)
                })
              }
            </ul>
          </div>
          <ul className="gridStyle">
            {
              apiResponse && apiResponse.results && apiResponse.results.map((item, idx)=>{
                return <li key={idx}>
                    <div className="imgbox"><img src={item.imageUrl} alt="Banner" onClick={() => handleBannerClick(item)}/>
                  </div>
                  {detect.isMobile() && props.moduleOptions.product == "IDEDGE"?
                    <div className="cardLinkBanner" onClick={()=>handleCustomShare(item)}><a><img className="shareicon" src={share} alt=""/> Share</a></div> :
                    <div className="cardLinkBanner" onClick={()=>downloadCustomImage(item)}><a><img src={downloadIcon} alt=""/> Download</a></div>}
                {showLoader && item._id === bannerId && <div className="loader"><img src={loadingImg} alt="loading"/></div>}
                </li>
              })
            }
          </ul>
          
        </div>
      </div>
      ) : (
        apiResponse?.results?.length ? (
          <>
            <div className="exclusiveTitle">
              <h3>Share with Clients</h3>
              <a 
                className="rightCarousel" 
                href="/promotional-banner"
                onClick={handleViewAllClick}
              >
                <span className="ViewAllDesk">View All</span>{" "}
                <img src={rightArrow} alt="right arrow" />
              </a>
            </div>
            <div className="exclusiveMenu clientsMenu">
              <ul>
                {apiResponse.results.map((banner, idx)=>(
                  <li key={idx} className="vehDetList">
                    <figure>
                      <img src={banner.imageUrl} alt="banner" onClick={() => handleBannerClick(banner)} />
                    </figure>
                    <div className="actionLinkWrapper">
                      <button type="button" onClick={() =>
                        detect.isMobile() &&
                        props.moduleOptions.product === "IDEDGE"
                          ? handleCustomShare(banner)
                          : downloadCustomImage(banner)
                      }>
                        {/* <span className="id-share" /> Share */}
                        {detect.isMobile() &&
                          props.moduleOptions.product === "IDEDGE" 
                          ? <><img className="shareicon" src={share} alt="share"/> Share</>
                          : <><img src={downloadIcon} alt="download"/> Download</>}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null
      )}
      <Modal open={openModal}>
        {detect.isDesktop() ? 
          <div className={`commonsteppopup  ${editMenu && "wide"}`}>
            <div className="popup_closeBtn" onClick={() => {closeModal(true);}}><img src={CloseIcon} alt="close"/></div>
              <div className="flexGrp">
              <div className="imgLeft">
                <img src={customBanner?customBanner:bannerSelected} className="bmg" alt="Banner"/>
                {!editMenu && 
                  <div className="btnGrp">
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
    </>
  );
}
