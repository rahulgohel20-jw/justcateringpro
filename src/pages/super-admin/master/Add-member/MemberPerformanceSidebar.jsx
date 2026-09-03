"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Hourglass,
  Mail,
  Phone,
  Flame,
  Snowflake,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SidebarModal from "../../../../components/ui/sidebar";
import {
  TabsContent,
  TabsList,
  TabsTrigger,
  Tabs,
} from "../../../../components/ui/tabs";
import { GetAllMemberByUserId } from "@/services/apiServices";

const MemberPerformanceSidebar = ({ isOpen, onClose, staffData, userId }) => {
  const [memberDetails, setMemberDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch specific member data when sidebar opens
  useEffect(() => {
    if (isOpen && staffData?.memberid && userId) {
      fetchMemberDetails();
    }
  }, [isOpen, staffData, userId]);

  const fetchMemberDetails = async () => {
    setLoading(true);
    try {
      const response = await GetAllMemberByUserId(userId);
      const allMembers = response?.data?.data?.userDetails?.userDetails || [];

      // ✅ Find the specific member by ID
      const member = allMembers.find((m) => m.id === staffData.memberid);

      if (member) {
        console.log("Member API Data:", member); // ✅ Debug log
        setMemberDetails({
          ...staffData,
          leadStatus: member.leadStatus || {},
          leadType: member.leadType || {},
          efficiencyBreakdown: member.efficiencyBreakdown || 0,
          serviceQualityRation: member.serviceQualityRation || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching member details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!staffData) return null;

  // ✅ Use memberDetails if available, otherwise use staffData
  const currentData = memberDetails || staffData;

  const memberName = currentData.full_name || currentData.name || "Unknown";
  const memberRole = currentData.role || "No Role";
  const memberEmail =
    currentData.email || currentData.companyEmail || "No Email";
  const memberContact = currentData.contact || "No Contact";
  const memberId = currentData.id || currentData.memberid || "N/A";

  // ✅ Extract lead status data
  const leadStatus = currentData.leadStatus || {};
  const leadType = currentData.leadType || {};

  // ✅ Calculate stats from leadStatus
  const overdue = leadStatus.cancel || leadStatus.Cancel || 0;
  const pending = leadStatus.pending || 0;
  const inProgress = leadStatus.open || 0;
  const completed = leadStatus.confirmed || 0;
  const closed = leadStatus.closed || 0;

  // ✅ Extract lead types
  const hotLeads = leadType.hot || 0;
  const coldLeads = (leadType.cold || 0) + (leadType.Cold || 0);
  const inquiryLeads = (leadType.inquire || 0) + (leadType.inquiry || 0);

  // ✅ Get efficiency breakdown from API (0-100 scale)
  const efficiencyScore = currentData.efficiencyBreakdown || 0;

  // ✅ Get service quality ratio from API (0-5 scale)
  const serviceQualityRatio = currentData.serviceQualityRation || 0;

  return (
    <SidebarModal
      isOpen={isOpen}
      onClose={onClose}
      title="Staff Analytics & Profile"
      subtitle="Performance metrics and details"
      width="2xl"
    >
      {loading ? (
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Loading member details...
          </p>
        </div>
      ) : (
        <>
          {/* Profile Section */}
          <div className="p-6 border-b">
            <div className="flex items-start gap-3 sm:gap-4">
  <Avatar className="h-12 w-12 sm:h-16 sm:w-16 shrink-0">
                <AvatarImage src={currentData.avatar || ""} alt={memberName} />
                <AvatarFallback className="bg-blue-500 text-white text-lg">
                  {memberName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{memberName}</h3>
                <Badge variant="secondary" className="mt-1 mb-2 text-green-800">
                  {memberRole}
                </Badge>
                <p className="text-xs text-muted-foreground">ID: {memberId}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-3 text-xs text-muted-foreground">
  <div className="flex items-center gap-1 min-w-0">
    <Mail className="h-3 w-3 shrink-0" />
    <span className="truncate">{memberEmail}</span>
  </div>
  <div className="flex items-center gap-1">
    <Phone className="h-3 w-3 shrink-0" />
    <span>{memberContact}</span>
  </div>
</div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="w-full grid grid-cols-3 rounded-none border-b h-auto p-0">
              <TabsTrigger
                value="analytics"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Task Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="p-6 space-y-6 mt-0">
              {/* Performance Overview */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-sm">
                      Performance Overview
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Real-time tracking of workload distribution
                    </p>
                  </div>
                </div>

               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-xs font-medium">CANCEL</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {String(overdue).padStart(2, "0")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 bg-gray-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span className="text-xs font-medium">CLOSED</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {String(closed).padStart(2, "0")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Hourglass className="h-4 w-4 text-yellow-600" />
                        <span className="text-xs font-medium">OPEN</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {String(inProgress).padStart(2, "0")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium">CONFIRMED</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {String(completed).padStart(2, "0")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="text-xs font-medium">PENDING</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {String(pending).padStart(2, "0")}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* ✅ Lead Type Section - Separate Cards */}
              <div>
                <div className="mb-4">
                  <h4 className="font-semibold text-sm">Lead Types</h4>
                  <p className="text-xs text-muted-foreground">
                    Distribution of lead categories
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="h-4 w-4 text-orange-600" />
                        <span className="text-xs font-medium">HOT</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {String(hotLeads).padStart(2, "0")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Snowflake className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium">COLD</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {String(coldLeads).padStart(2, "0")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <HelpCircle className="h-4 w-4 text-purple-600" />
                        <span className="text-xs font-medium">INQUIRY</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {String(inquiryLeads).padStart(2, "0")}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Efficiency and Service Quality */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ✅ Efficiency Breakdown - From API */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">
                    Efficiency Breakdown
                  </h4>
                  <div className="flex items-center justify-center">
  <div className="relative w-24 h-24 sm:w-32 sm:h-32">
    <svg viewBox="0 0 128 128" className="w-full h-full transform -rotate-90">
      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8"
        fill="none" className="text-gray-200" />
      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8"
        fill="none"
        strokeDasharray={Math.floor((efficiencyScore / 100) * 352)}
        className="text-green-500" strokeLinecap="round" />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-lg sm:text-2xl font-bold">{efficiencyScore.toFixed(1)}%</span>
      <span className="text-xs text-muted-foreground">EFFICIENCY</span>
    </div>
  </div>
</div>
                </div>

                {/* ✅ Service Quality Ratio - From API */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">
                    Service Quality Ratio
                  </h4>
                  <div className="flex items-center justify-center">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32">
  <svg className="w-24 h-24 sm:w-32 sm:h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-gray-200"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={Math.floor(
                            (serviceQualityRatio / 5) * 352,
                          )}
                          className="text-yellow-500"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">
                          {serviceQualityRatio.toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          OUT OF 5
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="teams" className="p-6">
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">
                  Teams & Groups data
                </p>
              </div>
            </TabsContent>

            <TabsContent value="attendance" className="p-6">
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">
                  Attendance records
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </SidebarModal>
  );
};

export default MemberPerformanceSidebar;
