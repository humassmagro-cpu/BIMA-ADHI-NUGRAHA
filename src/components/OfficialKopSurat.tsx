import React from 'react';
import { SCHOOL_INFO } from '../types';

interface OfficialKopSuratProps {
  compact?: boolean;
}

export const OfficialKopSurat: React.FC<OfficialKopSuratProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="text-center border-b-2 border-slate-900 pb-1.5 mb-2 font-serif text-slate-900">
        <div className="text-[9px] font-bold tracking-wider leading-tight uppercase">
          {SCHOOL_INFO.provinsi}
        </div>
        <div className="text-[9px] font-bold tracking-wider leading-tight uppercase">
          {SCHOOL_INFO.dinas}
        </div>
        <div className="text-[11px] font-extrabold tracking-wide text-slate-950 uppercase mt-0.5">
          {SCHOOL_INFO.namaSekolah}
        </div>
        <div className="text-[8px] text-slate-700 leading-tight font-sans mt-0.5">
          {SCHOOL_INFO.alamat}
        </div>
        <div className="text-[7.5px] text-slate-600 leading-tight font-sans">
          {SCHOOL_INFO.kontak}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center border-b-2 border-slate-900 pb-2 mb-3 font-serif text-slate-900">
      <div className="text-[10px] font-bold tracking-wider leading-tight uppercase">
        {SCHOOL_INFO.provinsi}
      </div>
      <div className="text-[10px] font-bold tracking-wider leading-tight uppercase">
        {SCHOOL_INFO.dinas}
      </div>
      <div className="text-[12px] font-extrabold tracking-wide text-slate-950 uppercase mt-0.5">
        {SCHOOL_INFO.namaSekolah}
      </div>
      <div className="text-[9px] text-slate-700 leading-tight font-sans mt-0.5">
        {SCHOOL_INFO.alamat}
      </div>
      <div className="text-[8.5px] text-slate-600 leading-tight font-sans">
        {SCHOOL_INFO.kontak}
      </div>
    </div>
  );
};
