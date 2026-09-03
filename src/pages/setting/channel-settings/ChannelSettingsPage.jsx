import { Fragment } from "react";
import { ContactRound, Mail } from "lucide-react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import TabComponent from "@/components/tab/TabComponent";
import { EmailTab } from "@/container/setting/Channel/EmailTab";
import { EmailTemplateTab } from "@/container/setting/Channel/EmailTemplateTab";
import { WhatsAppTab } from "@/container/setting/Channel/WhatsAppTab";
import { WhatsAppTemplateTab } from "@/container/setting/Channel/WhatsAppTemplateTab";
import { StageTemplateTab } from "@/container/setting/Channel/StageTemplateTab";

const ChannelSettingsPage = () => {
  const tabs = [
    {
      value: "email",
      label: (
        <>
          <i className="ki-filled ki-sms"></i>
          Email
        </>
      ),
      children: <EmailTab />,
    },
    {
      value: "email_template",
      label: (
        <>
          <i className="ki-filled ki-directbox-default"></i>
          Email Template
        </>
      ),
      children: <EmailTemplateTab />,
    },
    {
      value: "whatsapp",
      label: (
        <>
          <i className="ki-filled ki-whatsapp"></i>
          WhatsApp
        </>
      ),
      children: <WhatsAppTab />,
    },
    {
      value: "whatsapp_template",
      label: (
        <>
          <i className="ki-filled ki-scroll"></i>
          WhatsApp Template
        </>
      ),
      children: <WhatsAppTemplateTab />,
    },
    {
      value: "stage_template",
      label: (
        <>
          <i className="ki-filled ki-status"></i>
          Stage Template
        </>
      ),
      children: <StageTemplateTab />,
    },
  ];

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <Breadcrumbs items={[{ title: "Channel" }]} />
        </div>
        <TabComponent tabs={tabs} />
      </Container>
    </Fragment>
  );
};
export { ChannelSettingsPage };
