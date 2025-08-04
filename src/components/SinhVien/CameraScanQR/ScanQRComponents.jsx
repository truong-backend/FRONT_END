import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { message, Button, Card, Modal, Spin, Alert, Typography, Space } from 'antd';
import { CameraOutlined, ReloadOutlined, QrcodeOutlined } from '@ant-design/icons';
import { ScanQRService } from '../../../services/SinhVien/CameraScanQR/ScanQRService.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';

const { Title, Text } = Typography;

// ===== Configuration =====
const MODAL_WIDTH = 400;

// ===== Utility Functions =====
const parseQRData = (qrString) => {
  try {
    return JSON.parse(qrString);
  } catch {
    throw new Error('QR code không hợp lệ');
  }
};

// ===== UI Components =====
const Header = () => (
  <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
    <QrcodeOutlined style={{ fontSize: '24px' }} />
    <Title level={3} style={{ margin: 0 }}>
      Điểm danh bằng QR Code
    </Title>
  </div>
);

const ActionButtons = ({ isScanning, isLoading, onStart, onStop }) => (
  <Space>
    <Button
      type="primary"
      icon={<CameraOutlined />}
      onClick={onStart}
      disabled={isScanning || isLoading}
      size="large"
    >
      {isScanning ? 'Đang scan...' : 'Bắt đầu scan QR'}
    </Button>

    {isScanning && (
      <Button
        icon={<ReloadOutlined />}
        onClick={onStop}
        size="large"
      >
        Dừng scan
      </Button>
    )}
  </Space>
);

const LoadingIndicator = () => (
  <div style={{ textAlign: 'center', marginTop: 16 }}>
    <Spin />
    <p>Đang xử lý điểm danh...</p>
  </div>
);

const ErrorAlert = ({ error }) => {
  if (!error) return null;
  return (
    <Alert
      message="Lỗi"
      description={error}
      type="error"
      showIcon
      style={{ marginTop: '16px' }}
    />
  );
};

const QRScannerModal = ({ visible, onCancel, onScan }) => (
  <Modal
    title="Scan QR Code"
    open={visible}
    onCancel={onCancel}
    footer={null}
    width={MODAL_WIDTH}
  >
    <div style={{ textAlign: 'center' }}>
      <Scanner
        onScan={onScan}
        constraints={{
          video: { facingMode: 'environment' }
        }}
        components={{
          audio: false,
          finder: true
        }}
      />
      <Text type="secondary">Đưa QR code vào khung để scan</Text>
    </div>
  </Modal>
);

// ===== Main Component =====
export const ScanQRComponents = () => {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState(null);

  const maSv = user?.maSv || user?.id || user?.username;

  // Handlers
  const startScanning = () => {
    setError(null);
    setShowScanner(true);
    setIsScanning(true);
  };

  const stopScanning = () => {
    setShowScanner(false);
    setIsScanning(false);
  };

  const handleScan = async (result) => {
    if (result && result.length > 0) {
      const qrData = result[0].rawValue;
      stopScanning();
      await processAttendance(qrData);
    }
  };

  const processAttendance = async (qrData) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsedData = parseQRData(qrData);
      const { id: qrId } = parsedData;

      await ScanQRService.markAttendanceByQR({ qrId, maSv });
      message.success('Điểm danh thành công!');
    } catch (err) {
      console.error('Lỗi điểm danh:', err);
      setError(err.message || 'Điểm danh thất bại');
      message.error(err.message || 'Điểm danh thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Header />
        <ActionButtons
          isScanning={isScanning}
          isLoading={isLoading}
          onStart={startScanning}
          onStop={stopScanning}
        />
        {isLoading && <LoadingIndicator />}
        <ErrorAlert error={error} />
      </Card>

      <QRScannerModal
        visible={showScanner}
        onCancel={stopScanning}
        onScan={handleScan}
      />
    </div>
  );
};
