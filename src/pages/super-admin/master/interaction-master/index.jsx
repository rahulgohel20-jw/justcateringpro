import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { GetAllInteraction } from "@/services/apiServices";
import useStyle from "./style";
import AddInteraction from "@/partials/modals/add-interaction/AddInteraction";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { usePermission } from "../../../../hooks/usePermission";

const InteractionMaster = () => {
  const permissions = usePermission("Interaction");
  const classes = useStyle();
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const [tableData, setTableData] = useState([]);
  const intl = useIntl();

  let Id = localStorage.getItem("userId");

  useEffect(() => {
    FetchInteractions();
  }, []);

  // ------------------ FETCH ALL ------------------
  const FetchInteractions = () => {
    GetAllInteraction(Id)
      .then((res) => {
        const formatted = res.data.data["Interaction Details"].map(
          (interaction, index) => ({
            sr_no: index + 1,
            interaction_name: interaction.interactionname,
            interaction_type: interaction.interactiontype,
            interactionId: interaction.id,
            interactiontype: interaction.interactiontype,
            isActive: interaction.isActive,
          }),
        );
        setTableData(formatted);
      })
      .catch((error) => console.error("Fetch error:", error));
  };

  // ------------------ DELETE ------------------

  // ------------------ EDIT ------------------
  const handleEdit = (row) => {
    setSelectedInteraction(row);
    setIsInteractionModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        <div className="gap-2 pb-2 mb-3">
          <Breadcrumbs
            items={[
              {
                title: (
                  <FormattedMessage
                    id="USER.MASTER.INTERACTION_MASTER"
                    defaultMessage="Interaction Master"
                  />
                ),
              },
            ]}
          />
        </div>

        {/* Search + Add */}
        <div className="filters flex justify-between mb-3">
          <div className={`flex items-center gap-2 ${classes.customStyle}`}>
            {/* <div className="relative">
              <i className="ki-filled ki-magnifier absolute top-1/2 -translate-y-1/2 ms-3 text-primary" />
              <input
                className="input pl-8"
                placeholder="Search Interaction"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div> */}
          </div>

          {permissions.add && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedInteraction(null);
                setIsInteractionModalOpen(true);
              }}
            >
              <i className="ki-filled ki-plus"></i> Add Interaction
            </button>
          )}
        </div>

        {/* Modal */}
        <AddInteraction
          isOpen={isInteractionModalOpen}
          onClose={() => setIsInteractionModalOpen(false)}
          refreshData={FetchInteractions}
          interaction={selectedInteraction}
        />

        {/* Table */}
        <TableComponent
          columns={columns(handleEdit, permissions)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default InteractionMaster;
