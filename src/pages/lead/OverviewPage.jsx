import { Fragment, useState } from "react";

import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import SalesPersonDropdown from "@/components/dropdowns/SalesPersonDropdown";
import PipLineDropdown from "@/components/dropdowns/PiplineDropdown";
import CompanyDropdown from "@/components/dropdowns/CompanyDropdown";
import SourceDropdown from "@/components/dropdowns/SourceDropdown";
import { Badge } from "@/components/ui/badge";
import TabComponent from "@/components/tab/TabComponent";
import ReportTab from "@/components/LeadOverview/ReportTab";
import LeadReportTab from "@/components/LeadOverview/LeadReportTab";
import FollowUpReportTab from "@/components/LeadOverview/FollowUpReportTab";

const OverviewPage = () => {
  const [filters, setFilters] = useState({});

  const onInputChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const salesTabs = [
    {
      label: "Daily",
      value: "daily",
      children: <ReportTab filterType="Daily" />,
    },
    {
      label: "Weekly",
      value: "weekly",
      children: <ReportTab filterType="Weekly" />,
    },
    {
      label: "Monthly",
      value: "monthly",
      children: <ReportTab filterType="Monthly" />,
    },
    {
      label: "Yearly",
      value: "yearly",
      children: <ReportTab filterType="Yearly" />,
    },
  ];
  const leadTabs = [
    {
      label: "Daily Leads",
      value: "daily",
      children: <LeadReportTab filterType="daily" />,
    },
    {
      label: "Monthly Leads",
      value: "monthly",
      children: <LeadReportTab filterType="monthly" />,
    },
    {
      label: "Source Wise",
      value: "source",
      children: <LeadReportTab filterType="source" />,
    },
    {
      label: "Company Wise",
      value: "company",
      children: <LeadReportTab filterType="company" />,
    },
    {
      label: "Pipeline Wise",
      value: "pipeline",
      children: <LeadReportTab filterType="pipeline" />,
    },
    {
      label: "Sales Person Wise",
      value: "sales_person",
      children: <LeadReportTab filterType="sales_person" />,
    },
    {
      label: "Stage Wise",
      value: "stage",
      children: <LeadReportTab filterType="stage" />,
    },
  ];
  const followUpTabs = [
    {
      label: "Follow Up Report",
      value: "follow_up",
      children: <FollowUpReportTab filterType="follow_up" />,
    },
    {
      label: "Activity Report",
      value: "activity",
      children: <FollowUpReportTab filterType="activity" />,
    },
    {
      label: "Open Leads Aging",
      value: "open_lead",
      children: <FollowUpReportTab filterType="open_lead" />,
    },
    {
      label: "Lost Reason Report",
      value: "lost_reason",
      children: <FollowUpReportTab filterType="lost_reason" />,
    },
  ];

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <Breadcrumbs items={[{ title: "Lead Overview" }]} />
        </div>
        {/* filters */}
        <div className="filters flex flex-wrap items-center gap-2 mb-3">
          <div className="filItems">
            <PipLineDropdown
              value={filters.event_type}
              onChange={onInputChange}
            />
          </div>
          <div className="filItems">
            <SourceDropdown value={filters.source} onChange={onInputChange} />
          </div>
          <div className="filItems">
            <SalesPersonDropdown
              value={filters.sales_person}
              onChange={onInputChange}
            />
          </div>
          <div className="filItems">
            <CompanyDropdown value={filters.company} onChange={onInputChange} />
          </div>
          <div className="filItems">
            <button className="btn btn-primary" title="Refresh">
              <i className="ki-filled ki-arrows-circle"></i>
            </button>
          </div>
        </div>

        {/* Lead Cards */}
        <div className="w-full">
          <div className="flex justify-between items-end gap-2 mb-2">
            <div className="flex flex-wrap gap-2">
              <Badge
                className="badge badge-outline badge-success text-xs"
                title="Type one"
              >
                <span className="flex items-center">
                  <i className="ki-filled ki-chart-line-up text-sm me-2"></i>
                  <span className="flex flex-col">
                    <span>
                      Total: <strong>0</strong>
                      <span className="ms-1.5">(0%)</span>
                    </span>
                    <span>
                      <strong>&#8377;0/-</strong>
                      <span className="ms-1.5">(0%)</span>
                    </span>
                  </span>
                </span>
              </Badge>
              <Badge
                className="badge badge-outline badge-dark text-xs"
                title="Type one"
              >
                <span className="flex items-center">
                  <i className="ki-filled ki-chart-line-up text-sm me-2"></i>
                  <span className="flex flex-col">
                    <span>
                      Open: <strong>0</strong>
                      <span className="ms-1.5">(0%)</span>
                    </span>
                    <span>
                      <strong>&#8377;0/-</strong>
                      <span className="ms-1.5">(0%)</span>
                    </span>
                  </span>
                </span>
              </Badge>
              <Badge
                className="badge badge-outline badge-info text-xs"
                title="Type one"
              >
                <span className="flex items-center">
                  <i className="ki-filled ki-chart-line-up text-sm me-2"></i>
                  <span className="flex flex-col">
                    <span>
                      Won: <strong>0</strong>
                      <span className="ms-1.5">(0%)</span>
                    </span>
                    <span>
                      <strong>&#8377;0/-</strong>
                      <span className="ms-1.5">(0%)</span>
                    </span>
                  </span>
                </span>
              </Badge>
              <Badge
                className="badge badge-outline badge-danger text-xs"
                title="Type one"
              >
                <span className="flex items-center">
                  <i className="ki-filled ki-chart-line-up text-sm me-2"></i>
                  <span className="flex flex-col">
                    <span>
                      Lost: <strong>0</strong>
                      <span className="ms-1.5">(0%)</span>
                    </span>
                    <span>
                      <strong>&#8377;0/-</strong>
                      <span className="ms-1.5">(0%)</span>
                    </span>
                  </span>
                </span>
              </Badge>
            </div>
            <div className="flex justify-end items-center gap-2">
              <button className="btn btn-primary" title="Custom Report">
                <i className="ki-filled ki-cheque"></i>
                Custom Report
              </button>
            </div>
          </div>
        </div>

        {/* Sales Report */}
        <div className="mb-7 card min-w-full w-full">
          <div className="card-body px-5 pb-5 pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Sales Report</h4>
            <TabComponent tabs={salesTabs} />
          </div>
        </div>

        {/* Daily Lead */}
        <div className="mb-7 card min-w-full w-full">
          <div className="card-body px-5 pb-5 pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Daily Leads</h4>
            <TabComponent tabs={leadTabs} />
          </div>
        </div>

        {/* Chart */}
        <div className="mb-7">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <div className="card min-w-full w-full">
                <div className="card-body px-5 pb-5 pt-4">
                  <p className="text-sm text-gray-900 opacity-50 p-7 text-center">
                    Sales person chart is not available!
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="card min-w-full w-full">
                <div className="card-body px-5 pb-5 pt-4">
                  <p className="text-sm text-gray-900 opacity-50 p-7 text-center">
                    Sales person chart is not available!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Follow Up Report */}
        <div className="card min-w-full w-full">
          <div className="card-body px-5 pb-5 pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              Follow Up Report
            </h4>
            <TabComponent tabs={followUpTabs} />
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { OverviewPage };
