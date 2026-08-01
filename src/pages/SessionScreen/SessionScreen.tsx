import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { useLottie } from 'lottie-react';
import avatarAnimation from '../../assets/talking-avatar.json'; 

const SessionScreen = () => {
  const navigate = useNavigate();

  // إعدادات الأنيميشن (خلينا الـ autoplay بـ false عشان ميتكلمش لوحده في الأول)
  const options = {
    animationData: avatarAnimation,
    loop: true,
    autoplay: false, 
  };

  // الـ Hook بتاع Lottie بيرجعلنا الـ View (الشكل) ودوال للتحكم زي play و stop
  const { View, play, stop } = useLottie(options);

  // دالة نطق الكلام
  const handleSpeak = (text: string) => {
    // 1. نتأكد إن المتصفح بيدعم الخاصية دي
    if (!('speechSynthesis' in window)) {
      alert("عفواً، متصفحك لا يدعم خاصية نطق الصوت.");
      return;
    }

    // 2. نلغي أي صوت شغال حالياً عشان الأصوات متدخلش في بعض
    window.speechSynthesis.cancel();

    // 3. نجهز النص اللي هيتنطق
    const utterance = new SpeechSynthesisUtterance(text);
    
    // إعدادات الصوت
    utterance.lang = 'ar-EG'; // اللهجة المصرية
    utterance.rate = 0.85; // إبطاء السرعة شوية عشان يناسب الأطفال
    utterance.pitch = 1.2; // ترفيع الصوت درجة بسيطة عشان يكون أقرب للكرتون

    // 4. الأحداث (Events) لربط الصوت بالأنيميشن
    utterance.onstart = () => {
      play(); // أول ما الصوت يبدأ، شغل أنيميشن حركة البق
    };

    utterance.onend = () => {
      stop(); // أول ما الصوت يخلص، وقف الأنيميشن
    };

    utterance.onerror = () => {
      stop(); // لو حصل مشكلة، وقف الأنيميشن برضه
    };

    // 5. أمر التشغيل الفعلي
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f0f9ff' }}>
      
      <header style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}
        >
          <ArrowRight size={24} />
          رجوع
        </button>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '2rem' }}>
        
        {/* الأفاتار */}
        <div style={{ width: '400px', height: '400px' }}>
          {View}
        </div>

        {/* زرار التيست اللي هيخلي الأفاتار يتكلم */}
        <button 
          onClick={() => handleSpeak("أهلاً بيك يا بطلْ، يلا بينا نتعلم كلمة جديدة انهاردة")}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          <Play size={20} />
          جرب الصوت
        </button>

      </main>
    </div>
  );
};

export default SessionScreen;