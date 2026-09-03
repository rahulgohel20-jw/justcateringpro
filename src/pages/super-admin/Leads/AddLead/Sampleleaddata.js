// Sample Static Lead Data for Testing Board View
// You can use this data to test the board view before your API is ready

export const sampleLeadData = [
  {
    id: 1,
    leadId: 1,
    clientName: "John Doe",
    leadCode: "L-001",
    leadType: "Hot",
    leadStatus: "Open",
    leadSource: "Website",
    contactNumber: "+91 98765 43210",
    emailId: "john.doe@example.com",
    planName: "Premium Insurance Plan",
    cityName: "Mumbai",
    leadAssignName: "Raj Kumar",
    createdAt: "2025-02-10",
    updatedAt: "2025-02-15",
    amount: 50000,
    closeDate: "2025-02-28",
    followUpDetails: [
      {
        id: 1,
        followUpType: "Call",
        followUpStatus: "Open",
        followUpDate: "2025-02-20",
        clientRemarks: "Interested in premium plan",
        employeeRemarks: "Follow up next week"
      }
    ]
  },
  {
    id: 2,
    leadId: 2,
    clientName: "Jane Smith",
    leadCode: "L-002",
    leadType: "Cold",
    leadStatus: "Pending",
    leadSource: "Referral",
    contactNumber: "+91 98765 43211",
    emailId: "jane.smith@example.com",
    planName: "Basic Health Cover",
    cityName: "Delhi",
    leadAssignName: "Priya Sharma",
    createdAt: "2025-02-12",
    updatedAt: "2025-02-14",
    amount: 25000,
    closeDate: "NA",
    followUpDetails: []
  },
  {
    id: 3,
    leadId: 3,
    clientName: "Robert Johnson",
    leadCode: "L-003",
    leadType: "Hot",
    leadStatus: "confirmed",
    leadSource: "Cold Call",
    contactNumber: "+91 98765 43212",
    emailId: "robert.j@example.com",
    planName: "Family Protection Plan",
    cityName: "Bangalore",
    leadAssignName: "Amit Patel",
    createdAt: "2025-02-13",
    updatedAt: "2025-02-16",
    amount: 75000,
    closeDate: "2025-02-25",
    followUpDetails: [
      {
        id: 2,
        followUpType: "Meeting",
        followUpStatus: "Closed",
        followUpDate: "2025-02-14",
        clientRemarks: "Ready to proceed",
        employeeRemarks: "Deal confirmed"
      }
    ]
  },
  {
    id: 4,
    leadId: 4,
    clientName: "Emily Davis",
    leadCode: "L-004",
    leadType: "Inquire",
    leadStatus: "Open",
    leadSource: "Email Campaign",
    contactNumber: "+91 98765 43213",
    emailId: "emily.d@example.com",
    planName: "Term Life Insurance",
    cityName: "Pune",
    leadAssignName: "Neha Singh",
    createdAt: "2025-02-14",
    updatedAt: "2025-02-14",
    amount: 0,
    closeDate: "NA",
    followUpDetails: [
      {
        id: 3,
        followUpType: "Email",
        followUpStatus: "Open",
        followUpDate: "2025-02-10",
        clientRemarks: "Needs more information",
        employeeRemarks: "Send brochure"
      }
    ]
  },
  {
    id: 5,
    leadId: 5,
    clientName: "Michael Brown",
    leadCode: "L-005",
    leadType: "Hot",
    leadStatus: "Closed",
    leadSource: "Walk-in",
    contactNumber: "+91 98765 43214",
    emailId: "michael.b@example.com",
    planName: "Vehicle Insurance",
    cityName: "Chennai",
    leadAssignName: "Vikram Reddy",
    createdAt: "2025-02-08",
    updatedAt: "2025-02-16",
    amount: 30000,
    closeDate: "2025-02-15",
    followUpDetails: [
      {
        id: 4,
        followUpType: "Call",
        followUpStatus: "Closed",
        followUpDate: "2025-02-09",
        clientRemarks: "Deal closed",
        employeeRemarks: "Payment received"
      }
    ]
  },
  {
    id: 6,
    leadId: 6,
    clientName: "Sarah Wilson",
    leadCode: "L-006",
    leadType: "Cold",
    leadStatus: "Cancel",
    leadSource: "Social Media",
    contactNumber: "+91 98765 43215",
    emailId: "sarah.w@example.com",
    planName: "Travel Insurance",
    cityName: "Hyderabad",
    leadAssignName: "-",
    createdAt: "2025-02-09",
    updatedAt: "2025-02-11",
    amount: 0,
    closeDate: "NA",
    followUpDetails: []
  },
  {
    id: 7,
    leadId: 7,
    clientName: "David Martinez",
    leadCode: "L-007",
    leadType: "Inquire",
    leadStatus: "Pending",
    leadSource: "Partner",
    contactNumber: "+91 98765 43216",
    emailId: "david.m@example.com",
    planName: "Home Insurance",
    cityName: "Kolkata",
    leadAssignName: "Sanjay Gupta",
    createdAt: "2025-02-11",
    updatedAt: "2025-02-13",
    amount: 100000,
    closeDate: "2025-03-01",
    followUpDetails: [
      {
        id: 5,
        followUpType: "Visit",
        followUpStatus: "Open",
        followUpDate: "2025-02-18",
        clientRemarks: "Site visit scheduled",
        employeeRemarks: "Prepare quotation"
      }
    ]
  },
  {
    id: 8,
    leadId: 8,
    clientName: "Lisa Anderson",
    leadCode: "L-008",
    leadType: "Hot",
    leadStatus: "Open",
    leadSource: "Google Ads",
    contactNumber: "+91 98765 43217",
    emailId: "lisa.a@example.com",
    planName: "Business Insurance",
    cityName: "Ahmedabad",
    leadAssignName: "Rahul Joshi",
    createdAt: "2025-02-15",
    updatedAt: "2025-02-15",
    amount: 150000,
    closeDate: "2025-02-28",
    followUpDetails: []
  },
];

// Function to transform sample data to board format
export const transformSampleDataToBoard = () => {
  const statusGroups = {
    Pending: { id: "pending", name: "Pending", children: [] },
    Open: { id: "open", name: "Open", children: [] },
    confirmed: { id: "confirmed", name: "Confirmed", children: [] },
    Cancel: { id: "cancel", name: "Cancelled", children: [] },
    Closed: { id: "closed", name: "Closed", children: [] },
  };

  sampleLeadData.forEach((lead) => {
    const status = lead.leadStatus || "Open";
    if (statusGroups[status]) {
      statusGroups[status].children.push({
        id: lead.leadId.toString(),
        leadId: lead.leadId,
        title: lead.clientName,
        subtitle: lead.leadCode,
        description: lead.planName,
        type: lead.leadType,
        contact: lead.contactNumber,
        city: lead.cityName,
        cityName: lead.cityName,
        assignedTo: lead.leadAssignName,
        leadAssign: lead.leadAssignName,
        leadAssignName: lead.leadAssignName,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
        amount: lead.amount,
        closeDate: lead.closeDate,
        followUpDetails: lead.followUpDetails,
        leadStatus: lead.leadStatus,
        ...lead,
      });
    }
  });

  return Object.values(statusGroups);
};

// Usage example:
// import { sampleLeadData, transformSampleDataToBoard } from './sampleLeadData';
// 
// To use in your component:
// const [boardColumns, setBoardColumns] = useState(transformSampleDataToBoard());