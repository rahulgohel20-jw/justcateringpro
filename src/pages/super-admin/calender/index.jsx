import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import CalendarComponent from "@/components/CalendarComponent";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { GetMemberByIdD } from "@/services/apiServices";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import { useLanguage } from "@/i18n";

const SuperCalendarPage = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const { isRTL } = useLanguage();

  const [data, setData] = useState([]);

  // 📌 Get userId from localStorage
  const Id = localStorage.getItem("mainId");

  // ✅ Fetch Users by Role ID only
  const FetchUserByRoleId = async () => {
    try {
      const res = await GetMemberByIdD(Id);
      const userList = res?.data?.data || [];
      

      // Convert users into calendar event objects
      const formattedUsers = userList.map((user) => {
        const [day, month, year] = user.createdAt.split("/");
        const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

        const color = user.isApprove ? "#22c55e" : "#3b82f6"; // green if approved, blue if pending

        return {
          id: user.id,
          // ✅ Show Name in Calendar
          title: `${user.pre_fix || ""} ${user.name || ""}`.trim(),
          start: formattedDate,
          end: formattedDate,
          color: color,
          allDay: true,
          // ✅ Tooltip data inside extendedProps
          extendedProps: {
            company: user.userBasicDetails?.companyName?.trim() || "No Company",
            contact: user.contactNo || "N/A",
            email: user.email || "N/A",
            isApprove: user.isApprove,
          },
        };
      });

      setData(formattedUsers);
    } catch (error) {
      console.error("Error fetching users by role ID:", error);
    }
  };

  useEffect(() => {
    FetchUserByRoleId();
  }, []);

  return (
    <Fragment>
      <Container>
        {/* Breadcrumb */}
        <div className="gap-2 mb-3">
          <Breadcrumbs
            items={[
              {
                title: intl.formatMessage({
                  id: "USER.DASHBOARD.DASHBOARD_CALENDAR_HEADER_EVENT",
                  defaultMessage: "User Registration Calendar",
                }),
              },
            ]}
          />
        </div>

        {/* Legend */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-xs font-medium text-white bg-green-500 rounded px-3 py-1">
              Approved Users
            </span>
            <span className="text-xs font-medium text-white bg-blue-500 rounded px-3 py-1">
              Pending Users
            </span>
          </div>
        </div>

        {/* Calendar */}
        <CalendarComponent
          data={data}
          customTooltip={(event) => `
            <div class="p-1">
              <p class="mb-1 font-semibold text-[#005BA8]">${event.title}</p>
              <p class="mb-1"><i class="me-1 ki-filled ki-briefcase text-success"></i>
              ${event.extendedProps.company}</p>
              <p class="mb-1"><i class="me-1 ki-filled ki-call text-success"></i>
              ${event.extendedProps.contact}</p>
              <p class="mb-1">      <i class="fa-solid fa-envelope text-success me-1"></i>

              ${event.extendedProps.email}</p>
            </div>
          `}
        />
      </Container>
    </Fragment>
  );
};

export default SuperCalendarPage;
