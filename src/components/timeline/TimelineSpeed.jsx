export default function TimelineSpeed({
    speed,
    setSpeed
}) {

    return (

        <div className="timeline-speed">

            <button
                className={speed===1 ? "active-speed" : ""}
                onClick={() => setSpeed(1)}
            >
                1x
            </button>

            <button
                className={speed===2 ? "active-speed" : ""}
                onClick={() => setSpeed(2)}
            >
                2x
            </button>

            <button
                className={speed===5 ? "active-speed" : ""}
                onClick={() => setSpeed(5)}
            >
                5x
            </button>

        </div>

    );

}