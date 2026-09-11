import { Edit, Trash2 } from "lucide-react";

export const getFollowUpColumns = ({ canEdit, canDelete, onEdit, onDelete }) => {
  const columns = [
    {
      accessorKey: "srNo",
      header: "Sr No",
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
    },
    {
      accessorKey: "managerName",
      header: "Manager Name",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "followupDate",
      header: "Follow Date",
    },
  ];

  if (canEdit || canDelete) {          
    columns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {canEdit && (                 // ← gate edit icon individually
            <button
              type="button"
              onClick={() => onEdit(row.original)}
              className="text-primary hover:text-primary/70 transition-colors"
            >
              <Edit size={15} />
            </button>
          )}
          {canDelete && (              
            <button
              type="button"
              onClick={() => onDelete(row.original.id)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ),
    });
  }

  return columns;
};