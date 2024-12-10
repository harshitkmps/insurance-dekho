import React, { useEffect, useState } from "react";
import CardV2 from "../elements/CardV2";
import "./proposalscorecard.css";

const ProposalScoreCard = (props) => {
  const [buttonLoading, setButtonLoading] = useState(false);

  return props.showScore && props.points?.commissionPoints > 0 ? (
    <CardV2 radius="6" bottom="10" style={{"padding": "5px", "margin-top": "10px"}}>
      <ul>
        <div>
          <div className="d-flex aic jsb scoreData mrg-T20 moreDiv" style={{"background": "linear-gradient(97.28deg, #FFEBF1 0%, #EBF5FF 94.46%)","border-radius": "8px","padding": "8px 12px"}}>
            <div className="d-flex aic">
              <img src="/pwa/img/proposal-score-img.svg" alt="score" />
              <h3 className="score-subheading" style={{"font-weight": "400","font-size": "12px","color": "#333846","margin-left": "8px","margin-top": "2px"}}>Scores</h3>
            </div>
            <div className="pointP">
              {props.showScore ? (
                <span>{props.points.commissionPoints}</span>
              ) : (
                <button
                  id="retryScoresBtn"
                  className="retryScoresBtn"
                  onClick={() => props.getScores()}
                  disabled={props.buttonLoading}
                >
                  Show Scores
                </button>
              )}
            </div>
          </div>
        </div>
      </ul>
    </CardV2>
  ) : null;
};

export default ProposalScoreCard;
