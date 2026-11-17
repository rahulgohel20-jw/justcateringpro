import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import AssignTheme from "../theme";
import { message, Spin } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "../vendor/constant";
import {
  getAllByRoleIdData,
  LoginWithOtp,
  updateStatusApprove,
} from "@/services/apiServices";
import ApproveOtp from "../approveotp";
import { usePermission } from "../../../../hooks/usePermission";
import { buildSpellSuggestions, extractDictWords } from "@/utils";

const AllVendor = () => {
  const permissions = usePermission("Vendors");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [selectedThemeUserId, setSelectedThemeUserId] = useState(null);

  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const searchBoxRef = useRef(null);
  const skipSuggestRef = useRef(false);

  const formatUsers = (users) => {
    const managerMap = {};
    users.forEach((u) => {
      managerMap[u.id] = `${u.firstName} ${u.lastName}`;
    });
    return users
      .sort((a, b) => b.id - a.id)
      .map((user) => ({
        id: user.id,
        fullName: `${user.firstName} ${user.lastName}`,
        city: user.userBasicDetails?.city?.name || "-",
        contactNo: user.contactNo,
        companyName: user.userBasicDetails?.companyName || "-",
        plan: user.userPlan?.plan?.name || "-",
        isActive: user.isActive,
        isApprove: user.isApprove,
        createdAt: user.createdAt,
        email: user.email,
        userCode: user.userCode || "-",
        remark: user.remarks || "-",
        database: user.database || "-",
      }));
  };

  const handleFetchByRoleId = useCallback(async (roleId = 1) => {
    try {
      setLoading(true);
      const response = await getAllByRoleIdData(roleId, "member");
      if (response.data.success) {
        const users = response.data.data?.["User Details"].users || [];
        const formatted = formatUsers(users);
        setTableData(formatted);
        setFilteredData(formatted);
      } else {
        message.error(response.data.msg || "No users found");
      }
    } catch (err) {
      console.error(err);
      message.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleFetchByRoleId();
  }, [handleFetchByRoleId]);

  const dictWords = useMemo(
    () =>
      extractDictWords(tableData, [
        "fullName",
        "email",
        "companyName",
        "plan",
        "userCode",
        "city",
      ]),
    [tableData]
  );

  useEffect(() => {
    if (skipSuggestRef.current) {
      skipSuggestRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const suggestions = buildSpellSuggestions(searchText, dictWords);
      setSpellSuggestions(suggestions);
      setShowSpell(suggestions.length > 0);
      setSpellIndex(-1);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchText, dictWords]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSpell(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const applySpellSuggestion = (word) => {
    skipSuggestRef.current = true;
    setSearchText(word);
    setShowSpell(false);
    setSpellIndex(-1);
  };

  const handleSearchKeyDown = (e) => {
    if (!showSpell || spellSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSpellIndex((prev) => (prev + 1) % spellSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSpellIndex((prev) =>
        prev <= 0 ? spellSuggestions.length - 1 : prev - 1
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

  useEffect(() => {
    if (!searchText) {
      setFilteredData(tableData);
    } else {
      const lower = searchText.toLowerCase();
      setFilteredData(
        tableData.filter(
          (u) =>
            u.fullName?.toLowerCase().includes(lower) ||
            u.email?.toLowerCase().includes(lower) ||
            u.companyName?.toLowerCase().includes(lower) ||
            u.plan?.toLowerCase().includes(lower) ||
            u.userCode?.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchText, tableData]);

  const handleEdit = (user) => {
    navigate(`/Superadmin-member-edit/${user.id}`);
  };

  const handleApprove = async (userId) => {
    try {
      setLoading(true);
      const res = await updateStatusApprove(userId);
      if (res.data.success) {
        message.success("User approved successfully");
        handleFetchByRoleId();
      } else {
        message.error(res.data.msg || "Failed to approve user");
      }
    } catch (err) {
      console.error(err);
      message.error("Error approving user");
    } finally {
      setLoading(false);
    }
  };

  const handleThemeClick = (userId) => {
    setSelectedThemeUserId(userId);
    setIsThemeModalOpen(true);
  };

  const handleApproveOtp = async (userId) => {
    try {
      setLoading(true);
      const mobile = 8866889580;
      const res = await LoginWithOtp(mobile);

      if (res?.data?.success) {
        message.success("OTP sent successfully");
        setSelectedThemeUserId(userId);
        setIsOtpModalOpen(true);
      } else {
        message.error(res?.data?.msg || "Failed to send OTP");
      }
    } catch (error) {
      console.error(error);
      message.error("Something went wrong while sending OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="gap-2 pb-2 mb-3">
        <Breadcrumbs items={[{ title: "Vendors" }]} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div ref={searchBoxRef} className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search vendor..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => spellSuggestions.length > 0 && setShowSpell(true)}
            onKeyDown={handleSearchKeyDown}
            autoComplete="off"
            spellCheck={false}
            className="input input-sm w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
          {showSpell && spellSuggestions.length > 0 && (
            <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div className="px-3 pt-2 pb-1 text-xs text-gray-400">Suggestions:</div>
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
          <Link to="/vendor" className="w-full sm:w-auto">
            <button className="btn btn-primary flex items-center justify-center gap-1 w-full sm:w-auto">
              <i className="ki-filled ki-plus"></i> Add Vendor
            </button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" tip="Loading..." />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <TableComponent
            columns={columns(
              handleEdit,
              handleApprove,
              navigate,
              handleThemeClick,
              handleApproveOtp,
              permissions
            )}
            data={filteredData}
            paginationSize={10}
          />
        </div>
      )}

      <ApproveOtp
        isModalOpen={isOtpModalOpen}
        setIsModalOpen={setIsOtpModalOpen}
        userId={selectedThemeUserId}
        refreshData={handleFetchByRoleId}
      />

      <AssignTheme
        isModalOpen={isThemeModalOpen}
        setIsModalOpen={setIsThemeModalOpen}
        userId={selectedThemeUserId}
      />
    </Container>
  );
};

export default AllVendor;
