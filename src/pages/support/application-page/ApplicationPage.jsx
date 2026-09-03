import { Fragment } from "react";
import { Container } from "@/components/container";
import { KeenIcon } from "@/components";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { CommonHexagonBadge } from "@/partials/common";
import { toAbsoluteUrl } from "@/utils";
const ApplicationPage = () => {
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
          <Breadcrumbs items={[{ title: "Mobile App" }]} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 mb-4">
          <div className="col-span-1 flex items-center flex-wrap sm:flex-nowrap justify-between grow border border-gray-200 rounded-xl gap-2 py-7 px-5 rtl:[background-position:-200px_center] [background-position:200px_center] bg-no-repeat bg-[length:500px] user-access-bg">
            <div className="flex items-center gap-4">
              <CommonHexagonBadge
                stroke="stroke-primary-clarity"
                fill="fill-light"
                size="size-[60px]"
                badge={
                  <KeenIcon
                    icon="ki-filled ki-android"
                    className="text-2xl text-primary text-brand"
                  />
                }
              />
              <div className="flex flex-col gap-1">
                <div className="flex items-center flex-wrap gap-2.5">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Download Android App
                  </h3>
                </div>
                <div className="form-info text-gray-800 font-normal">
                  Download the app on your Android phone.
                </div>
              </div>
            </div>
            <div className="flex items-center flex-wrap md:flex-nowrap gap-1.5">
              <button
                className="btn btn-sm btn-primary shrink-0"
                title="Download App"
              >
                <i className="ki-filled ki-cloud-download"></i> Download App
              </button>
            </div>
          </div>
          <div className="col-span-1 flex items-center flex-wrap sm:flex-nowrap justify-between grow border border-gray-200 rounded-xl gap-2 py-7 px-5 rtl:[background-position:-200px_center] [background-position:200px_center] bg-no-repeat bg-[length:500px] user-access-bg">
            <div className="flex items-center gap-4">
              <CommonHexagonBadge
                stroke="stroke-primary-clarity"
                fill="fill-light"
                size="size-[60px]"
                badge={
                  <KeenIcon
                    icon="ki-filled ki-apple"
                    className="text-2xl text-primary text-brand"
                  />
                }
              />
              <div className="flex flex-col gap-1">
                <div className="flex items-center flex-wrap gap-2.5">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Download iOS App
                  </h3>
                </div>
                <div className="form-info text-gray-800 font-normal">
                  Download and enjoy on your iPhone.
                </div>
              </div>
            </div>
            <div className="flex items-center flex-wrap md:flex-nowrap gap-1.5">
              <button
                className="btn btn-sm btn-primary shrink-0"
                title="Download App"
              >
                <i className="ki-filled ki-cloud-download"></i> Download App
              </button>
            </div>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};
export { ApplicationPage };
