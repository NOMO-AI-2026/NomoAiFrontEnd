import React from 'react';
import styles from './AuthLayout.module.css';

import basicImage from '../../assets/basic-image.png'; 

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) { 
  return (
    <div
      dir="rtl"
      className={`${styles.pageBackground} flex items-center justify-center p-6 font-sans text-[#1E1B4B] min-h-screen`}
    >
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start lg:pt-16">
        
        <div className="flex flex-col items-center lg:items-start text-center lg:text-right space-y-6 order-1 lg:order-2 lg:mr-24">
          <div className="space-y-3">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-[#581C87] tracking-tight">
              NomoAI
            </h1>
            <p className="text-xl lg:text-2xl font-bold text-[#1E1B4B] max-w-sm">
              علاج النطق بطريقة ممتعة تشبه اللعب.
            </p>
          </div>

          <div className={`mt-8 ${styles.imageFrame} bg-white p-2 w-80 h-80 lg:w-[24rem] lg:h-[24rem] flex items-center justify-center`}>
            <img
              src={basicImage}
              alt="NomoAI Avatar"
              className="w-full h-full object-contain rounded-[1.8rem]"
            />
          </div>
        </div>

        <div className="order-2 lg:order-1">
          {children} 
        </div>
      </div>
    </div>
  );
}