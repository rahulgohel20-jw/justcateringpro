import { Fragment, useEffect, useState, useRef } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { message } from "antd";
import { GetAllRole, DeleteRole } from "@/services/apiServices";
import AddRole from "@/partials/modals/add-role-master/AddRole";
import { FormattedMessage, useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";
import AddChildRoleModal from "../../../partials/modals/add-childRole/AddChildRoleModal";
import RoleHierarchyModal from "../../../partials/modals/show-heriechy/RoleHierarchyModal";
import { buildSpellSuggestions, extractDictWords } from "@/utils";

const RoleMaster = () => {
  const permissions = usePermission("Department");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [childRoleModal, setChildRoleModal] = useState(false);
  const [selectedParentRole, setSelectedParentRole] = useState(null);

  const [hierarchyModal, setHierarchyModal] = useState(false);
  const [selectedHierarchyRole, setSelectedHierarchyRole] = useState(null);

  // Suggestions state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

  const handleShowHierarchy = (role) => {
    setSelectedHierarchyRole(role);
    setHierarchyModal(true);
  };

  const handleAddChildRole = (role) => {
    setSelectedParentRole(role);
    setChildRoleModal(true);
  };

  const intl = useIntl();

  const fetchRoles = async (search = "") => {
    try {
      const userId = localStorage.getItem("userId");

      const res = await GetAllRole(userId);
      let roles = res?.data?.data?.["Role Details"] || [];

      setOriginalData(roles);
      const words = extractDictWords(roles, ["name"]);
      setDictWords(words);

      if (search) {
        roles = roles.filter((r) =>
          (r.name || "").toLowerCase().includes(search.toLowerCase()),
        );
      }

      const roleData = roles.map((role, index) => ({
        sr_no: index + 1,
        role_name: role.name || "",
        roleId: role.id || "",
      }));

      setTableData(roleData);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setTableData([]);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (!searchTerm.trim()) {
        const roleData = originalData.map((role, index) => ({
          sr_no: index + 1,
          role_name: role.name || "",
          roleId: role.id || "",
        }));
        setTableData(roleData);
      } else {
        const filtered = originalData.filter((r) =>
          (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
        );
        const roleData = filtered.map((role, index) => ({
          sr_no: index + 1,
          role_name: role.name || "",
          roleId: role.id || "",
        }));
        setTableData(roleData);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm, originalData]);

  // Build suggestions while typing
  useEffect(() => {
    if (skipSuggestRef.current) {
      skipSuggestRef.current = false;
      return;
    }
    const q = (searchTerm || "").trim().toLowerCase();
    if (q.length < 2 || dictWords.length === 0) {
      setSpellSuggestions([]);
      setShowSpell(false);
      return;
    }
    const timer = setTimeout(() => {
      const suggestions = buildSpellSuggestions(q, dictWords, 6);
      setSpellSuggestions(suggestions);
      setShowSpell(suggestions.length > 0);
      setSpellIndex(-1);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchTerm, dictWords]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSpell(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const applySpellSuggestion = (word) => {
    skipSuggestRef.current = true;
    setSearchTerm(word);
    setShowSpell(false);
  };

  const handleSearchKeyDown = (e) => {
    if (!showSpell || spellSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSpellIndex((prev) =>
        prev < spellSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSpellIndex((prev) =>
        prev > 0 ? prev - 1 : spellSuggestions.length - 1
      );
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (spellIndex >= 0 && spellIndex < spellSuggestions.length) {
        e.preventDefault();
        applySpellSuggestion(spellSuggestions[spellIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSpell(false);
    }
  };

  const handleEdit = (role) => {
    setSelectedRole(role);
    setIsRoleModalOpen(true);
  };

  const handleDelete = (roleId) => {
    DeleteRole(roleId)
      .then(() => {
        message.success("Role Deleted Successfully");
        fetchRoles();
      })
      .catch((err) => {
        console.error("Error deleting role:", err);
      });
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className=" pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="COMMON.DEPARTMENT_MASTER"
              defaultMessage="Department Master"
            />
          </h1>
        </div>

        {/* Filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="filItems relative" ref={searchBoxRef}>
            <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
            <input
              className="input pl-8"
              placeholder={intl.formatMessage({
                id: "USER.MASTER.SEARCH_ROLE",
                defaultMessage: "Search Role",
              })}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => spellSuggestions.length > 0 && setShowSpell(true)}
              onKeyDown={handleSearchKeyDown}
              autoComplete="off"
              spellCheck={false}
            />
            {showSpell && spellSuggestions.length > 0 && (
              <div className="absolute left-0 top-full mt-1 w-[260px] bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="px-3 pt-2 pb-1 text-xs text-gray-400">
                  Suggestions:
                </div>
                <ul>
                  {spellSuggestions.map((s, i) => (
                    <li
                      key={s}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applySpellSuggestion(s);
                      }}
                      onMouseEnter={() => setSpellIndex(i)}
                      className={`px-3 py-2 cursor-pointer text-sm text-primary capitalize ${
                        i === spellIndex ? "bg-gray-100" : "hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedRole(null);
                  setIsRoleModalOpen(true);
                }}
              >
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="USER.MASTER.ADD_CONTACT_CATEGORY"
                  defaultMessage="Create New"
                />
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        <AddRole
          isModalOpen={isRoleModalOpen}
          setIsModalOpen={setIsRoleModalOpen}
          editData={selectedRole}
          onRoleAdded={fetchRoles}
        />

        {/* Table */}
        <TableComponent
          columns={columns(handleEdit, handleDelete, handleAddChildRole, handleShowHierarchy, permissions)}
          data={tableData}
          paginationSize={10}
        />
        <AddChildRoleModal
          isOpen={childRoleModal}
          onClose={() => setChildRoleModal(false)}
          parentRole={selectedParentRole}
          onSaved={fetchRoles}
        />

        <RoleHierarchyModal
          isOpen={hierarchyModal}
          onClose={() => setHierarchyModal(false)}
          role={selectedHierarchyRole}
        />
      </Container>
    </Fragment>
  );
};

export default RoleMaster;
