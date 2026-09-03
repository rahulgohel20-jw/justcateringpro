import { React, Fragment, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { CommonHexagonBadge } from "@/partials/common";
import { toAbsoluteUrl } from "@/utils";
import { FormattedMessage, useIntl } from "react-intl";


const NotificationsSettingsPage = () => {
  const [emailNotification, setEmailNotification] = useState(false);
  const [whatsappNotification, setWhatsappNotification] = useState(false);
  const [reportTime, setReportTime] = useState("11:53 AM");
  const intl = useIntl();


  const handleSave = () => {
    alert("Settings saved!");
  };

  return (
    <Fragment>
      <style>
        {`
          .user-access-bg {
            background-image: url('${toAbsoluteUrl("/images/bg_01.png")}');
          }
          .dark .user-access-bg {
            background-image: url('${toAbsoluteUrl("/images/bg_01_dark.png")}');
          }
        `}
      </style>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <Breadcrumbs items={[{ title: <FormattedMessage id="SETTING.NOTIFICATIONS" defaultMessage="Notifications" /> }]} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-8 gap-3 lg:gap-4 mb-4">
          <div className="col-span-4 md:col-start-3 card min-w-full">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-semibold text-gray-900">
                <FormattedMessage id="SETTING.GENERAL_SETTINGS" defaultMessage="General Settings" />
              </h4>
            </div>
            <div className="flex flex-col rtl:[background-position:center_center] [background-position:center_center] bg-no-repeat bg-[length:650px] user-access-bg">
              <div className="flex justify-between items-center p-5 gap-2 border-b">
                <div className="flex items-center gap-4">
                  <CommonHexagonBadge
                    stroke="stroke-primary-clarity"
                    fill="fill-light"
                    size="size-[50px]"
                    badge={
                      <i className="ki-filled ki-ki-filled ki-sms text-xl text-primary"></i>
                    }
                  />
                  <div className="flex flex-col">
                    <h3 className="text-base font-medium text-gray-900">
                      <FormattedMessage id="SETTING.NEW_LEAD_EMAIL_NOTIFICATION" defaultMessage="New lead email notification to team" />
                    </h3>
                    <p className="text-sm text-gray-700">
                      <FormattedMessage id="SETTING.NEW_LEAD_EMAIL_NOTIFICATION_DESC" defaultMessage="An email notification will be sent to the team whenever a new lead is added." />
                    </p>
                  </div>
                </div>
                <label className="switch switch-lg">
                  <input
                    type="checkbox"
                    value="1"
                    name="check"
                    checked={emailNotification}
                    onChange={() => setEmailNotification(!emailNotification)}
                    defaultChecked
                    readOnly
                  />
                </label>
              </div>
              <div className="flex justify-between items-center p-5 gap-2 border-b">
                <div className="flex items-center gap-4">
                  <CommonHexagonBadge
                    stroke="stroke-primary-clarity"
                    fill="fill-light"
                    size="size-[50px]"
                    badge={
                      <i className="ki-filled ki-ki-filled ki-whatsapp text-xl text-primary"></i>
                    }
                  />
                  <div className="flex flex-col">
                    <h3 className="text-base font-medium text-gray-900">
                      <FormattedMessage id="SETTING.NEW_LEAD_WHATSAPP_NOTIFICATION" defaultMessage="New lead whatsapp notification to team" />
                    </h3>
                    <p className="text-sm text-gray-700">
                      <FormattedMessage id="SETTING.NEW_LEAD_WHATSAPP_NOTIFICATION_DESC" defaultMessage="Get instant WhatsApp alerts to the team whenever a new lead is generated." />
                    </p>
                  </div>
                </div>
                <label className="switch switch-lg">
                  <input
                    type="checkbox"
                    value="1"
                    name="check"
                    checked={whatsappNotification}
                    onChange={() =>
                      setWhatsappNotification(!whatsappNotification)
                    }
                    defaultChecked
                    readOnly
                  />
                </label>
              </div>
              <div className="flex justify-between items-center p-5 gap-2 border-b">
                <div className="flex items-center gap-4">
                  <CommonHexagonBadge
                    stroke="stroke-primary-clarity"
                    fill="fill-light"
                    size="size-[50px]"
                    badge={
                      <i className="ki-filled ki-time text-xl text-primary"></i>
                    }
                  />
                  <div className="flex flex-col">
                    <h3 className="text-base font-medium text-gray-900">
                      <FormattedMessage id="SETTING.SET_REPORT_TIME" defaultMessage="Set report time" />
                    </h3>
                    <p className="text-sm text-gray-700">
                      <FormattedMessage id="SETTING.SET_REPORT_TIME_DESC" defaultMessage="Define report sending time as needed." />
                    </p>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="input">
                    <i className="ki-filled ki-time"></i>
                    <input className="h-full" type="time" placeholder="HH:MM" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end items-center p-5">
              <button
                onClick={handleSave}
                type="button"
                className="btn btn-success"
                title="Save Changes"
                disabled
              >
                <FormattedMessage id="SETTING.SAVE_CHANGES" defaultMessage="Save Changes" /> <i className="ki-filled ki-save-2 font-14"></i>
              </button>
            </div>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};
export { NotificationsSettingsPage };
