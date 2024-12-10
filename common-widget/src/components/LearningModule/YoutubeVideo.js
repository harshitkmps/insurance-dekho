import React, {useState} from "react";
import YouTube from 'react-youtube';
import './css/popupLayout.css';
import PopupLayout from './PopupLayout'
import { updateCompletionStatus } from "../../redux/actions/LearningActions";
import { createDispatchHook } from 'react-redux'

export default function YoutubeVideo(props) {
    let useDispatch = createDispatchHook(props.context)
    let timer = [];
    let [videoPercentage,setVideoPercentage] = useState(0);
    let [totalDuration,setTotalDuration] = useState(1);
    function getVideoIdFromUrl(videoUrl){
        let videoId;
        if (videoUrl) {
            videoId = videoUrl.split("v=")[1].split("&")[0];
        }
        return videoId;
    }

    let dispatch = useDispatch();

    const checkElapsedTime = (e) => {
        //console.log(e.target.playerInfo.playerState); //This will give 1 if the video is palying
        const duration = e.target.getDuration();
        const currentTime = e.target.getCurrentTime();
        setTotalDuration(duration);
        //console.log("Duartion of video is ",duration);
        //console.log("Current time of the video is ",currentTime);
        
        if (e.target.playerInfo.playerState === 1) { // Started playing
            timer = setInterval(()=>record(e), 100);
        } else {
            clearInterval(timer);
        }
    };

    function closePopup(){
        let options;
        if(videoPercentage <= 95){
            console.log('Video is in progress',videoPercentage);
            options = {status:"IN_PROGRESS",videoPercentage:videoPercentage,videoDuration:totalDuration}
        }
        else{
            console.log('Video is completed',videoPercentage);
            options = {status:"COMPLETED",videoPercentage:videoPercentage,videoDuration:totalDuration}
        }
        let pathParams = [props.uuid,props.contentId];

        dispatch(updateCompletionStatus({options:options, pathParams : pathParams, updateVideoCompleted:props.updateVideoCompleted}))
        if(props.cbClose != undefined){
            props.cbClose();
        }
        clearInterval(timer);
    }

    function record(e) {
        const duration = e.target.getDuration();
        const currentTime = e.target.getCurrentTime();
        let percent = Math.round(currentTime / duration * 100);
        setVideoPercentage(percent);
        //console.log("Current Percentage of video completion ",percent);
    }

    /*function getPercentage() {
        var percent = 0;
        for (var i = 0, l = timeSpent.length; i < l; i++) {
            if (timeSpent[i]) percent++;
        }
        percent = Math.round(percent / timeSpent.length * 100);
        return percent;
    } */

    const options = {
        width: '100%',
        playerVars: {
          autoplay: 1,
          start:props.videoWatchPercentage,  //Time in second from where the video should be started
        },
    };
    return (
        //<YouTube videoId={getVideoIdFromUrl(props.videoUrl)} opts={options} onStateChange={(e) => checkElapsedTime(e)}/>
        <div className="utubevdowrap">
            <PopupLayout cbClose={closePopup}>
                <YouTube videoId={getVideoIdFromUrl(props.videoUrl)} opts={options} onStateChange={(e) => checkElapsedTime(e)}/>
            </PopupLayout>   
        </div>
    );
}
