import React from "react";
import { Table } from "antd";

/**
 * PaginatedTableComponent - Server-side pagination table
 *
 * This component is designed for server-side pagination where:
 * - API returns paginated data (items for current page only)
 * - API returns total count of items
 * - Page changes trigger new API calls
 */
export const PaginatedTableComponent = ({
  columns,
  data,
  loading,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  showSizeChanger = false,
}) => {
  return (
    <div className="card-body">
      <div className="scrollable-x-auto">
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey={(record) => record.id || record.sr_no}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
            onChange: onPageChange,
            showSizeChanger: showSizeChanger,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            position: ["bottomCenter"],
          }}
          scroll={{ x: "max-content" }}
        />
      </div>
    </div>
  );
};
