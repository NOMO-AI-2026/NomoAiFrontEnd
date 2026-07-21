import { Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout';
import sharedStyles from '../../layouts/AuthLayout/SharedAuth.module.css';

export default function PendingApproval() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className={`${sharedStyles.cardShadow} p-8 w-full max-w-md mx-auto text-center flex flex-col gap-6`}>
        
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center border border-yellow-200">
            <Clock className="w-10 h-10 text-yellow-500 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#1E1B4B]">حسابك قيد المراجعة</h2>
          <p className="text-gray-600 font-bold text-base leading-relaxed">
            تم تأكيد بريدك الإلكتروني بنجاح! حسابك الطبيب الآن في انتظار موافقة الإدارة (الأدمن) لتتمكن من الدخول إلى لوحة التحكم.
          </p>
        </div>

        <button 
          onClick={() => navigate('/login')}
          className={`${sharedStyles.buttonShadow} bg-[#581C87] text-white font-extrabold text-base py-3 px-6 rounded-full w-full flex justify-center items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity`}
        >
          <ArrowRight size={18} />
          العودة لتسجيل الدخول
        </button>

      </div>
    </AuthLayout>
  );
}