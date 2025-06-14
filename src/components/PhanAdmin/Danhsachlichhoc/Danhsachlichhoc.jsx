import React, { useState, useEffect } from 'react';

import {
    Table,
    Input,
    Select,
    message,
    Modal,
    Button,
    Form,
    DatePicker,
    InputNumber,
} from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { lichHocService } from '../../../services/PhanAdmin/lichHocService';
import { studentService } from '../../../services/PhanAdmin/studentService';
import { LichGdService } from '../../../services/PhanAdmin/LichGdService';
import moment from 'moment';

const { Option } = Select;

export const Danhsachlichhoc = () => {
    const [fullData, setFullData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [displayData, setDisplayData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [searchText, setSearchText] = useState('');
    const [selectedHocKy, setSelectedHocKy] = useState('');
    const [selectedGiangVien, setSelectedGiangVien] = useState('');

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const [hocKyOptions, setHocKyOptions] = useState([]);
    const [giangVienOptions, setGiangVienOptions] = useState([]);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    // Form instance
    const [form] = Form.useForm();

    const [sinhVienOptions, setSinhVienOptions] = useState([]);
    const [lichGdOptions, setLichGdOptions] = useState([]);  // State danh sách giảng dạy

    useEffect(() => {
        // Load danh sách sinh viên
        const fetchStudents = async () => {
            try {
                const res = await studentService.getAllStudentsNoPagination();
                setSinhVienOptions(res || []);
            } catch (error) {
                message.error('Không thể tải danh sách sinh viên');
            }
        };

        // Load danh sách giảng dạy
        const fetchLichGd = async () => {
            try {
                const res = await LichGdService.getAllLichGdNoPaging();
                setLichGdOptions(res || []);
            } catch (error) {
                message.error('Không thể tải danh sách giảng dạy');
            }
        };
        fetchLichGd();
        fetchStudents();
    }, []);

    // Lấy dữ liệu lịch học từ API
    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const res = await lichHocService.getAllLichHoc();
            const all = res || [];
            setFullData(all);

            // Lấy danh sách học kỳ và giảng viên duy nhất để lọc
            const hocKySet = new Set(all.map((item) => item.hocKy));
            const gvSet = new Set(all.map((item) => item.tenGv));

            setHocKyOptions([...hocKySet].filter(Boolean));
            setGiangVienOptions([...gvSet].filter(Boolean));

            setFilteredData(all);
            setPagination((prev) => ({
                ...prev,
                total: all.length,
                current: 1,
            }));
            setDisplayData(all.slice(0, pagination.pageSize));
        } catch (error) {
            message.error('Lỗi khi tải danh sách lịch học');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    // Lọc dữ liệu khi thay đổi tìm kiếm hoặc bộ lọc
    useEffect(() => {
        const search = searchText.trim().toLowerCase();
        const filtered = fullData.filter((item) => {
            const matchSearch =
                item.maSv?.toLowerCase().includes(search) ||
                item.tenSv?.toLowerCase().includes(search) ||
                item.maMh?.toLowerCase().includes(search) ||
                item.tenMh?.toLowerCase().includes(search);

            const matchHocKy = selectedHocKy ? item.hocKy === selectedHocKy : true;
            const matchGiangVien = selectedGiangVien
                ? item.tenGv === selectedGiangVien
                : true;

            return matchSearch && matchHocKy && matchGiangVien;
        });

        setFilteredData(filtered);
        setPagination((prev) => ({
            ...prev,
            current: 1,
            total: filtered.length,
        }));
        setDisplayData(filtered.slice(0, pagination.pageSize));
    }, [searchText, selectedHocKy, selectedGiangVien, fullData]);

    // Xử lý phân trang
    const handleTableChange = (paginationInfo) => {
        const { current, pageSize } = paginationInfo;
        const startIdx = (current - 1) * pageSize;
        const endIdx = startIdx + pageSize;

        setPagination({
            ...paginationInfo,
            total: filteredData.length,
        });
        setDisplayData(filteredData.slice(startIdx, endIdx));
    };

    // Mở modal thêm mới
    const openAddModal = () => {
        setEditingRecord(null);
        form.resetFields();
        setModalVisible(true);
    };

    // Mở modal chỉnh sửa
    const openEditModal = (record) => {
        setEditingRecord(record);
        form.setFieldsValue({
            ...record,
            ngayBd: moment(record.ngayBd),
            ngayKt: moment(record.ngayKt),
        });
        setModalVisible(true);
    };

    // Xử lý lưu thêm/sửa
    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();

            const payload = {
                ...values,

            };

            setModalLoading(true);
            if (editingRecord) {
                // Update
                await lichHocService.updateLichHoc(
                    editingRecord.maSv,
                    editingRecord.maGd,
                    payload
                );
                message.success('Cập nhật lịch học thành công');
            } else {
                message.success('Thêm lịch học thành công');
            }

            setModalVisible(false);
            fetchSchedules();
        } catch (error) {
            if (error.errorFields) {
                // Validation error, không hiện thông báo lỗi
                return;
            }
            message.error('Lỗi khi lưu lịch học');
            console.error(error);
        } finally {
            setModalLoading(false);
        }
    };

    // Xóa bản ghi
    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc muốn xóa lịch học của sinh viên ${record.tenSv} - môn ${record.tenMh}?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    setLoading(true);
                    await lichHocService.deleteLichHoc(record.maSv, record.maGd);
                    message.success('Xóa lịch học thành công');
                    fetchSchedules();
                } catch (error) {
                    message.error('Lỗi khi xóa lịch học');
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    // Định nghĩa cột bảng
    const columns = [
        { title: 'Mã SV', dataIndex: 'maSv', width: 100 },
        { title: 'Họ và tên', dataIndex: 'tenSv', width: 180 },
        { title: 'Mã MH', dataIndex: 'maMh', width: 100 },
        { title: 'Tên môn học', dataIndex: 'tenMh', width: 180 },
        { title: 'Giảng viên', dataIndex: 'tenGv', width: 150 },
        { title: 'Phòng học', dataIndex: 'phongHoc', width: 100 },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'ngayBd',
            width: 120,
            render: (date) => moment(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'ngayKt',
            width: 120,
            render: (date) => moment(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Tiết học',
            width: 100,
            render: (_, record) => `${record.stBd} - ${record.stKt}`,
        },
        { title: 'Học kỳ', dataIndex: 'hocKy', width: 80 },
        {
            title: 'Hành động',
            width: 120,
            render: (_, record) => (
                <div className="flex gap-2">
                    {/* <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} /> */}
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)} />
                </div>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-2xl font-semibold">Danh sách Lịch học</h2>
                <div className="flex flex-wrap gap-2">
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="Tìm kiếm SV, môn học..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 240 }}
                        allowClear
                    />
                    <Select
                        placeholder="Chọn học kỳ"
                        value={selectedHocKy || undefined}
                        onChange={setSelectedHocKy}
                        allowClear
                        style={{ width: 150 }}
                    >
                        {hocKyOptions.map((hk) => (
                            <Option key={hk} value={hk}>
                                {hk}
                            </Option>
                        ))}
                    </Select>
                    <Select
                        placeholder="Chọn giảng viên"
                        value={selectedGiangVien || undefined}
                        onChange={setSelectedGiangVien}
                        allowClear
                        style={{ width: 180 }}
                        showSearch
                        optionFilterProp="children"
                    >
                        {giangVienOptions.map((gv) => (
                            <Option key={gv} value={gv}>
                                {gv}
                            </Option>
                        ))}
                    </Select>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
                        Thêm mới
                    </Button>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={displayData}
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                rowKey={(record) => `${record.maSv}-${record.maGd}`}
                scroll={{ x: 1200 }}
            />

            <Modal
                title={editingRecord ? 'Chỉnh sửa Lịch học' : 'Thêm mới Lịch học'}
                visible={modalVisible}
                onOk={handleModalOk}
                confirmLoading={modalLoading}
                onCancel={() => setModalVisible(false)}
                destroyOnClose
                width={700}
            >
                <Form form={form} layout="vertical" preserve={false}>
                    <Form.Item
                        label="Sinh viên"
                        name="maSv"
                        rules={[{ required: true, message: 'Vui lòng chọn sinh viên' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Chọn sinh viên"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option?.children?.toLowerCase().includes(input.toLowerCase())
                            }
                            disabled={!!editingRecord} // Khóa không cho đổi sinh viên khi chỉnh sửa
                        >
                            {sinhVienOptions.map((sv) => (
                                <Option key={sv.maSv} value={sv.maSv}>
                                    {`${sv.maSv} - ${sv.tenSv}`}
                                </Option>
                            ))}

                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Mã giảng dạy"
                        name="maGd"
                        rules={[{ required: true, message: 'Vui lòng chọn mã giảng dạy' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Chọn mã giảng dạy"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option?.children?.toLowerCase().includes(input.toLowerCase())
                            }
                            disabled={!!editingRecord} // Khóa không cho đổi khi chỉnh sửa
                        >
                            {lichGdOptions.map((item) => (
                                <Option key={item.id} value={item.id}>
                                    {item.maMh} - {item.tenMh} | GV: {item.tenGv} ({item.maGv})
                                </Option>
                            ))}

                        </Select>
                    </Form.Item>


                </Form>
            </Modal>
        </div>
    );
};
