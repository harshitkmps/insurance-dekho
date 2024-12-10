import React, { useEffect, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./css/CommonGlobal.css";

import { createSelectorHook, createDispatchHook } from "react-redux";
import {
  getContent,
  getCompletionStatus,
} from "../../redux/actions/LearningActions";
import detect from "../../utils/detect";

import Slider from "react-slick";
import YoutubeVideo from "./YoutubeVideo";
import frame from "../../img/frame.svg";

import B1 from "../../img/b1.png";
import B2 from "../../img/b2.png";

import Calendar from "../../img/calendar.svg";
import rightArrow from "../../img/arrowRight.svg";

export default function Learning(props) {
  let useSelector = createSelectorHook(props.context)
  let useDispatch = createDispatchHook(props.context)
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
          centerPadding: "30px",
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          swipeToSlide: true,
          centerMode: true,
          centerPadding: "30px",
        },
      },
    ],
  };
  const options = {
    product: props.product ? props.product : "IDEDGE",
    role: props.role ? props.role : "AGENT",
    userId: props.mostWatchedVideos ? props.uuid : null,
    mostWatchedVideos: props.mostWatchedVideos,
  };
  let videosCompleted = 0;
  let videoStatus = [];
  const origin = window.location.origin;
  let dispatch = useDispatch();
  useEffect(() => {
    dispatch(getContent(options));
    dispatch(getCompletionStatus({ uuid: props.uuid }));
  }, []);

  let content = useSelector((state) =>
    state.LearningReducer && state.LearningReducer.videos
      ? state.LearningReducer.videos
      : {}
  );
  videosCompleted = useSelector((state) =>
    state.LearningReducer &&
    state.LearningReducer.videoStatus &&
    state.LearningReducer.videoStatus.videosCompleted
      ? state.LearningReducer.videoStatus.videosCompleted
      : 0
  );
  videoStatus = useSelector((state) =>
    state.LearningReducer &&
    state.LearningReducer.videoStatus &&
    state.LearningReducer.videoStatus.data
      ? state.LearningReducer.videoStatus.data
      : []
  );
  let count = 0;
  for (let key in content) {
    if (content.hasOwnProperty(key)) {
      count = count + content[key].length;
    }
  }
  let totalVideos = count;

  let [videoLink, setVideoLink] = useState("");
  let [contentId, setContentId] = useState("");
  let [registerButton, setRegisterButton] = useState("");

  let videoWatchPercentage = {};

  function renderVideo(videos) {
    let list = [];
    if (videos && videos.length > 0) {
      let object = 0;
      videos.forEach((item) => {
        object = 0;
        if (videoStatus && videoStatus.length > 0)
          object = videoStatus.filter((temp) => {
            if (temp.content_id == item.content_id) return temp;
          });
        if (
          object &&
          object.length > 0 &&
          object[0].percentageCompleted &&
          object[0].videoDuration
        )
          videoWatchPercentage[item.content_id] = Math.round(
            (object[0].percentageCompleted * object[0].videoDuration) / 100
          );
        /* console.log("Video status is",videoStatus)
        console.log("item is ",item)
        console.log("Object is",object) */
        list.push(
          <div className={props.mostWatchedVideos ? "cardSliderHomepage" : "cardSlider"}>
            <img
              src={item.content_thumbnail}
              style={{ cursor: "pointer" }}
              alt=""
              title
              onClick={() => {
                setVideoLink(item.content_link);
                setContentId(item.content_id);
                console.log(91, object);
              }}
            />
            <div className="progress_1">
              <div
                className="bar_1"
                style={{
                  width: `${
                    object && object.length > 0 && object[0].percentageCompleted
                      ? object[0].percentageCompleted
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <h4>{item.content_title}</h4>
            {/* <p>Grow your Business</p> */}
          </div>
        );
      });
    }
    return list;
  }

  function closeVideo() {
    console.log("Video is closed ");
    setVideoLink(""); //for closing the video, link is set to blank
  }

  function handleRegister() {
    setRegisterButton(true);
    setTimeout(() => {
      let elem = document.getElementById("registerButton");
      elem.classList.remove("whiteCircle_m");
      elem.innerText = "Registered";
    }, 3000); //After 3s we will remove the loader on the button
  }

  function updateVideoCompleted() {
    //console.log(110,"upatt vdeio is claled")
    dispatch(getCompletionStatus({ uuid: props.uuid }));
  }

  function renderContent() {
    let list = [];
    let bannerAdded = 0;
    for (let key in content) {
      if (content.hasOwnProperty(key)) {
        let videos = content[key];
        list.push(
          <section className="padding-TB10">
            <h3>{key}</h3>
            <div className="slickCardSlider">
              <Slider {...settings}>{renderVideo(videos)}</Slider>
            </div>
          </section>
        );
        if (!bannerAdded && props.showMasterClassBanner) {
          bannerAdded = 1;
          if (detect.isMobile()) {
            list.push(
              <div className="desktopBanner">
                {/* <div class="image-mobile">
                <img src={mobileBannerImage} alt="mobile banner"/>
              </div> */}
                <div className="leftBanner">
                  <h2>Masterclass</h2>
                  <h3>
                    Increase your earning with insurance, How? we’ll tell you
                  </h3>
                  <div className="dateTime">
                    <img src={Calendar} alt="icon" /> 7th Feb, 5pm
                  </div>
                  <button
                    id="registerButton"
                    className={
                      registerButton ? "opacityLoader whiteCircle_m" : ""
                    }
                    onClick={handleRegister}
                  >
                    Register Now
                  </button>
                </div>

                <img className="rightImage" width="" src={B1} alt="icon" />
              </div>
            );
          } else {
            list.push(
              <div className="desktopBanner">
                <div className="leftBanner">
                  <h2>Masterclass</h2>
                  <h3>
                    Increase your earning with insurance, How? we’ll tell you
                  </h3>
                  <div className="dateTime">
                    <img src={Calendar} alt="icon" /> 7th Feb, 5pm
                  </div>
                  <button
                    id="registerButton"
                    className={
                      registerButton ? "opacityLoader whiteCircle_m" : ""
                    }
                    onClick={handleRegister}
                  >
                    Register Now{" "}
                  </button>
                </div>

                <img className="rightImage" width="" src={B2} alt="icon" />
              </div>
            );
          }
        }
      }
    }
    return list;
  }
  //return (<YoutubeVideo videoUrl='https://www.youtube.com/watch?v=sYuzikmYLMo' cbClose={closeVideo}/>) //calling the Youtube video file for playing video and measuring the progress
  
  const handleViewAllClick = (e) => {
    e.preventDefault();
    const url = props.product === "POS" ? `${origin}/user/lnd` : `${origin}/learning`;
    if (typeof Android !== undefined && typeof Android !== 'undefined') {
      window["Android"].loadNewPageInApp(url);
    } else {
      window.location = url;
    }
  }

  return (
    <>
    {!props?.mostWatchedVideos ? (<div className="commonContainer">
      <div className="commonWidgets">
        {/* <h3>Welcome to InsuranceDekho Academy</h3> */}

        <div className="idlearningBanner">
          <div className="learningLink">ID Academy</div>
          <div className="bannerLeft">
            <h4>Get ahead, Stay ahead</h4>
            <p>
              Learn how to use the platform, learn about health, life and motor
              insurance and earn money
            </p>
          </div>
          <div className="bannerRight">
            {" "}
            <img src={frame} alt="icon" />
          </div>
        </div>
        {/*<div className="d-flex aic moduleStand">
            <div>
              <span>Module Started</span>
              <span>{videosCompleted} / {totalVideos}</span>
            </div>
            <div>
              <span>Completion </span>
              <span>{Math.round(videosCompleted/totalVideos * 100)}%</span>
            </div>
          </div> */}
      </div>

      {renderContent()}

    </div>
    ) : (content?.content?.length ? (
          <>
            <div className="exclusiveTitle">
              <h3>Recommended Courses</h3>
              <a 
                href="/user/lnd" 
                className="rightCarousel"
                onClick={handleViewAllClick}
              >
                <span className="ViewAllDesk">View All</span>{" "}
                <img src={rightArrow} alt="right arrow" />
              </a>
            </div>
            <div  className="exclusiveMenu">
              {renderVideo(content.content)}
            </div>
          </>
        ) : null
    )}
    {videoLink && (
      <div className="youtube">
        <YoutubeVideo
          context={props.context}
          videoUrl={videoLink}
          videoWatchPercentage={
            videoWatchPercentage.hasOwnProperty(contentId)
              ? videoWatchPercentage[contentId]
              : 0
          }
          contentId={contentId}
          cbClose={closeVideo}
          updateVideoCompleted={updateVideoCompleted}
          uuid={props.uuid}
        />
      </div>
    )}
    </>
  );
}
