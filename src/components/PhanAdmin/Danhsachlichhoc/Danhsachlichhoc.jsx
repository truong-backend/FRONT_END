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
    const [lichGdOptions, setLichGdOptions] = useState([]);

    useEffect(() => {
        // Load danh sách sinh viên
        const fetchStudents = async () => {
            try {
                const res = await studentService.getAllStudentsNoPagination();
                setSinhVienOptions(res || []);
            } catch (error) {
                message.error('Không thể tải danh sách sinh viên');
                console.error('Error fetching students:', error);
            }
        };

        // Load danh sách giảng dạy
        const fetchLichGd = async () => {
            try {
                const res = await LichGdService.getAllLichGdNoPaging();
                setLichGdOptions(res || []);
            } catch (error) {
                message.error('Không thể tải danh sách giảng dạy');
                console.error('Error fetching LichGd:', error);
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
            
            console.log('Fetched schedules:', all); // Debug log
            
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
            
            // Cập nhật displayData với pageSize hiện tại
            const currentPageSize = pagination.pageSize;
            setDisplayData(all.slice(0, currentPageSize));
        } catch (error) {
            message.error('Lỗi khi tải danh sách lịch học');
            console.error('Error fetching schedules:', error);
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

        console.log('Filtered data:', filtered); // Debug log

        setFilteredData(filtered);
        setPagination((prev) => ({
            ...prev,
            current: 1,
            total: filtered.length,
        }));
        setDisplayData(filtered.slice(0, pagination.pageSize));
    }, [searchText, selectedHocKy, selectedGiangVien, fullData, pagination.pageSize]);

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
        console.log('Editing record:', record); // Debug log
        setEditingRecord(record);
        
        // Set form values với format đúng
        const formValues = {
            maSv: record.maSv,
            maGd: record.maGd,
            // Chỉ set ngayBd và ngayKt nếu chúng tồn tại
            ...(record.ngayBd && { ngayBd: moment(record.ngayBd) }),
            ...(record.ngayKt && { ngayKt: moment(record.ngayKt) }),
        };
        
        form.setFieldsValue(formValues);
        setModalVisible(true);
    };

    // Xử lý lưu thêm/sửa
    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            console.log('Form values:', values); // Debug log

            // Chuẩn bị payload
            const payload = {
                maSv: values.maSv,
                maGd: values.maGd,
                // Format dates nếu có
                ...(values.ngayBd && { ngayBd: values.ngayBd.format('YYYY-MM-DD') }),
                ...(values.ngayKt && { ngayKt: values.ngayKt.format('YYYY-MM-DD') }),
            };

            console.log('Payload:', payload); // Debug log

            setModalLoading(true);
            
            if (editingRecord) {
                // Update - Sử dụng key từ record gốc
                console.log('Updating with keys:', editingRecord.maSv, editingRecord.maGd);
                await lichHocService.updateLichHoc(
                    editingRecord.maSv,
                    editingRecord.maGd,
                    payload
                );
                message.success('Cập nhật lịch học thành công');
            } else {
                // Create new - Cần implement API tạo mới
                await lichHocService.createLichHoc(payload);
                message.success('Thêm lịch học thành công');
            }

            setModalVisible(false);
            form.resetFields();
            await fetchSchedules(); // Reload data
            
        } catch (error) {
            if (error.errorFields) {
                // Validation error, không hiện thông báo lỗi
                return;
            }
            console.error('Error saving:', error);
            message.error(`Lỗi khi ${editingRecord ? 'cập nhật' : 'thêm'} lịch học: ${error.message || 'Unknown error'}`);
        } finally {
            setModalLoading(false);
        }
    };

    // Đóng modal
    const handleModalCancel = () => {
        setModalVisible(false);
        form.resetFields();
        setEditingRecord(null);
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
                    await fetchSchedules(); // Reload data
                } catch (error) {
                    message.error('Lỗi khi xóa lịch học');
                    console.error('Delete error:', error);
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    // Định nghĩa cột bảng
    const columns = [
        { 
            title: 'Mã SV', 
            dataIndex: 'maSv', 
            width: 100,
            fixed: 'left'
        },
        { 
            title: 'Họ và tên', 
            dataIndex: 'tenSv', 
            width: 180,
            fixed: 'left'
        },
        { title: 'Mã MH', dataIndex: 'maMh', width: 100 },
        { title: 'Tên môn học', dataIndex: 'tenMh', width: 180 },
        { title: 'Giảng viên', dataIndex: 'tenGv', width: 150 },
        { title: 'Phòng học', dataIndex: 'phongHoc', width: 100 },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'ngayBd',
            width: 120,
            render: (date) => date ? moment(date).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'ngayKt',
            width: 120,
            render: (date) => date ? moment(date).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Tiết học',
            width: 100,
            render: (_, record) => `${record.stBd || '-'} - ${record.stKt || '-'}`,
        },
        { title: 'Học kỳ', dataIndex: 'hocKy', width: 80 },
        {
            title: 'Hành động',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <div className="flex gap-2">
                    {/* <Button 
                        icon={<EditOutlined />} 
                        size="small"
                        onClick={() => openEditModal(record)} 
                    /> */}
                    <Button 
                        icon={<DeleteOutlined />} 
                        size="small"
                        danger 
                        onClick={() => handleDelete(record)} 
                    />
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
                scroll={{ x: 1400, y: 600 }}
                size="middle"
            />

            <Modal
                title={editingRecord ? 'Chỉnh sửa Lịch học' : 'Thêm mới Lịch học'}
                visible={modalVisible}
                onOk={handleModalOk}
                confirmLoading={modalLoading}
                onCancel={handleModalCancel}
                destroyOnClose
                width={700}
                maskClosable={false}
            >
                <Form 
                    form={form} 
                    layout="vertical" 
                    preserve={false}
                    initialValues={{}}
                >
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
                                    {`${item.maMh} - ${item.tenMh} | GV: ${item.tenGv} (${item.maGv})`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Thêm các trường khác nếu cần thiết */}
                    <Form.Item
                        label="Ngày bắt đầu"
                        name="ngayBd"
                    >
                        <DatePicker 
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày bắt đầu"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Ngày kết thúc"
                        name="ngayKt"
                    >
                        <DatePicker 
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày kết thúc"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};