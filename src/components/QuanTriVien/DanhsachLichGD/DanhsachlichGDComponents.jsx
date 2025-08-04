import React, { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
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
  Card,
  Row,
  Col,
  Divider,
  Typography,
  Tag,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import moment from 'moment';

// Các dịch vụ
import { LichGdService } from '../../../services/Admin/LichGdService';
import { monHocService } from '../../../services/Admin/monHocService.js';
import { teacherService } from '../../../services/Admin/teacherService.js';

const { Option } = Select;
const { Title } = Typography;

// Các hằng số
const TUY_CHON_HOC_KY = [
  { value: 1, label: 'Học kỳ 1', color: 'blue' },
  { value: 2, label: 'Học kỳ 2', color: 'green' },
  { value: 3, label: 'Học kỳ 3', color: 'orange' },
];

const KHOANG_TIET_HOC = { min: 1, max: 20 };

// Component Form cho Thêm/Sửa
const FormLichGiangDay = forwardRef(({ 
  hienThi, 
  dongForm, 
  luuDuLieu, 
  banGhiDangSua, 
  danhSachMonHoc, 
  danhSachGiaoVien 
}, ref) => {
  const [form] = Form.useForm();
  const [dangTai, setDangTai] = useState(false);

  useImperativeHandle(ref, () => ({
    resetFields: () => form.resetFields(),
    setFieldsValue: (giaTriCacTruong) => form.setFieldsValue(giaTriCacTruong),
    validateFields: () => form.validateFields(),
  }));

  useEffect(() => {
    if (hienThi && banGhiDangSua) {
      form.setFieldsValue({
        ...banGhiDangSua,
        ngayBd: moment(banGhiDangSua.ngayBd),
        ngayKt: moment(banGhiDangSua.ngayKt),
      });
    } else if (hienThi && !banGhiDangSua) {
      form.resetFields();
    }
  }, [hienThi, banGhiDangSua, form]);

  const xuLyThayDoiMonHoc = useCallback((giaTri) => {
    const monHocDuocChon = danhSachMonHoc.find((mh) => mh.maMh === giaTri);
    if (monHocDuocChon) {
      form.setFieldsValue({
        tenMh: monHocDuocChon.tenMh,
        nmh: monHocDuocChon.soTiet || form.getFieldValue('nmh'),
      });
    }
  }, [danhSachMonHoc, form]);

  const xuLyThayDoiGiaoVien = useCallback((giaTri) => {
    const giaoVienDuocChon = danhSachGiaoVien.find((gv) => gv.maGv === giaTri);
    if (giaoVienDuocChon) {
      form.setFieldsValue({ tenGv: giaoVienDuocChon.tenGv });
    }
  }, [danhSachGiaoVien, form]);

  const xuLyLuu = async () => {
    try {
      setDangTai(true);
      const giaTriForm = await form.validateFields();
      const giaTriDaFormat = {
        ...giaTriForm,
        ngayBd: giaTriForm.ngayBd.format('YYYY-MM-DD'),
        ngayKt: giaTriForm.ngayKt.format('YYYY-MM-DD'),
      };
      await luuDuLieu(giaTriDaFormat);
    } catch (loi) {
      console.error('Xác thực form thất bại:', loi);
    } finally {
      setDangTai(false);
    }
  };

  const tuyChonGiaoVien = useMemo(() =>
    danhSachGiaoVien.map(giaoVien => (
      <Option key={giaoVien.maGv} value={giaoVien.maGv}>
        {giaoVien.maGv} - {giaoVien.tenGv}
      </Option>
    )), [danhSachGiaoVien]
  );

  const tuyChonMonHoc = useMemo(() =>
    danhSachMonHoc.map(mh => (
      <Option key={mh.maMh} value={mh.maMh}>
        {mh.maMh} - {mh.tenMh}
      </Option>
    )), [danhSachMonHoc]
  );

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarOutlined />
          {banGhiDangSua ? 'Sửa lịch Giảng dạy' : 'Thêm lịch Giảng dạy'}
        </div>
      }
      open={hienThi}
      onOk={xuLyLuu}
      onCancel={dongForm}
      okText="Lưu"
      cancelText="Hủy"
      width={800}
      confirmLoading={dangTai}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ hocKy: 1, nmh: 1, stBd: 1, stKt: 2 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <UserOutlined />
                  Giáo viên
                </div>
              }
              name="maGv"
              rules={[{ required: true, message: 'Vui lòng chọn giáo viên' }]}
            >
              <Select
                placeholder="Chọn giáo viên"
                onChange={xuLyThayDoiGiaoVien}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {tuyChonGiaoVien}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BookOutlined />
                  Môn học
                </div>
              }
              name="maMh"
              rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
            >
              <Select
                placeholder="Chọn môn học"
                onChange={xuLyThayDoiMonHoc}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {tuyChonMonHoc}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Nhóm môn học"
              name="nmh"
              rules={[
                { required: true, message: 'Vui lòng nhập nhóm môn học' },
                { type: 'number', min: 1, message: 'Nhóm môn học phải lớn hơn 0' }
              ]}
            >
              <InputNumber
                min={1}
                placeholder="Nhập nhóm môn học"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Phòng học"
              name="phongHoc"
              rules={[{ required: true, message: 'Vui lòng nhập phòng học' }]}
            >
              <Input placeholder="Nhập phòng học" />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Thời gian học</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Ngày bắt đầu"
              name="ngayBd"
              rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Ngày kết thúc"
              name="ngayKt"
              rules={[
                { required: true, message: 'Vui lòng chọn ngày kết thúc' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('ngayBd') || value.isAfter(getFieldValue('ngayBd'))) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
                  },
                }),
              ]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ClockCircleOutlined />
                  Tiết bắt đầu
                </div>
              }
              name="stBd"
              rules={[
                { required: true, message: 'Vui lòng nhập tiết bắt đầu' },
                {
                  type: 'number',
                  min: KHOANG_TIET_HOC.min,
                  max: KHOANG_TIET_HOC.max,
                  message: `Tiết bắt đầu từ ${KHOANG_TIET_HOC.min}-${KHOANG_TIET_HOC.max}`
                },
              ]}
            >
              <InputNumber
                min={KHOANG_TIET_HOC.min}
                max={KHOANG_TIET_HOC.max}
                placeholder="Tiết bắt đầu"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Tiết kết thúc"
              name="stKt"
              rules={[
                { required: true, message: 'Vui lòng nhập tiết kết thúc' },
                {
                  type: 'number',
                  min: KHOANG_TIET_HOC.min,
                  max: KHOANG_TIET_HOC.max,
                  message: `Tiết kết thúc từ ${KHOANG_TIET_HOC.min}-${KHOANG_TIET_HOC.max}`
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('stBd') < value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Tiết kết thúc phải sau tiết bắt đầu'));
                  },
                }),
              ]}
            >
              <InputNumber
                min={KHOANG_TIET_HOC.min}
                max={KHOANG_TIET_HOC.max}
                placeholder="Tiết kết thúc"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Học kỳ"
              name="hocKy"
              rules={[{ required: true, message: 'Vui lòng chọn học kỳ' }]}
            >
              <Select>
                {TUY_CHON_HOC_KY.map(tuyChon => (
                  <Option key={tuyChon.value} value={tuyChon.value}>
                    {tuyChon.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
});

// Component chính
export const DanhsachlichGDComponents = ({ 
  thayDoiDuLieu, 
  duLieuBanDau, 
  chiDoc = false,
  hienThiHanhDong = true,
  cotTuyChon = [],
  chonBanGhi,
  loaiLuaChon = 'checkbox'
}) => {
  // Quản lý state
  const refForm = React.useRef();
  const [duLieu, setDuLieu] = useState(duLieuBanDau || []);
  const [duLieuGoc, setDuLieuGoc] = useState(duLieuBanDau || []);
  const [dangTai, setDangTai] = useState(false);
  const [textTimKiem, setTextTimKiem] = useState('');
  const [hienThiModal, setHienThiModal] = useState(false);
  const [banGhiDangSua, setBanGhiDangSua] = useState(null);
  const [danhSachMonHoc, setDanhSachMonHoc] = useState([]);
  const [danhSachGiaoVien, setDanhSachGiaoVien] = useState([]);
  const [cacKeyDaChon, setCacKeyDaChon] = useState([]);
  const [locHocKy, setLocHocKy] = useState(null);

  // Các hàm fetch dữ liệu
  const layDanhSachLichGiangDay = useCallback(async () => {
    if (duLieuBanDau) return;
    
    setDangTai(true);
    try {
      const ketQua = await LichGdService.getAllLichGdNoPaging();
      setDuLieu(ketQua);
      setDuLieuGoc(ketQua);
      thayDoiDuLieu?.(ketQua);
    } catch (loi) {
      message.error(`Lỗi khi tải danh sách lịch giảng dạy: ${loi.message}`);
    } finally {
      setDangTai(false);
    }
  }, [duLieuBanDau, thayDoiDuLieu]);

  const layDanhSachMonHoc = useCallback(async () => {
    try {
      const response = await monHocService.getAllMonHocs();
      setDanhSachMonHoc(response || []);
    } catch (loi) {
      message.error(`Lỗi khi tải danh sách môn học: ${loi.message}`);
    }
  }, []);

  const layDanhSachGiaoVien = useCallback(async () => {
    try {
      const response = await teacherService.getListGiaoVien();
      setDanhSachGiaoVien(response || []);
    } catch (loi) {
      message.error(`Lỗi khi tải danh sách giáo viên: ${loi.message}`);
    }
  }, []);

  // Khởi tạo dữ liệu
  useEffect(() => {
    Promise.all([
      layDanhSachLichGiangDay(),
      layDanhSachMonHoc(),
      layDanhSachGiaoVien(),
    ]);
  }, [layDanhSachLichGiangDay, layDanhSachMonHoc, layDanhSachGiaoVien]);

  // Cập nhật dữ liệu khi duLieuBanDau thay đổi
  useEffect(() => {
    if (duLieuBanDau) {
      setDuLieu(duLieuBanDau);
      setDuLieuGoc(duLieuBanDau);
    }
  }, [duLieuBanDau]);

  // Chức năng tìm kiếm và lọc
  const duLieuDaLoc = useMemo(() => {
    let daLoc = duLieuGoc;

    // Áp dụng bộ lọc tìm kiếm
    if (textTimKiem) {
      daLoc = daLoc.filter(
        (item) =>
          item.tenGv?.toLowerCase().includes(textTimKiem.toLowerCase()) ||
          item.tenMh?.toLowerCase().includes(textTimKiem.toLowerCase()) ||
          item.phongHoc?.toLowerCase().includes(textTimKiem.toLowerCase())
      );
    }

    // Áp dụng bộ lọc học kỳ
    if (locHocKy) {
      daLoc = daLoc.filter(item => item.hocKy === locHocKy);
    }

    return daLoc;
  }, [duLieuGoc, textTimKiem, locHocKy]);

  useEffect(() => {
    setDuLieu(duLieuDaLoc);
  }, [duLieuDaLoc]);

  const xuLyTimKiem = useCallback((e) => {
    setTextTimKiem(e.target.value);
  }, []);

  // Xử lý modal
  const moModal = useCallback((banGhi = null) => {
    if (chiDoc) return;
    setBanGhiDangSua(banGhi);
    setHienThiModal(true);
  }, [chiDoc]);

  const dongModal = useCallback(() => {
    setHienThiModal(false);
    setBanGhiDangSua(null);
  }, []);

  // Các thao tác CRUD
  const xuLyLuu = useCallback(async (duLieuForm) => {
    try {
      let ketQua;
      if (banGhiDangSua) {
        ketQua = await LichGdService.updateLichGd(banGhiDangSua.id, duLieuForm);
        message.success('✅ Cập nhật thành công');
      } else {
        ketQua = await LichGdService.createLichGd(duLieuForm);
        message.success('✅ Tạo mới thành công');
      }

      dongModal();
      await layDanhSachLichGiangDay();
    } catch (loi) {
      const thongBaoLoi = loi.response?.data || loi.message || 'Đã xảy ra lỗi';
      message.error(`❌ ${thongBaoLoi}`);
      throw loi;
    }
  }, [banGhiDangSua, dongModal, layDanhSachLichGiangDay]);

  const xuLyXoa = useCallback(async (id) => {
    if (chiDoc) return;
    
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa lịch giảng dạy này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await LichGdService.deleteLichGd(id);
          message.success('✅ Xóa lịch giảng dạy thành công!');
          layDanhSachLichGiangDay();
        } catch (loi) {
          const thongBaoLoi = loi.response?.data || loi.message || 'Đã xảy ra lỗi khi xóa!';
          message.error(`❌ ${thongBaoLoi}`);
        }
      },
    });
  }, [chiDoc, layDanhSachLichGiangDay]);

  const xuLyXoaNhieu = useCallback(async () => {
    if (chiDoc || cacKeyDaChon.length === 0) return;

    Modal.confirm({
      title: 'Xác nhận xóa nhiều',
      content: `Bạn có chắc chắn muốn xóa ${cacKeyDaChon.length} lịch giảng dạy đã chọn?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await Promise.all(cacKeyDaChon.map(id => LichGdService.deleteLichGd(id)));
          message.success(`✅ Xóa ${cacKeyDaChon.length} lịch giảng dạy thành công!`);
          setCacKeyDaChon([]);
          layDanhSachLichGiangDay();
        } catch (loi) {
          message.error('❌ Có lỗi xảy ra khi xóa!');
        }
      },
    });
  }, [chiDoc, cacKeyDaChon, layDanhSachLichGiangDay]);

  // Lựa chọn hàng trong bảng
  const luaChonHang = chonBanGhi || hienThiHanhDong ? {
    type: loaiLuaChon,
    selectedRowKeys: cacKeyDaChon,
    onChange: (keys, rows) => {
      setCacKeyDaChon(keys);
      chonBanGhi?.(keys, rows);
    },
  } : null;

  // Các cột của bảng
  const cacCotMacDinh = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_, banGhi, chiSo) => chiSo + 1,
    },
    {
      title: 'Mã GV',
      dataIndex: 'maGv',
      key: 'maGv',
      width: 100,
      sorter: (a, b) => a.maGv.localeCompare(b.maGv),
    },
    {
      title: 'Tên GV',
      dataIndex: 'tenGv',
      key: 'tenGv',
      width: 150,
      sorter: (a, b) => a.tenGv.localeCompare(b.tenGv),
    },
    {
      title: 'Mã MH',
      dataIndex: 'maMh',
      key: 'maMh',
      width: 100,
      sorter: (a, b) => a.maMh.localeCompare(b.maMh),
    },
    {
      title: 'Tên MH',
      dataIndex: 'tenMh',
      key: 'tenMh',
      width: 150,
      sorter: (a, b) => a.tenMh.localeCompare(b.tenMh),
    },
    {
      title: 'Nhóm MH',
      dataIndex: 'nmh',
      key: 'nmh',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.nmh - b.nmh,
    },
    {
      title: 'Phòng học',
      dataIndex: 'phongHoc',
      key: 'phongHoc',
      width: 100,
      align: 'center',
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'ngayBd',
      key: 'ngayBd',
      width: 120,
      render: (text) => moment(text).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.ngayBd).unix() - moment(b.ngayBd).unix(),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'ngayKt',
      key: 'ngayKt',
      width: 120,
      render: (text) => moment(text).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.ngayKt).unix() - moment(b.ngayKt).unix(),
    },
    {
      title: 'Tiết',
      key: 'tiet',
      width: 100,
      align: 'center',
      render: (_, banGhi) => `${banGhi.stBd} - ${banGhi.stKt}`,
    },
    {
      title: 'Học kỳ',
      dataIndex: 'hocKy',
      key: 'hocKy',
      width: 100,
      align: 'center',
      render: (text) => {
        const hocKy = TUY_CHON_HOC_KY.find(s => s.value === text);
        return (
          <Tag color={hocKy?.color || 'default'}>
            {hocKy?.label || `Học kỳ ${text}`}
          </Tag>
        );
      },
      sorter: (a, b) => a.hocKy - b.hocKy,
    },
  ];

  const cotHanhDong = {
    title: 'Hành động',
    key: 'hanhDong',
    width: 120,
    fixed: 'right',
    render: (_, banGhi) => (
      <Space size="small">
        <Button
          icon={<EditOutlined />}
          type="primary"
          size="small"
          onClick={() => moModal(banGhi)}
          disabled={chiDoc}
        />
        <Button
          icon={<DeleteOutlined />}
          type="danger"
          size="small"
          onClick={() => xuLyXoa(banGhi.id)}
          disabled={chiDoc}
        />
      </Space>
    ),
  };

  const cacCot = [
    ...cacCotMacDinh,
    ...cotTuyChon,
    ...(hienThiHanhDong && !chiDoc ? [cotHanhDong] : [])
  ];

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Danh sách lịch giảng dạy
          </Title>
          
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Input
              placeholder="Tìm kiếm theo tên GV, MH, phòng học..."
              prefix={<SearchOutlined />}
              value={textTimKiem}
              onChange={xuLyTimKiem}
              style={{ width: 300 }}
              allowClear
            />
            
            <Select
              placeholder="Lọc theo học kỳ"
              value={locHocKy}
              onChange={setLocHocKy}
              allowClear
              style={{ width: 150 }}
            >
              {TUY_CHON_HOC_KY.map(tuyChon => (
                <Option key={tuyChon.value} value={tuyChon.value}>
                  {tuyChon.label}
                </Option>
              ))}
            </Select>

            {!chiDoc && (
              <>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => moModal()}
                >
                  Thêm lịch
                </Button>
                
                {cacKeyDaChon.length > 0 && (
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={xuLyXoaNhieu}
                  >
                    Xóa ({cacKeyDaChon.length})
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <Table
          rowKey="id"
          columns={cacCot}
          dataSource={duLieu}
          loading={dangTai}
          rowSelection={luaChonHang}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (tong, khoang) => `${khoang[0]}-${khoang[1]} của ${tong} bản ghi`,
          }}
          size="small"
        />
      </Card>

      {/* Modal Thêm/Sửa */}
      <FormLichGiangDay
        ref={refForm}
        hienThi={hienThiModal}
        dongForm={dongModal}
        luuDuLieu={xuLyLuu}
        banGhiDangSua={banGhiDangSua}
        danhSachMonHoc={danhSachMonHoc}
        danhSachGiaoVien={danhSachGiaoVien}
      />
    </div>
  );
};