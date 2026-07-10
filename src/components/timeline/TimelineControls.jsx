import {
    FaPlay,
    FaPause,
    FaStepForward,
    FaStepBackward
} from "react-icons/fa";

export default function TimelineControls({
    currentStep,
    setCurrentStep,
    playing,
    setPlaying,
    maxStep
}) {

    function nextStep() {

        if (currentStep < maxStep)
            setCurrentStep(currentStep + 1);

    }

    function previousStep() {

        if (currentStep > 0)
            setCurrentStep(currentStep - 1);

    }

    return (

        <div className="timeline-controls">

            <button onClick={previousStep}>
                <FaStepBackward/>
            </button>

            <button onClick={() => setPlaying(!playing)}>
                {
                    playing ?
                    <FaPause/> :
                    <FaPlay/>
                }
            </button>

            <button onClick={nextStep}>
                <FaStepForward/>
            </button>

        </div>

    );

}