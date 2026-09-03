import { DataGridColumnHeader } from "@/components";
import { Link } from "react-router-dom";
export const columns = [
    {
        accessorKey: "holiday",
        
        header: ({ column }) => (
            <DataGridColumnHeader title="Holiday" column={column} />
        ),
        
    },
    {
        accessorKey: "date",
        
        header: ({ column }) => (
            <DataGridColumnHeader title="Date" column={column} />
        ),
        
    },
    
    
    
    {
        accessorKey: "action",
        header: "Action",
        cell: ({ cell  }) => {
            return (
            
                <div className="flex items-center justify-center gap-1">
                    
                    
                    
                    <button
                        className="btn btn-sm btn-icon btn-clear"
                        title="Delete"
                    >
                        <i className="ki-filled ki-trash"></i>
                    </button>
                </div>
            );
        },
    },
];
export const defaultData = [
    
];

