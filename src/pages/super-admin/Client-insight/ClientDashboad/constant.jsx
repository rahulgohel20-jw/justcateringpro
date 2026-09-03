// constants.jsx — Dashboard header stats and table column definitions

// ─── Stat Cards Config (NO VALUES HERE) ─────────────────────────
export const STAT_CARDS = [
  {
    id: "eventCount",
    label: "TOTAL EVENT",
    subColor: "#6b7280",
    accent: "#386edb",
    icon: "/media/banners/icon1.png",
  },
  {
    id: "menuCount",
    label: "MENU PLANING",
    subColor: "#22c55e",
    accent: "#22c55e",
    icon: "/media/banners/Overlay.png",
  },
  {
    id: "menuAllocationCount",
    label: "EXECUTIONS",
    subColor: "#22c55e",
    accent: "#22c55e",
    icon: "/media/banners/Overlay (2).png",
  },
  {
    id: "labourCount",
    label: "LABOUR ALLOC.",
    subColor: "#6b7280",
    accent: "#f59e0b",
    icon: "/media/banners/Overlay (3).png",
  },
  {
    id: "rawMaterialCount",
    label: "rawMaterial",
    subColor: "#6b7280",
    accent: "#f59e0b",
    icon: "/media/banners/Overlay (3).png",
  },
  {
    id: "quotationCount",
    label: "QUOTATIONS",
    subColor: "#6b7280",
    accent: "#6b7280",
    icon: "/media/banners/Overlay (4).png",
  },
  {
    id: "invoiceCount",
    label: "INVOICES",
    subColor: "#ef4444",
    accent: "#ef4444",
    icon: "/media/banners/Overlay (5).png",
  },
];

export const CLIENT_COLUMNS = [
  {
    accessorKey: "identity",
    header: "CLIENT IDENTITY",
    cell: ({ row }) => row.original.identity,
  },
  {
    accessorKey: "enterprise",
    header: "ENTERPRISE",
    cell: ({ row }) => row.original.enterprise,
  },
  {
    accessorKey: "membership",
    header: "MEMBERSHIP",
    cell: ({ row }) => row.original.membership,
  },
  {
    accessorKey: "partnershipDate",
    header: "PARTNERSHIP DATE",
    cell: ({ row }) => row.original.partnershipDate,
  },
];

export const CLIENT_DATA = [
  {
    id: 1,
    initials: "JD",
    name: "Julianne Devis",
    email: "julianne@grandgala.com",
    enterprise: "Grand Gala Events",
    industry: "Hospitality & Catering",
    membershipType: "ACTIVE",
    partnershipDate: "Jan 12, 2023",
    lastEngagement: "2 hours ago",
    engagementStatus: "active",
    avatarColor: "#6366f1",
    loyaltyDays: "756",
    totalEvents: "98",
  },
  {
    id: 2,
    initials: "MS",
    name: "Marcus Sterling",
    email: "m.sterling@blueplate.io",
    enterprise: "Blue Plate Solutions",
    industry: "Logistics",
    membershipType: "DEMO",
    partnershipDate: "Mar 05, 2024",
    lastEngagement: "3 days ago",
    engagementStatus: "idle",
    avatarColor: "#374151",
    loyaltyDays: "61",
    totalEvents: "12",
  },
  {
    id: 3,
    initials: "RH",
    name: "Rebecca Hines",
    email: "rebecca@urbanfeast.com",
    enterprise: "Urban Feast Collective",
    industry: "Boutique Catering",
    membershipType: "ACTIVE",
    partnershipDate: "Nov 22, 2022",
    lastEngagement: "Just now",
    engagementStatus: "active",
    avatarColor: "#f97316",
    loyaltyDays: "1,124",
    totalEvents: "142",
  },
  {
    id: 4,
    initials: "DA",
    name: "Daniel Arquette",
    email: "dan@thelocal.co",
    enterprise: "The Local Co.",
    industry: "Vendor",
    membershipType: "DEMO",
    partnershipDate: "Feb 14, 2024",
    lastEngagement: "1 week ago",
    engagementStatus: "overdue",
    avatarColor: "#374151",
    loyaltyDays: "80",
    totalEvents: "19",
  },
];

export const FILTER_TABS = ["All Clients", "Active", "Demo"];
