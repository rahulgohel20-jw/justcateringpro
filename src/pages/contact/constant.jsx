import { DataGridColumnHeader } from "@/components";
export const columns = [
  {
    accessorKey: "first_name",
    header: ({ column }) => (
      <DataGridColumnHeader title="Contact Name" column={column} />
    ),
  },
  {
    accessorKey: "mobile",
    header: ({ column }) => (
      <DataGridColumnHeader title="Mobile" column={column} />
    ),
  },
  {
    accessorKey: "compony",
    header: ({ column }) => (
      <DataGridColumnHeader title="Compony" column={column} />
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ cell }) => {
      return cell.row.original.action;
    },
  },
];
export const defaultData = [
  {
    id: 1,
    first_name: "Tiger Nixon",
    mobile: "9865326598",
    compony: "Edinburgh",
  },
  {
    id: 2,
    first_name: "Garrett Winters",
    mobile: "9865326598",
    compony: "Tokyo",
  },
  {
    id: 3,
    first_name: "Ashton Cox",
    mobile: "9865326598",
    compony: "San Francisco",
  },
  {
    id: 4,
    first_name: "Airi Satou",
    mobile: "9865326598",
    compony: "Tokyo",
  },
  {
    id: 5,
    first_name: "Brielle Williamson",
    mobile: "9865326598",
    compony: "New York",
  },
  {
    id: 6,
    first_name: "Herrod Chandler",
    mobile: "9865326598",
    compony: "San Francisco",
  },
  {
    id: 7,
    first_name: "Rhona Davidson",
    mobile: "9865326598",
    compony: "Tokyo",
  },
  {
    id: 8,
    first_name: "Colleen Hurst",
    mobile: "9865326598",
    compony: "San Francisco",
  },
  {
    id: 9,
    first_name: "Sonya Frost",
    mobile: "9865326598",
    compony: "Edinburgh",
  },
  {
    id: 10,
    first_name: "Jena Gaines",
    mobile: "9865326598",
    compony: "London",
  },
  {
    id: 11,
    first_name: "Quinn Flynn",
    mobile: "9865326598",
    compony: "Edinburgh",
  },
  {
    id: 12,
    first_name: "Charde Marshall",
    mobile: "9865326598",
    compony: "San Francisco",
  },
  {
    id: 13,
    first_name: "Haley Kennedy",
    mobile: "9865326598",
    compony: "London",
  },
  {
    id: 14,
    first_name: "Tatyana Fitzpatrick",
    mobile: "9865326598",
    compony: "London",
  },
  {
    id: 15,
    first_name: "Michael Silva",
    mobile: "9865326598",
    compony: "London",
  },
  {
    id: 16,
    first_name: "Paul Byrd",
    mobile: "9865326598",
    compony: "New York",
  },
  {
    id: 17,
    first_name: "Gloria Little",
    mobile: "9865326598",
    compony: "New York",
  },
  {
    id: 18,
    first_name: "Bradley Greer",
    mobile: "9865326598",
    compony: "London",
  },
  {
    id: 19,
    first_name: "Dai Rios",
    mobile: "9865326598",
    compony: "Edinburgh",
  },
  {
    id: 20,
    first_name: "Jenette Caldwell",
    mobile: "9865326598",
    compony: "New York",
  },
  {
    id: 21,
    first_name: "Yuri Berry",
    mobile: "9865326598",
    compony: "New York",
  },
  {
    id: 22,
    first_name: "Caesar Vance",
    mobile: "9865326598",
    compony: "New York",
  },
  {
    id: 23,
    first_name: "Doris Wilder",
    mobile: "9865326598",
    compony: "Sydney",
  },
  {
    id: 24,
    first_name: "Angelica Ramos",
    mobile: "9865326598",
    compony: "London",
  },
  {
    id: 25,
    first_name: "Gavin Joyce",
    mobile: "9865326598",
    compony: "Edinburgh",
  },
  {
    id: 26,
    first_name: "Jennifer Chang",
    mobile: "9865326598",
    compony: "Singapore",
  },
  {
    id: 27,
    first_name: "Brenden Wagner",
    mobile: "9865326598",
    compony: "San Francisco",
  },
  {
    id: 28,
    first_name: "Fiona Green",
    mobile: "9865326598",
    compony: "San Francisco",
  },
  {
    id: 29,
    first_name: "Shou Itou",
    mobile: "9865326598",
    compony: "Tokyo",
  },
  {
    id: 30,
    first_name: "Michelle House",
    mobile: "9865326598",
    compony: "Sidney",
  },

  {
    id: 31,
    first_name: "Suki Burks",
    mobile: "9865326598",
    compony: "London",
  },
  {
    id: 32,
    first_name: "Prescott Bartlett",
    mobile: "9865326598",
    compony: "London",
  },
  {
    id: 33,
    first_name: "Gavin Cortez",
    mobile: "9865326598",
    compony: "San Francisco",
  },
  {
    id: 34,
    first_name: "Martena Mccray",
    mobile: "9865326598",
    compony: "Edinburgh",
  },
  {
    id: 35,
    first_name: "Unity Butler",
    mobile: "9865326598",
    compony: "San Francisco",
  },
];
