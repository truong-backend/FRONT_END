import React, { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { SinhVienService } from '../../../services/PhanSinhVien/SinhVienService'
import { Spin, Button } from 'antd'

export default function QRSinhVienComponent() {
    const [qrData, setQRData] = useState({
        maSv: '',
        tenSv: '',
        tenLop: ''
    });
    const [loading, setLoading] = useState(true);

    const qrRef = useRef();
    const downloadQRCodeAsPNG = () => {
        const svg = qrRef.current.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            canvas.width = 200;
            canvas.height = 200;
            const context = canvas.getContext('2d');
            context.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);

            const pngUrl = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = 'qrcode.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        img.src = url;
    };


    useEffect(() => {
        getQRData();
    }, []);

    const getQRData = async () => {
        try {
            const res = await SinhVienService.getQRInfoSinhVien();
            console.log("Kết quả trả về:", res);
            setQRData(res);
        } catch (error) {
            console.log('Lỗi lấy mã QR:', error);
        } finally {
            setLoading(false);
        }
    };
    const qrString = qrData.maSv ? `${qrData.maSv}-${qrData.tenSv}-${qrData.maSv}` : '';

    return (
        <div className="flex flex-col items-center mt-12 space-y-4">
            <h1 className="text-lg font-semibold">QR Code:</h1>
            {loading ? (
                <Spin tip="Loading..." size="large" />
            ) : (
                qrData.maSv && (
                    <>
                        <div ref={qrRef}>
                            <QRCodeSVG value={qrString} size={200} />
                        </div>
                        <Button type="primary" onClick={downloadQRCodeAsPNG}>
                            Download QR
                        </Button>
                    </>
                )
            )}
        </div>
    );
}

