import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { message, Button, Card, Input, Modal, Spin } from 'antd';
import { CameraOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { ScanQRService } from '../../../services/PhanSinhVien/CameraScanQR/ScanQRService.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';

export const ScanQRComponents = () => {
    const { user, isAuthenticated } = useAuth();
    const [isScanning, setIsScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [qrData, setQrData] = useState(null);

    // Lấy mã sinh viên từ user context
    const maSv = user?.maSv || user?.id || user?.username;

    // Xử lý khi quét thành công
    const handleScan = async (data) => {
        if (!data) return;
        
        try {
            setIsScanning(false);
            setLoading(true);
            
            // Kiểm tra đăng nhập
            if (!isAuthenticated || !maSv) {
                message.error('Vui lòng đăng nhập để sử dụng tính năng này');
                return;
            }
            
            // Phân tích dữ liệu QR
            const parsedData = ScanQRService.parseQRData(data);
            setQrData(parsedData);
            
            // Thực hiện điểm danh
            await performAttendance(parsedData.qrId, maSv);
            
        } catch (error) {
            message.error(error.message || 'Lỗi khi xử lý QR Code');
            setIsScanning(false);
        } finally {
            setLoading(false);
        }
    };

    // Thực hiện điểm danh
    const performAttendance = async (qrId, studentId) => {
        try {
            setLoading(true);
            
            await ScanQRService.markAttendanceByQR({
                qrId: qrId,
                maSv: studentId
            });
            
            message.success("Điểm danh thành công");
            setScanResult({
                success: true,
                message: "Điểm danh thành công",
                qrId: qrId,
                maSv: studentId,
                time: new Date().toLocaleString()
            });
            
        } catch (error) {
            message.error(error.message || "Không thể điểm danh");
            setScanResult({
                success: false,
                message: error.message || "Không thể điểm danh",
                qrId: qrId,
                maSv: studentId,
                time: new Date().toLocaleString()
            });
        } finally {
            setLoading(false);
        }
    };

    // Xử lý lỗi khi quét
    const handleError = (error) => {
        console.error('QR Scanner Error:', error);
        message.error('Lỗi khi sử dụng camera');
    };

    // Bắt đầu quét
    const startScanning = () => {
        if (!isAuthenticated || !maSv) {
            message.error('Vui lòng đăng nhập để sử dụng tính năng này');
            return;
        }
        setScanResult(null);
        setIsScanning(true);
    };

    // Dừng quét
    const stopScanning = () => {
        setIsScanning(false);
    };

    // Xử lý khi xác nhận mã sinh viên
    const handleStudentIdConfirm = async () => {
        if (qrData) {
            await performAttendance(qrData.qrId, maSv);
        }
    };

    // Nếu chưa đăng nhập, hiển thị thông báo
    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
                <Card className="w-full max-w-md shadow-lg text-center">
                    <div className="mb-4">
                        <UserOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Vui lòng đăng nhập</h2>
                    <p className="text-gray-600">Bạn cần đăng nhập để sử dụng tính năng điểm danh bằng QR Code</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <Card 
                title="Điểm Danh Bằng QR Code" 
                className="w-full max-w-md shadow-lg"
                extra={
                    <Button 
                        icon={<ReloadOutlined />} 
                        onClick={() => window.location.reload()}
                        size="small"
                    />
                }
            >
                {/* Thông tin sinh viên */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                        <UserOutlined className="mr-2 text-blue-600" />
                        <div>
                            <p className="text-sm text-gray-600">Sinh viên đang đăng nhập:</p>
                            <p className="font-medium text-blue-800">{maSv}</p>
                            {user?.hoTen && (
                                <p className="text-sm text-gray-700">{user.hoTen}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Camera Scanner */}
                {isScanning ? (
                    <div className="relative">
                        <div className="w-full h-64 mb-4 border-2 border-dashed border-blue-300 rounded-lg overflow-hidden">
                            <Scanner
                                onDecode={handleScan}
                                onError={handleError}
                                style={{ width: '100%', height: '100%' }}
                                constraints={{
                                    facingMode: 'environment' // Sử dụng camera sau
                                }}
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">
                                Đưa camera vào QR Code để quét
                            </p>
                            <Button 
                                onClick={stopScanning}
                                type="default"
                                size="large"
                            >
                                Dừng Quét
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="mb-4">
                            <CameraOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                        </div>
                        <Button 
                            type="primary" 
                            size="large"
                            icon={<CameraOutlined />}
                            onClick={startScanning}
                            disabled={loading}
                            block
                        >
                            {loading ? <Spin size="small" /> : 'Bắt Đầu Quét QR'}
                        </Button>
                    </div>
                )}

                {/* Kết quả điểm danh */}
                {scanResult && (
                    <div className={`mt-4 p-3 rounded-lg ${
                        scanResult.success 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                    }`}>
                        <p className={`font-medium ${
                            scanResult.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                            {scanResult.message}
                        </p>
                        <div className="text-xs text-gray-600 mt-2">
                            <p>Mã SV: {scanResult.maSv}</p>
                            <p>Thời gian: {scanResult.time}</p>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};