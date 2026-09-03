import { Link } from "react-router-dom";
import { TimelinesWrapper } from "@/partials/timelines/default/item";
const StageTimeLine = () => {
  return (
    <TimelinesWrapper icon="pointers" line={true}>
      <div className="flex flex-col">
        <div className="text-sm text-gray-800">
          Stage changed to
          <Link
            to="/public-profile/profiles/blogger"
            className="text-sm font-medium link"
          >
            &nbsp;Stage name&nbsp;
          </Link>
        </div>
        <span className="text-xs text-gray-600">Today, 9:00 AM</span>
      </div>
    </TimelinesWrapper>
  );
};

export default StageTimeLine;
