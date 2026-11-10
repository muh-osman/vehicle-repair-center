import Requests from "../Requests/Requests";

export default function MakdomInspection() {
  return <Requests serviceFilter="مخدوم" analyticsPath="/dashboard/makdom-analytics" />;
}
