import { Fragment } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { toAbsoluteUrl } from "@/utils";

const EventsPage = () => {
  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <Breadcrumbs items={[{ title: "Events" }]} />
        </div>
        <div className="card min-w-full">
          <div className="card-table">
            <h1 className="text-center p-10">Events content here</h1>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};
export { EventsPage };
