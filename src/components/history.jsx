import { useEffect, useMemo } from "react";
import { Table, Button, Space } from "antd";
export default function History({ historyList, delItem, resetForm }) {
  // 限制显示最多 5 条记录
  const displayList = useMemo(() => {
    return historyList.slice(0, 5);
  }, [historyList]);

  const columns = [
    {
      title: "查询时间",
      dataIndex: "searchTime",
      key: "searchTime",
      align: "center",
    },
    {
      title: "城市",
      dataIndex: "city",
      key: "city",
      align: "center",
    },
    {
      title: "数据类型",
      dataIndex: "dataTypes",
      key: "dataTypes",
      align: "center",
      render: (dataTypes) => {
        if (Array.isArray(dataTypes)) {
          return dataTypes.join(", ");
        }
        return dataTypes || "-";
      },
    },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      align: "center",
      render: (_, record) => {
        const originalIndex = historyList.findIndex(
          (item) =>
            item.searchTime === record.searchTime && item.city === record.city
        );
        return (
          <Space>
            <Button
              type="primary"
              onClick={() => {
                resetForm(record);
              }}
            >
              重新查询
            </Button>
            <Button
              type="primary"
              danger
              onClick={() => {
                if (originalIndex !== -1) {
                  delItem(record, originalIndex);
                }
              }}
            >
              删除
            </Button>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    console.log("History", displayList.length);
  }, [displayList]);

  return (
    <div className="history-container">
      <Table
        dataSource={displayList}
        columns={columns}
        pagination={false}
        rowKey={(record, index) =>
          `${record.searchTime}-${record.city}-${index}`
        }
      />
    </div>
  );
}
