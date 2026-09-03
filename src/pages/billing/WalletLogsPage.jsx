import { Fragment, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { CommonHexagonBadge } from "@/partials/common";
import { toAbsoluteUrl } from "@/utils";
import { TableComponent } from "@/components/table/TableComponent";

import { FeaturesHighlight } from "../public-profile/profiles/creator/blocks";
import { columns, defaultData } from "./constant";
import AddBalance from "../../partials/modals/add-balance/AddBalance";

const WalletLogsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const responseFormate = () => {
    const data = defaultData.map((item) => {
      return {
        ...item,
        handleModalOpen: handleModalOpen,
      };
    });
    return data;
  };

  const [tableData, setTableData] = useState(responseFormate());
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
          <Breadcrumbs items={[{ title: "Wallet Logs" }]} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-8 gap-3 lg:gap-4 mb-4">
          <div className="col-span-4 md:col-start-3 card min-w-full py-7 px-5 rtl:[background-position:-240px_center] [background-position:240px_center] bg-no-repeat bg-[length:500px] user-access-bg">
            <div className="flex items-center flex-wrap sm:flex-nowrap justify-between grow gap-2">
              <div className="flex items-center gap-4">
                <CommonHexagonBadge
                  stroke="stroke-success-clarity"
                  fill="fill-light"
                  size="size-[60px]"
                  badge={
                    <i className="ki-filled ki-wallet text-xl text-success"></i>
                  }
                />
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center flex-wrap gap-2.5">
                    <h3 className="text-xl font-semibold text-success">
                      &#8377; 100.00
                    </h3>
                    <span className="badge badge-sm badge-outline shrink-0">
                      9 days left
                    </span>
                  </div>
                  <div className="form-info text-gray-800 font-normal">
                    Current Balance
                  </div>
                </div>
              </div>
              <div className="flex items-center flex-wrap md:flex-nowrap gap-1.5">
                <button
                  className="btn btn-sm btn-success shrink-0"
                  title="Recharge Now"
                  onClick={() => {
                    handleModalOpen();
                  }}
                >
                  &#8377; Recharge Now
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="col-span-2">
            <div className="flex flex-col gap-5 lg:gap-7.5">
              <FeaturesHighlight
                image={
                  <Fragment>
                    <img
                      src={toAbsoluteUrl("/media/illustrations/18.svg")}
                      className="dark:hidden max-h-[200px]"
                      alt=""
                    />
                    <img
                      src={toAbsoluteUrl("/media/illustrations/18-dark.svg")}
                      className="light:hidden max-h-[200px]"
                      alt=""
                    />
                  </Fragment>
                }
                title="Automate Tasks"
                description="Delegate Tasks and get them completed without manual followups"
                more={{
                  title: "Get Started",
                  url: "/network/get-started",
                }}
                features={[
                  ["Time-Saving", "Easy Revamp"],
                  ["Budget-Friendly", "Fresh Look"],
                ]}
              />
            </div>
          </div> */}
        <TableComponent
          columns={columns}
          data={tableData}
          paginationSize={10}
        />
        <AddBalance isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
      </Container>
    </Fragment>
  );
};
export { WalletLogsPage };
