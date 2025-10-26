import React from 'react';
import { Table, TableProps, Space, Button, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';

export interface DataTableProps<T> {
  columns: ColumnsType<T>;
  dataSource: T[];
  loading?: boolean;
  pagination?: TablePaginationConfig | false;
  rowSelection?: TableRowSelection<T>;
  onRow?: (record: T) => { onClick?: () => void };
  actions?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    onClick: (record: T) => void;
    disabled?: (record: T) => boolean;
    tooltip?: string;
  }>;
  scroll?: TableProps<T>['scroll'];
  size?: 'small' | 'middle' | 'large';
  bordered?: boolean;
  className?: string;
}

function DataTable<T extends Record<string, any>>({
  columns,
  dataSource,
  loading = false,
  pagination = false,
  rowSelection,
  onRow,
  actions = [],
  scroll,
  size = 'middle',
  bordered = false,
  className,
}: DataTableProps<T>) {
  // 构建操作列
  const actionColumns: ColumnsType<T> = actions.length > 0 ? [
    {
      title: '操作',
      key: 'actions',
      width: actions.length * 60 + 20,
      fixed: 'right',
      render: (_, record: T) => (
        <Space size="small">
          {actions.map((action) => {
            const isDisabled = action.disabled?.(record);
            const button = (
              <Button
                key={action.key}
                type="text"
                size="small"
                icon={action.icon}
                disabled={isDisabled}
                onClick={() => action.onClick(record)}
              >
                {action.label}
              </Button>
            );

            return action.tooltip ? (
              <Tooltip key={action.key} title={action.tooltip}>
                {button}
              </Tooltip>
            ) : (
              button
            );
          })}
        </Space>
      ),
    },
  ] : [];

  // 合并列配置
  const finalColumns = [...columns, ...actionColumns];

  return (
    <div className={className}>
      <Table<T>
        columns={finalColumns}
        dataSource={dataSource}
        loading={loading}
        pagination={pagination}
        rowSelection={rowSelection}
        onRow={onRow}
        scroll={scroll}
        size={size}
        bordered={bordered}
        rowKey="id"
        className="data-table"
      />
    </div>
  );
}

// 预设的操作按钮
export const TableActions = {
  view: {
    key: 'view',
    label: '查看',
    icon: <EyeOutlined />,
    tooltip: '查看详情',
  },
  edit: {
    key: 'edit',
    label: '编辑',
    icon: <EditOutlined />,
    tooltip: '编辑',
  },
  delete: {
    key: 'delete',
    label: '删除',
    icon: <DeleteOutlined />,
    tooltip: '删除',
  },
};

export default DataTable;
