import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    Space,
} from 'antd';
import {
    SearchOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { useAuth } from '../../../contexts/AuthContext.jsx';

// Services
import { lichGDService } from '../../../services/GiaoVien/LichGD/lichGDService.js';
import { ThoiKhoaBieuService } from '../../../services/GiaoVien/ThoiKhoaBieu/ThoiKhoaBieuService.js';

const { Option } = Select;

export const ThoiKhoaBieuComponent = () => {

    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();

    const handleAddTKB = () => {
        setVisible(true);
    };


    const [availableStudents, setAvailableStudents] = useState([]);
    const [currentMaGd, setCurrentMaGd] = useState(null);
    const [enrolledStudentSearchText, setEnrolledStudentSearchText] = useState('');

    const [data, setData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);


    // Loading state cho việc tạo TKB
    const [creatingTkb, setCreatingTkb] = useState(false);

    // State cho danh sách TKB trong modal detail
    const [tkbList, setTkbList] = useState([]);
    const [loadingTkb, setLoadingTkb] = useState(false);

    const { user } = useAuth();

    const maGv = user.maGv || user.username || user.id;

    const fetchLichGdList = useCallback(async (maGv) => {
        setLoading(true);
        try {
            const result = await lichGDService.LayLichGiangDayGiangVien(maGv);
            setData(result);
            setOriginalData(result);
        } catch (error) {
            message.error(`Lỗi khi tải danh sách lịch giảng dạy: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTkbByMaGd = useCallback(async (maGd) => {
        setLoadingTkb(true);
        try {
            const result = await ThoiKhoaBieuService.LayTkbTheoMaGd(maGd);
            setTkbList(result);
        } catch {
            setTkbList([]);
        } finally {
            setLoadingTkb(false);
        }
    }, []);


    const createTkb = async (maGd, thu) => {
        setCreatingTkb(true);
        try {
            const result = await ThoiKhoaBieuService.TaoThoiKhoaBieu(maGd, thu);
            return result;
        } catch (error) {
            message.error(`Lỗi khi tạo thời khóa biểu: ${error.message}`);
            return null;
        } finally {
            setCreatingTkb(false);
        }
    };


    // Initialize data
    useEffect(() => {
        Promise.all([
            fetchLichGdList(maGv),
        ]);
    }, [fetchLichGdList, maGv]);



    // Filter TKB list based on search
    const filteredTkbList = useMemo(() => {
        if (!enrolledStudentSearchText) return tkbList;
        return tkbList.filter(tkb => {
            const search = enrolledStudentSearchText.toLowerCase();
            return (
                tkb.phongHoc?.toLowerCase().includes(search) ||
                moment(tkb.ngayHoc).format('DD/MM/YYYY').includes(search) ||
                tkb.stBd?.toString().includes(search) ||
                tkb.stKt?.toString().includes(search)
            );
        });
    }, [enrolledStudentSearchText, tkbList]);

    // Search functionality
    const handleSearch = useCallback((e) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);

        if (value === '') {
            setData(originalData);
        } else {
            const filtered = originalData.filter(
                (item) =>
                    item.tenGv?.toLowerCase().includes(value) ||
                    item.tenMh?.toLowerCase().includes(value)
            );
            setData(filtered);
        }
    }, [originalData]);

    const closeAddStudentModal = () => {
        setAddStudentModalVisible(false);
        setSelectedStudentsToAdd([]);
        setAvailableStudents([]);
    };

    const handleViewDetail = useCallback(async (record) => {
        setSelectedRecord(record);
        setCurrentMaGd(record.id);
        // Fetch danh sách TKB theo maGd
        await fetchTkbByMaGd(record.id);
        setDetailModalVisible(true);
    }, [fetchTkbByMaGd]);

    // Xử lý tạo thời khóa biểu
    const handleCreateTkb = async (values) => {
        try {
            const { thu } = values;

            if (!currentMaGd) {
                message.error('Không tìm thấy thông tin lịch giảng dạy');
                return;
            }

            const result = await createTkb(currentMaGd, thu);

            message.success(`Đã tạo thành công ${result.length} buổi học cho thứ ${thu}`);
            setVisible(false);
            form.resetFields();

            // Refresh danh sách TKB trong modal detail
            await fetchTkbByMaGd(currentMaGd);

        } catch (error) {
            message.error(`Lỗi khi tạo thời khóa biểu: ${error.message}`);
        }
    };

    // Table columns cho danh sách lịch giảng dạy
    const columns = useMemo(() => [
        {
            title: 'STT',
            key: 'stt',
            width: 60,
            render: (_, record, index) => index + 1,
        },
        {
            title: 'Mã MH',
            dataIndex: 'maMh',
            key: 'maMh',
            width: 100,
        },
        {
            title: 'Tên MH',
            dataIndex: 'tenMh',
            key: 'tenMh',
            width: 150,
        },
        {
            title: 'Nhóm MH',
            dataIndex: 'nmh',
            key: 'nmh',
            width: 150,
        },
        {
            title: 'Phòng học',
            dataIndex: 'phongHoc',
            key: 'phongHoc',
            width: 100,
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'ngayBd',
            key: 'ngayBd',
            width: 120,
            render: (text) => moment(text).format('DD/MM/YYYY'),
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'ngayKt',
            key: 'ngayKt',
            width: 120,
            render: (text) => moment(text).format('DD/MM/YYYY'),
        },
        {
            title: 'Tiết bắt đầu',
            dataIndex: 'stBd',
            key: 'stBd',
            width: 90,
        },
        {
            title: 'Tiết kết thúc',
            dataIndex: 'stKt',
            key: 'stKt',
            width: 90,
        },
        {
            title: 'Học kỳ',
            dataIndex: 'hocKy',
            key: 'hocKy',
            width: 80,
            render: (text) => `Học kỳ ${text}`,
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 180,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="default"
                        size="small"
                        onClick={() => handleViewDetail(record)}
                    >
                        Chi tiết
                    </Button>
                </Space>
            ),
        },
    ], [handleViewDetail]);

    // Columns cho bảng thời khóa biểu trong modal detail
    const tkbColumns = useMemo(() => [
        {
            title: 'STT',
            key: 'stt',
            width: 60,
            render: (_, record, index) => index + 1,
        },
        {
            title: 'Ngày học',
            dataIndex: 'ngayHoc',
            key: 'ngayHoc',
            render: (text) => moment(text).format('DD/MM/YYYY'),
        },
        {
            title: 'Thứ',
            dataIndex: 'ngayHoc',
            key: 'thu',
            render: (text) => {
                const dayOfWeek = moment(text).day();
                const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
                return days[dayOfWeek];
            },
        },
        {
            title: 'Phòng học',
            dataIndex: 'phongHoc',
            key: 'phongHoc',
        },
        {
            title: 'Tiết bắt đầu',
            dataIndex: 'stBd',
            key: 'stBd',
        },
        {
            title: 'Tiết kết thúc',
            dataIndex: 'stKt',
            key: 'stKt',
        },
        // {
        //     title: 'Thao tác',
        //     key: 'actions',
        //     render: (_, record) => (
        //         <Button
        //             danger
        //             size="small"
        //             onClick={() => {
        //                 // Có thể thêm logic xóa TKB nếu cần
        //                 message.info('Chức năng xóa sẽ được phát triển sau');
        //             }}
        //         >
        //             Xóa
        //         </Button>
        //     ),
        // },
    ], []);





    return (
        <div>
            <h2>DANH SÁCH THỜI KHÓA BIỂU</h2>

            <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
                <Input
                    placeholder="Tìm kiếm theo tên GV hoặc tên MH"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={handleSearch}
                    style={{ width: 300 }}
                    allowClear
                />
            </div>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={data}
                loading={loading}
                scroll={{ x: 1400 }}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
                }}
            />

            {/* Modal Thêm thời khóa biểu */}
            <Modal
                title="Thêm thời khóa biểu"
                open={visible}
                onCancel={() => setVisible(false)}
                onOk={() => {
                    form
                        .validateFields()
                        .then(values => {
                            handleCreateTkb(values);
                        })
                        .catch(err => {
                            console.error('❌ Lỗi validate:', err);
                        });
                }}
                okText="Tạo thời khóa biểu"
                cancelText="Hủy"
                confirmLoading={creatingTkb}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="thu"
                        label="Chọn thứ"
                        rules={[{ required: true, message: 'Vui lòng chọn thứ' }]}
                    >
                        <Select placeholder="Chọn thứ" style={{ width: '100%' }}>
                            <Option value={1}>Thứ Hai</Option>
                            <Option value={2}>Thứ Ba</Option>
                            <Option value={3}>Thứ Tư</Option>
                            <Option value={4}>Thứ Năm</Option>
                            <Option value={5}>Thứ Sáu</Option>
                            <Option value={6}>Thứ Bảy</Option>
                            <Option value={7}>Chủ Nhật</Option>
                        </Select>
                    </Form.Item>

                    {selectedRecord && (
                        <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '6px', marginTop: '16px' }}>
                            <h4>Thông tin lịch giảng dạy:</h4>
                            <p><strong>Môn học:</strong> {selectedRecord.tenMh} ({selectedRecord.maMh})</p>
                            <p><strong>Phòng học:</strong> {selectedRecord.phongHoc}</p>
                            <p><strong>Thời gian:</strong> {moment(selectedRecord.ngayBd).format('DD/MM/YYYY')} - {moment(selectedRecord.ngayKt).format('DD/MM/YYYY')}</p>
                            <p><strong>Tiết:</strong> {selectedRecord.stBd} - {selectedRecord.stKt}</p>
                        </div>
                    )}
                </Form>
            </Modal>

            {/* Detail Modal */}
            <Modal
                // title="Chi tiết thời khóa biểu"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>,
                    <Button key="add" type="primary" onClick={handleAddTKB}>
                        Thêm thời khóa biểu
                    </Button>,
                ]}
                width={1000}
            >
                {selectedRecord && (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 48 }}>

                                <div style={{ textAlign: 'left' }}>
                                    {/* <p><strong>Giáo viên:</strong> {selectedRecord.tenGv}</p>
                                    <p><strong>Môn học:</strong> {selectedRecord.tenMh} ({selectedRecord.maMh})</p> */}
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    {/* <p><strong>Phòng học:</strong> {selectedRecord.phongHoc}</p>
                                    <p><strong>Thời gian:</strong> {moment(selectedRecord.ngayBd).format('DD/MM/YYYY')} - {moment(selectedRecord.ngayKt).format('DD/MM/YYYY')}</p> */}
                                </div>
                                {/* <div style={{ textAlign: 'left' }}>
                                    <p><strong>Tiết học:</strong> {selectedRecord.stBd} - {selectedRecord.stKt}</p>
                                    <p><strong>Học kỳ:</strong> {selectedRecord.hocKy}</p>
                                </div> */}
                            </div>
                        </div>

                        <div>
                            <h3>Danh sách thời khóa biểu</h3>
                            <Input
                                placeholder="Tìm kiếm theo phòng học, ngày học, tiết học"
                                prefix={<SearchOutlined />}
                                allowClear
                                value={enrolledStudentSearchText}
                                onChange={(e) => setEnrolledStudentSearchText(e.target.value)}
                                style={{ width: 400, marginBottom: 12 }}
                            />

                            <Table
                                rowKey="id"
                                columns={tkbColumns}
                                dataSource={filteredTkbList}
                                loading={loadingTkb}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} buổi học`,
                                }}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};