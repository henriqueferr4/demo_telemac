export default function TimelineInfo({ item }) {

    return (

        <div className="timeline-info">

            <div>

                {item.date}

            </div>

            <div>

                {item.hour}

            </div>

        </div>

    );

}