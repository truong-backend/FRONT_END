import React, { useState, useEffect } from 'react';
import {Scanner } from '@yudiel/react-qr-scanner';
import { message, Button, Card, Input, Modal, Spin, Alert } from 'antd';
import { CameraOutlined, ReloadOutlined, UserOutlined, QrcodeOutlined } from '@ant-design/icons';
import { ScanQRService } from '../../../services/PhanSinhVien/CameraScanQR/ScanQRService.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';

export const ScanQRComponents = () => {
    const { user, isAuthenticated } = useAuth();
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [scannedData, setScannedData] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [attendanceHistory, setAttendanceHistory] = useState([]);

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
            message.error('QR Code không hợp lệ (không phải định dạng JSON)');
            return;
        }

        const { id: qrId, thoiGianKt, type } = parsedData;

        // Kiểm tra type
        if (type !== 'attendance') {
            message.error('QR Code không hợp lệ (không phải điểm danh)');
            return;
        }

        // Kiểm tra hết hạn
        const now = new Date();
        const expiry = new Date(thoiGianKt);
        if (now > expiry) {
            message.error('QR Code đã hết hạn');
            return;
        }

        if (!qrId) {
            message.error('QR Code thiếu ID');
            return;
        }

        const requestData = {
            qrId,
            maSv
        };

        const response = await ScanQRService.markAttendanceByQR(requestData);

        message.success('Điểm danh thành công!');

        // Cập nhật lịch sử điểm danh
        const newAttendance = {
            id: Date.now(),
            qrId,
            time: new Date().toLocaleString('vi-VN'),
            status: 'Thành công'
        };
        setAttendanceHistory(prev => [newAttendance, ...prev.slice(0, 4)]);

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

            {/* Lịch sử điểm danh */}
            {attendanceHistory.length > 0 && (
                <Card title="Lịch sử điểm danh gần đây" className="mt-4">
                    <div className="space-y-2">
                        {attendanceHistory.map(item => (
                            <div 
                                key={item.id}
                                className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-l-4 border-green-400"
                            >
                                <div>
                                    <p className="font-medium">QR ID: {item.qrId}</p>
                                    <p className="text-sm text-gray-600">{item.time}</p>
                                </div>
                                <span className="text-green-600 font-medium">
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};