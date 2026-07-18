import { Mail, Lock, Eye, ArrowLeft, User } from 'lucide-react';
import styles from './SignUpPage.module.css';

export default function SignUpPage() {
  return (
    <div
      dir="rtl"
      className={`${styles.pageBackground} flex items-center justify-center p-6 font-sans text-[#1E1B4B] min-h-screen`}
    >
      {/* توسيع الحاوية إلى max-w-6xl لتعطي مساحة مناسبة */}
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* القسم الخاص بالنص والصورة (معكوس ليكون على اليسار) */}
        {/* تمت إضافة lg:mr-24 لدفع هذا القسم بالكامل لليسار */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-right space-y-6 order-1 lg:order-2 lg:mr-24">
          <div className="space-y-3">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-[#581C87] tracking-tight">
              NomoAI
            </h1>

            <p className="text-xl lg:text-2xl font-bold text-[#1E1B4B] max-w-sm">
              علاج النطق بطريقة ممتعة تشبه اللعب.
            </p>
          </div>

          <div
            className={`mt-8 ${styles.imageFrame} bg-white p-2 w-72 h-72 lg:w-80 lg:h-80 flex items-center justify-center`}
          >
            <img
              src="https://placehold.co/400x400/f8f9fa/6b21a8?text=Monster+Img"
              alt="NomoAI"
              className="w-full h-full object-cover rounded-[1.8rem]"
            />
          </div>
        </div>

        {/* كارت إنشاء حساب (معكوس ليكون على اليمين) */}
        <div className={`bg-white p-8 lg:p-10 ${styles.cardShadow} order-2 lg:order-1`}>
          <h2 className="text-3xl font-extrabold text-[#581C87] mb-2">
            إنشاء حساب
          </h2>

          <p className="text-sm font-bold text-gray-600 mb-8">
            انضم إلينا وابدأ رحلتك نحو التقدم اليوم.
          </p>

          <form className="space-y-5">

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-[#581C87] tracking-widest uppercase">
                الاسم الكامل
              </label>

              <div className={`flex items-center bg-white px-4 py-3.5 ${styles.inputContainer}`}>
                <User className="w-5 h-5 text-[#581C87] ml-3" />

                <input
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  className="bg-transparent border-none outline-none flex-1 text-sm font-bold text-[#1E1B4B] placeholder-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-[#581C87] tracking-widest uppercase">
                البريد الإلكتروني
              </label>

              <div className={`flex items-center bg-white px-4 py-3.5 ${styles.inputContainer}`}>
                <Mail className="w-5 h-5 text-[#581C87] ml-3" />

                <input
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  className="bg-transparent border-none outline-none flex-1 text-sm font-bold text-[#1E1B4B] placeholder-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-[#581C87] tracking-widest uppercase">
                كلمة المرور
              </label>

              <div className={`flex items-center bg-white px-4 py-3.5 ${styles.inputContainer}`}>
                <Lock className="w-5 h-5 text-[#581C87] ml-3" />

                <input
                  type="password"
                  placeholder="••••••••"
                  className="bg-transparent border-none outline-none flex-1 text-sm font-bold text-[#1E1B4B] placeholder-gray-300 tracking-widest"
                />

                <Eye className="w-5 h-5 text-[#581C87] cursor-pointer" />
              </div>
            </div>

            <button
              type="button"
              className={`w-full bg-[#FACC15] text-[#581C87] font-extrabold text-[15px] py-3.5 rounded-full flex justify-center items-center gap-2 mt-4 ${styles.buttonShadow}`}
            >
              إنشاء حساب
              <ArrowLeft className="w-5 h-5" strokeWidth={3} />
            </button>

          </form>

          <div className="mt-8 flex items-center justify-center space-x-4">
            <div className="h-px bg-gray-200 flex-1"></div>

            <span className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase">
              أو المتابعة باستخدام
            </span>

            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 border-2 border-gray-200 rounded-full py-3 text-sm font-bold text-[#581C87] hover:bg-gray-50 transition-colors">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-4 h-4"
                alt="Google"
              />
              جوجل
            </button>

            <button className="flex items-center justify-center gap-2 border-2 border-gray-200 rounded-full py-3 text-sm font-bold text-[#581C87] hover:bg-gray-50 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 384 512"
                className="w-4 h-4"
                fill="currentColor"
              >
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
              </svg>
              آبل
            </button>
          </div>

          <div className="mt-8 text-center text-xs font-bold text-gray-500">
            لديك حساب بالفعل؟
            <a
              href="/login"
              className="text-[#581C87] hover:underline mr-1"
            >
              سجل الدخول
            </a>
          </div>
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