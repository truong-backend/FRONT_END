import React from 'react';
import {KetQuaDiemDanhComponents} from '../../../components/GiaoVien/KetQuaDiemDanh/KetQuaDiemDanhComponents.jsx';
import { BocCucChinh } from '../../../components/BoCuc/BocCucChinh.jsx';
import { Card } from 'antd';

export const KetQuaDiemDanhPage = () => {
  return (
    <BocCucChinh>
      <KetQuaDiemDanhComponents />
    </BocCucChinh>
  );
};