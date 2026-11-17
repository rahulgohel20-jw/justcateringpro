import { useEffect, useState, useMemo, useRef } from "react";
import { message, Spin } from "antd";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { planColumns } from "./constant";
import { getAllByRoleIdData } from "@/services/apiServices";
import { buildSpellSuggestions, extractDictWords } from "@/utils";

const PlanTable = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const searchBoxRef = useRef(null);
  const skipSuggestRef = useRef(false);

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);

      try {
        const response = await getAllByRoleIdData(1, "member");

        if (response.data.success) {
          let admins = response?.data?.data?.["User Details"];

          if (!Array.isArray(admins)) {
            admins = [admins];
          }

          const planData = admins.map((user) => ({
            id: user.id,
            customerName: `${user.firstName || "-"} ${user.lastName || "-"}`,
            planName: user.plan?.name || "-",
            planPrice: user.plan?.price || "-",
            billingCycle: user.plan?.billingCycle || "-",
            planDescription: user.plan?.description || "-",
            isPopular: user.plan?.isPopular ? "Yes" : "No",
          }));

          setPlans(planData);
          setFilteredPlans(planData);
        } else {
          message.error(response.data.msg || "No admins found");
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
        message.error("Error fetching admins");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const dictWords = useMemo(
    () => extractDictWords(plans, ["customerName", "planName", "billingCycle"]),
    [plans]
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
    const filtered = plans.filter((plan) =>
      plan.customerName.toLowerCase().includes(word.toLowerCase()) ||
      plan.planName.toLowerCase().includes(word.toLowerCase())
    );
    setFilteredPlans(filtered);
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

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);

    const filtered = plans.filter((plan) =>
      plan.customerName.toLowerCase().includes(value.toLowerCase()) ||
      plan.planName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPlans(filtered);
  };

  return (
    <Container>
      <div className="gap-2 pb-2 mb-3">
        <Breadcrumbs items={[{ title: "User Plans" }]} />
      </div>
      <div ref={searchBoxRef} className="w-[240px] filItems relative mb-4">
        <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
        <input
          className="input pl-8"
          placeholder="Search plans"
          type="text"
          value={searchText}
          onChange={handleSearch}
          onFocus={() => spellSuggestions.length > 0 && setShowSpell(true)}
          onKeyDown={handleSearchKeyDown}
          autoComplete="off"
          spellCheck={false}
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

      <Spin spinning={loading}>
        <TableComponent
          columns={planColumns}
          data={filteredPlans}
          paginationSize={10}
        />
      </Spin>
    </Container>
  );
};

export default PlanTable;
