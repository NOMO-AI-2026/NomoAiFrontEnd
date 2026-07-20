import React from 'react';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) { // 👈 تأكدي من كلمة { children } هنا
  return (
    <div
      dir="rtl"
      className={`${styles.pageBackground} flex items-center justify-center p-6 font-sans text-[#1E1B4B] min-h-screen`}
    >
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* القسم الخاص بالنص والصورة */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-right space-y-6 order-1 lg:order-2 lg:mr-24">
          <div className="space-y-3">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-[#581C87] tracking-tight">
              NomoAI
            </h1>
            <p className="text-xl lg:text-2xl font-bold text-[#1E1B4B] max-w-sm">
              علاج النطق بطريقة ممتعة تشبه اللعب.
            </p>
          </div>

          <div className={`mt-8 ${styles.imageFrame} bg-white p-2 w-72 h-72 lg:w-80 lg:h-80 flex items-center justify-center`}>
            <img
              src="https://placehold.co/400x400/f8f9fa/6b21a8?text=Monster+Img"
              alt="NomoAI"
              className="w-full h-full object-cover rounded-[1.8rem]"
            />
          </div>
        </div>

        {/* الكارت (سواء كان تسجيل الدخول أو إنشاء الحساب) */}
       <div className="order-2 lg:order-1">
          {children} {/* 👈 تأكدي إن الكلمة دي مكتوبة هنا */}
        </div>
      </div>

      {/* Floating Help Button */}
      <div className="fixed bottom-6 left-6">
        <button className="bg-[#581C87] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-900 transition-colors">
          <span className="text-xl font-bold">؟</span>
        </button>
      </div>
    </div>
  );
}