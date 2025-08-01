import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { message, Button, Card, Input, Modal, Spin, Alert } from 'antd';
import { CameraOutlined, ReloadOutlined, UserOutlined, QrcodeOutlined } from '@ant-design/icons';
import { ScanQRService } from '../../../services/SinhVien/CameraScanQR/ScanQRService.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';

export const ScanQRComponents = () => {
    const { user } = useAuth();
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    const maSv = user?.maSv || user?.id || user?.username;

    const handleScan = async (result) => {
        if (result && result.length > 0) {
            const qrData = result[0].rawValue;
            setShowScanner(false);
            await processAttendance(qrData);
        }
    };
    const processAttendance = async (qrData) => {
        setIsLoading(true);
        try {
            let parsedData;
            parsedData = JSON.parse(qrData);
            const { id: qrId } = parsedData;
            const requestData = {
                qrId,
                maSv
            };
            await ScanQRService.markAttendanceByQR(requestData);
            message.success('Điểm danh thành công!');
        } catch (error) {
            console.error('Lỗi điểm danh:', error);
            message.error(error.message || 'Điểm danh thất bại');
        }
    };
    const startScanning = () => {
        setShowScanner(true);
        setIsScanning(true);
    };
    const stopScanning = () => {
        setShowScanner(false);
        setIsScanning(false);
    };
    return (
        <div >
            <Card
                title={
                    <div>
                        <QrcodeOutlined />
                        <span>Điểm danh bằng QR Code</span>
                    </div>
                }

            >
                <div >
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
                {isLoading && (
                    <div >
                        <Spin />
                        <p >Đang xử lý điểm danh...</p>
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
                <div>
                    <Scanner
                        onScan={handleScan}
                        constraints={{
                            video: {
                                facingMode: 'environment' // Camera sau
                            }
                        }}
                        components={{
                            audio: false,
                            finder: true
                        }}
                        
                    />
                    <p>
                        Đưa QR code vào khung để scan
                    </p>
                </div>
            </Modal>
        </div>
    );  
};