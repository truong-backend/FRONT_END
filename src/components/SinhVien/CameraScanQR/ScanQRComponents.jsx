import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { message, Button, Card, Input, Modal, Spin, Alert } from 'antd';
import { CameraOutlined, ReloadOutlined, UserOutlined, QrcodeOutlined } from '@ant-design/icons';
import { ScanQRService } from '../../../services/SinhVien/CameraScanQR/ScanQRService.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';

export const ScanQRComponents = () => {
    const { user, isAuthenticated } = useAuth();
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [scannedData, setScannedData] = useState('');
    const [showScanner, setShowScanner] = useState(false);

    // Lấy mã sinh viên từ context
    const maSv = user?.maSv || user?.id || user?.username;

    useEffect(() => {
        if (!isAuthenticated) {
            message.error('Vui lòng đăng nhập để sử dụng chức năng này');
        }
    }, [isAuthenticated]);

    // Xử lý khi scan được QR code
    const handleScan = async (result) => {
        if (result && result.length > 0) {
            const qrData = result[0].rawValue;
            setScannedData(qrData);
            setShowScanner(false);
            
            await processAttendance(qrData);
        }
    };

    // Xử lý điểm danh
    const processAttendance = async (qrData) => {
        if (!maSv) {
            message.error('Không tìm thấy thông tin sinh viên');
            return;
        }

        setIsLoading(true);

        try {
            // Tách và kiểm tra dữ liệu QR
            let parsedData;
            try {
                parsedData = JSON.parse(qrData);
            } catch {
                message.error('QR Code không hợp lệ');
                return;
            }

            const { id: qrId } = parsedData;
            if (!qrId) {
                message.error('QR Code thiếu ID');
                return;
            }

            const requestData = {
                qrId,
                maSv
            };

            await ScanQRService.markAttendanceByQR(requestData);
            message.success('Điểm danh thành công!');

        } catch (error) {
            console.error('Lỗi điểm danh:', error);
            message.error(error.message || 'Điểm danh thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    // Bắt đầu scan
    const startScanning = () => {
        setShowScanner(true);
        setIsScanning(true);
        setScannedData('');
    };

    // Dừng scan
    const stopScanning = () => {
        setShowScanner(false);
        setIsScanning(false);
    };

    // Xử lý lỗi scanner
    const handleError = (error) => {
        console.error('Scanner error:', error);
        message.error('Lỗi camera: ' + error.message);
        setShowScanner(false);
        setIsScanning(false);
    };

    // Nhập QR code thủ công
    const handleManualInput = async () => {
        if (!scannedData.trim()) {
            message.warning('Vui lòng nhập mã QR');
            return;
        }
        await processAttendance(scannedData);
    };

    if (!isAuthenticated) {
        return (
            <Card className="max-w-md mx-auto mt-8">
                <Alert
                    message="Chưa đăng nhập"
                    description="Vui lòng đăng nhập để sử dụng chức năng điểm danh QR"
                    type="warning"
                    showIcon
                />
            </Card>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <Card 
                title={
                    <div className="flex items-center gap-2">
                        <QrcodeOutlined />
                        <span>Điểm danh bằng QR Code</span>
                    </div>
                }
                className="mb-4"
            >
                {/* Thông tin sinh viên */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <UserOutlined />
                        <span className="font-medium">Thông tin sinh viên:</span>
                    </div>
                    <p className="text-sm text-gray-600">
                        Mã SV: <span className="font-medium text-blue-600">{maSv}</span>
                    </p>
                </div>

                {/* Buttons điều khiển */}
                <div className="flex gap-3 mb-4">
                    <Button
                        type="primary"
                        icon={<CameraOutlined />}
                        onClick={startScanning}
                        disabled={isScanning || isLoading}
                        size="large"
                    >
                        {isScanning ? 'Đang scan...' : 'Bắt đầu scan QR'}
                    </Button>
                    
                    {isScanning && (
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={stopScanning}
                            size="large"
                        >
                            Dừng scan
                        </Button>
                    )}
                </div>

                {/* Nhập thủ công */}
                <div className="mb-4">
                    <Input.Search
                        placeholder="Hoặc nhập mã QR thủ công"
                        value={scannedData}
                        onChange={(e) => setScannedData(e.target.value)}
                        onSearch={handleManualInput}
                        enterButton="Điểm danh"
                        disabled={isLoading}
                        loading={isLoading}
                    />
                </div>

                {/* Loading spinner */}
                {isLoading && (
                    <div className="text-center py-4">
                        <Spin size="large" />
                        <p className="mt-2 text-gray-600">Đang xử lý điểm danh...</p>
                    </div>
                )}
            </Card>

            {/* Scanner Modal */}
            <Modal
                title="Scan QR Code"
                open={showScanner}
                onCancel={stopScanning}
                footer={null}
                width={400}
            >
                <div className="text-center">
                    <Scanner
                        onScan={handleScan}
                        onError={handleError}
                        constraints={{
                            video: {
                                facingMode: 'environment' // Camera sau
                            }
                        }}
                        components={{
                            audio: false,
                            finder: true
                        }}
                        styles={{
                            container: { width: '100%', height: '300px' }
                        }}
                    />
                    <p className="mt-3 text-gray-600">
                        Đưa QR code vào khung để scan
                    </p>
                </div>
            </Modal>
        </div>
    );
};