export default function TimelineSlider({
    currentStep,
    setCurrentStep,
    maxStep
}) {

    return (

        <input
            className="timeline-slider"
            type="range"
            min="0"
            max={maxStep}
            value={currentStep}
            onChange={(e)=>setCurrentStep(Number(e.target.value))}
        />

    );

}