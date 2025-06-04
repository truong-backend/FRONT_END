import React, { useState, useEffect } from 'react';
import { Table, Input, Space, Button, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { userService } from '../../services/userService';
import moment from 'moment';

const ListTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    sorter: {
      field: 'id',
      order: 'ascend'
    },
    search: ''
  });

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const { pagination, sorter, search } = tableParams;
      const data = await userService.getUsersByRole(
        'TEACHER',
        pagination.current - 1,
        pagination.pageSize,
        sorter.field,
        sorter.order === 'ascend' ? 'asc' : 'desc',
        search
      );
      setTeachers(data.content);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: data.totalElements
        }
      });
    } catch (error) {
      message.error('Lỗi khi tải danh sách giảng viên');
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [JSON.stringify(tableParams)]); // Re-fetch when params change

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      ...tableParams,
      pagination,
      sorter: {
        field: sorter.field || 'id',
        order: sorter.order || 'ascend'
      }
    });
  };

  const handleSearch = (value) => {
    setTableParams({
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        current: 1 // Reset to first page
      },
      search: value
    });
  };

  const handleEdit = (record) => {
    // Implement edit functionality
    console.log('Edit teacher:', record);
  };

  const handleDelete = async (id) => {
    try {
      await userService.deleteUser(id);
      message.success('Xóa giảng viên thành công');
      fetchTeachers();
    } catch (error) {
      message.error('Lỗi khi xóa giảng viên');
      console.error('Error deleting teacher:', error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      sorter: true,
      width: '10%'
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      sorter: true,
      width: '30%'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: true,
      width: '30%'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      sorter: true,
      width: '20%',
      render: (date) => date ? moment(date).format('DD/MM/YYYY HH:mm') : 'N/A'
    },
    {
      title: 'Thao tác',
      width: '10%',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa giảng viên này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Danh sách Giảng viên</h2>
        <Input.Search
          placeholder="Tìm kiếm..."
          onSearch={handleSearch}
          style={{ width: 300 }}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={teachers}
        rowKey="id"
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default ListTeacher;
