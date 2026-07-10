import "./Timeline.css";

import TimelineControls from "./TimelineControls";
import TimelineSlider from "./TimelineSlider";
import TimelineInfo from "./TimelineInfo";
import TimelineSpeed from "./TimelineSpeed";

export default function Timeline({
    geojsonData,
    currentStep,
    setCurrentStep,
    playing,
    setPlaying,
    speed,
    setSpeed
}) {

    if (!geojsonData.length) return null;

    return (

        <div className="timeline">

            <TimelineControls
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                playing={playing}
                setPlaying={setPlaying}
                maxStep={geojsonData.length-1}
            />

            <TimelineSlider
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                maxStep={geojsonData.length-1}
            />

            <TimelineInfo
                item={geojsonData[currentStep]}
            />

            <TimelineSpeed
                speed={speed}
                setSpeed={setSpeed}
            />

        </div>

    );

}