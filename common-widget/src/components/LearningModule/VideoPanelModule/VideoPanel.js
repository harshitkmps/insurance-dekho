import React, { useEffect, useState }  from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../css/CommonGlobal.css";
import { createDispatchHook, createSelectorHook } from 'react-redux'
import { getEntireContent, addCourse, deleteCourse, editCourse } from "../../../redux/actions/LearningActions";
import detect from '../../../utils/detect';
import InputFieldV2 from "../../elements/InputFieldV2";
import Slider from "react-slick";
import YoutubeVideo from "../YoutubeVideo";
import Modal from "../../elements/Modal";
import CloseIcon from '../../../img/v2_close.svg';
import B1 from '../../../img/b1.png'
import B2 from '../../../img/b2.png'

import Calendar from '../../../img/calendar.svg'


export default function VideoPanel(props) {
  let useDispatch = createDispatchHook(props.context)
  let useSelector = createSelectorHook(props.context)
  var settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          infinite: false,
          dots: false,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: '30px',
     
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          swipeToSlide: true,
          centerMode: true,
          centerPadding: '30px',

        },
      },
    ],
  };
  let videoStatus = [];
  let dispatch = useDispatch();
  useEffect(() => {
    dispatch(getEntireContent());
  }, []);

  let content = useSelector((state) => (state.LearningReducer && state.LearningReducer.videos)?state.LearningReducer.videos:{});
  videoStatus = useSelector((state)=> (state.LearningReducer && state.LearningReducer.videoStatus && state.LearningReducer.videoStatus.data) ? state.LearningReducer.videoStatus.data : [])
  let count = 0;
  for (let key in content) {
    if (content.hasOwnProperty(key)) {
        count = count + content[key].length;
    }
  }
  let [videoLink,setVideoLink] = useState('');
  let [contentId,setContentId] = useState('');
  let [registerButton,setRegisterButton] = useState('');

  let videoWatchPercentage = {};

  function renderVideo(videos){
    let list = []
    if(videos && videos.length > 0)
    {
      let object=0;
      videos.forEach((item)=>{
        object=0;
        if(videoStatus && videoStatus.length > 0)
          object = videoStatus.filter((temp)=>{
            if(temp.content_id == item.content_id)
              return temp;
          })
          if(object && object.length>0 && object[0].percentageCompleted && object[0].videoDuration)
            videoWatchPercentage[item.content_id] = Math.round((object[0].percentageCompleted * object[0].videoDuration)/100);
        list.push(
          <div className="cardSlider height350">
            <img src={item.content_thumbnail} style={{cursor:"pointer"}} alt="" title onClick={()=>{
              setVideoLink(item.content_link)
              setContentId(item.content_id)
              console.log(91,object)
            }}/>
            <h4>{item.content_title.substr(0,50)}{item.content_title.length>=50 ? '...':''}</h4>
            <div className="btnGrp">
              <div className="wrapper">
                <button className="light-btn" onClick={()=>handleEditPopup(item)}>Edit</button>
              </div>
              <div className="wrapper">
                <button className="light-btn" onClick={()=>handleDeleteVideo(item)}>
                  Delete
                </button>
              </div>
            </div>
            {/* <p>Grow your Business</p> */}
        </div>
        )
      })
    }
    return list;
  }

  function closeVideo(){
    setVideoLink('') //for closing the video, link is set to blank
  }

  function handleRegister(){
    setRegisterButton(true);
    setTimeout(()=>{
      let elem = document.getElementById('registerButton');
      elem.classList.remove('whiteCircle_m')
      elem.innerText = 'Registered'
    },3000) //After 3s we will remove the loader on the button
  }

  function isInValidateString(value,title){
    if(title === 'Video Link'){
      if(isValidYoutubeLink(value)){
        return "";
      }
      else if(value && value.trim().length>0)
        return "Please enter valid Video Link"
      else
        return `The ${title} field is required.`;
    }
    else{
      if(value && value.trim().length>0)
        return "";
      return `The ${title} field is required.`;
    }
  }

  let addVideoField = [
    {
        "title": "Content Title",
        "variable": "content_title",
        "value": ""
    },
    {
        "title": "Video Link",
        "variable": "content_link",
        "value": ""
    },
    {
        "title": "Category",
        "variable": "category",
        "value": ""
    }
  ];

  let [videoField,setVideoField] = useState(addVideoField);
  let [showSuccessMessage,setShowSuccessMessage] = useState(false);
  let [showErrorMessage,setShowErrorMessage] = useState(false);
  let [errorMessage,setErrorMessage] = useState('');

  function onChange(e){
    let temp=videoField;
    temp[e.target.id].value = e.target.value;
    setVideoField([...temp]);
  }

  function isValidYoutubeLink(url){
    var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : false;
  }

  function renderContent(){
    let list = [];
    let bannerAdded = 0;
    for (let key in content) {
      if (content.hasOwnProperty(key)) {
          let videos = content[key];
          list.push(<section className="padding-TB10">
          <h3>{key}</h3>
          <div className="slickCardSlider">
            <Slider {...settings}>
              {renderVideo(videos)}
            </Slider>
          </div>
        </section>);
        if(!bannerAdded && props.showMasterClassBanner)
        {
          bannerAdded=1;
          if(detect.isMobile()){
            list.push(<div className="desktopBanner">
                   <div className="leftBanner">
              <h2>Masterclass</h2>
             <h3>Increase your earning with insurance, How? we’ll tell you</h3>
             <div className="dateTime"><img src={Calendar} alt="icon"/> 7th Feb, 5pm</div>
             <button id="registerButton" className={registerButton ? "opacityLoader whiteCircle_m" : ""} onClick={handleRegister}>Register Now</button>
             </div>
            
             <img className="rightImage" width="" src={B1} alt="icon"/>
            </div>)
          }
          else{
            list.push(<div className="desktopBanner">
              <div className="leftBanner">
              <h2>Masterclass</h2>
             <h3>Increase your earning with insurance, How? we’ll tell you</h3>
             <div className="dateTime"><img src={Calendar} alt="icon"/> 7th Feb, 5pm</div>
             <button id="registerButton" className={registerButton ? "opacityLoader whiteCircle_m":""} onClick={handleRegister}>Register Now </button>
             </div>
            
             <img className="rightImage" width="" src={B2} alt="icon"/>
            
            </div>)
          }
        }
      }
    }
    return list;
  }

  let [editVideo,setEditVideo] = useState(false);
  let [editVideoDetail,setEditVideoDetail] = useState({});

  function handleEditPopup(item){
    setEditVideo(true);
    setEditVideoDetail(item);
  }
  function onChangeEditValue(e){
    e.preventDefault();
    let temp = {...editVideoDetail};
    temp[e.target.id] = e.target.value;
    setEditVideoDetail({...temp});
  }
  function closeEditVideo(){
    setEditVideo(false)
    setEditVideoButton(false)
  }
  
  function handleEditVideo(){
    setEditVideoButton(true);
    for(let i in addVideoField){
      if(isInValidateString(editVideoDetail[addVideoField[i].variable],addVideoField[i].title))
        return false;
    }
    let payload = {};
    let videoId = isValidYoutubeLink(editVideoDetail["content_link"]);
    payload["content_link"] = `https://www.youtube.com/watch?v=${videoId}`;
    payload["content_thumbnail"] = `https://img.youtube.com/vi/${videoId}/0.jpg`;
    payload["category"] = editVideoDetail["category"];
    payload["id"] = editVideoDetail["content_id"];
    payload["content_title"] = editVideoDetail["content_title"];
    dispatch(editCourse(payload))
    closeEditVideo();
  }

  let [editVideoButton,setEditVideoButton] = useState(false);

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
  },[editVideo]);

  function renderEditVideo(){
    return <Modal open={editVideo}>
          <div className={detect.isDesktop()?'commonsteppopup width400':'editBanSec'}>
            <h4>Edit Video</h4>
            <div className="popup_closeBtn" onClick={() => closeEditVideo()}><img src={CloseIcon} alt="close"/></div>
            {addVideoField &&
              addVideoField.length > 0 &&
              addVideoField.map((item, index) => {
                return (
                  <div>
                    <InputFieldV2
                      inputProps={{
                        id: item.variable,
                        type: "text",
                        name: item.title,
                        value: editVideoDetail[item.variable],
                        onChange: onChangeEditValue,
                      }}
                      labelProps={{
                        label: item.title,
                      }}
                      className="left1rem"
                    />
                    {editVideoButton && isInValidateString(editVideoDetail[item.variable],item.title) && (
                      <div className="srv-validation-message">
                        {isInValidateString(editVideoDetail[item.variable],item.title)}
                      </div>
                    )}
                  </div>
                );
              })}

            <div className="btnGrp">
              <div className="wrapper">
                <button className="light-btn" onClick={()=>closeEditVideo()}>Cancel</button>
              </div>
              <div className="wrapper">
                <button className="dark-btn" onClick={()=>handleEditVideo()}>Submit</button>
              </div>
            </div>
          </div>
      </Modal>
  }

  let [addVideoButton,setAddVideoButton] = useState(false);
  function handleAddVideo(){
    setAddVideoButton(true);
    if(isValidEntry()){
      let payload = {};
      videoField.forEach((item, index)=>{
        payload[item.variable]=item.value.trim();
      })
      let videoId = isValidYoutubeLink(payload["content_link"]);
      payload["products"] =  ["POS","IDEDGE"];
      payload["roles"] = ["AGENT","BM","3"];
      payload["content_link"] = `https://www.youtube.com/watch?v=${videoId}`;
      payload["content_thumbnail"] = `https://img.youtube.com/vi/${videoId}/0.jpg`;
      payload["content_type"] = "youtube";
      payload["active"] = true;
      dispatch(addCourse({options:payload,callback:callback}));
    }
  }

  function handleDeleteVideo(item){
    let options = {
      active : false,
      id : item.content_id
    }
    dispatch(deleteCourse(options))
  }
  function callback(response){
    if(response.errorResp && response.errorResp.message){
      setErrorMessage(response.errorResp.message)
      setShowErrorMessage(true)
    }
    else{
      setShowSuccessMessage(true);
      setVideoField(addVideoField);
      dispatch(getEntireContent());
      setAddVideoButton(false)  
    }
  }

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

  function isValidEntry(){
    for(let i in videoField){
      if(isInValidateString(videoField[i].value,videoField[i].title)){
        return false;
      }
    }
    return true;
  }

  function renderAddVideo(){
    return (
      <div style={{"max-width":"500px"}}>
        {videoField &&
          videoField.length > 0 &&
          videoField.map((item, index) => {
            return (
              <div>
                <InputFieldV2
                  inputProps={{
                    id: index,
                    type: "text",
                    name: item.title,
                    value: videoField[index].value,
                    onChange: onChange,
                  }}
                  labelProps={{
                    label: item.title,
                  }}
                  className="left1rem"
                />
                {addVideoButton && isInValidateString(videoField[index].value,item.title) && (
                  <div className="srv-validation-message">
                    {isInValidateString(videoField[index].value,item.title)}
                  </div>
                )}
              </div>
            );
          })}
          <button className="dark-btn" onClick={()=>handleAddVideo()}>Add Video</button>
      </div>
    );
  }
  if(props.userRole !== 'admin')
    return null;
  return (
    <div className="commonContainer">
      <div className="roundBorder">
      <div className="commonWidgets">

          <div className="idlearningBanner">
            <h3>Add Youtube Video</h3>
            {
              renderAddVideo()
            }
            {showSuccessMessage && <div className="success-message">
              {`Video Added Successfully`}
          </div>}
            {showErrorMessage && 
              <div className="error-message">
                {(errorMessage && errorMessage.length>0)? errorMessage : "Something Went Wrong"}
              </div>
            }
          </div>
      </div>


      {renderContent()}
      {renderEditVideo()}
      {videoLink && <div className="youtube">
            <YoutubeVideo videoUrl={videoLink} videoWatchPercentage={videoWatchPercentage.hasOwnProperty(contentId)? videoWatchPercentage[contentId]:0} contentId={contentId} cbClose={closeVideo} uuid={props.uuid}/>
          </div>}

      </div>
    </div>
  );
}
