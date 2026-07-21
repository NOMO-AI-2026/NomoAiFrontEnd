import { useState } from "react";
import { AudioLines, Brain, Gamepad2, LineChart } from "lucide-react";
import styles from "./HomePage.module.css";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [isAuthenticated] = useState(() => {
    const token = localStorage.getItem("token"); 
    return !!token; 
  });

  const targetRoute = isAuthenticated ? "/doctor/children" : "/login";

  return (
    <div className={styles.container} dir="rtl">
      <nav className={styles.navbar}>
        <div className={styles.logoGroup}>
          <div className={styles.logoIconWrapper}>
            <AudioLines className={styles.logoIcon} />
          </div>
          <span className={styles.logoText}>NomoAI</span>
        </div>

        <div className={styles.navActions}>
          {isAuthenticated ? (
            <Link to="/doctor/children" className={styles.dashboardBtn} style={{ textDecoration: 'none' }}>
              لوحة التحكم
            </Link>
          ) : (
            <>
              <Link to="/login" className={styles.loginBtn} style={{ textDecoration: 'none' }}>
                تسجيل الدخول
              </Link>
              <Link to="/signup" className={styles.signupBtn} style={{ textDecoration: 'none' }}>
                حساب جديد
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroTextContent}>
          <h1 className={styles.heroTitle}>
              حيث يتحول علاج النطق 
            <span className={styles.highlightText}> إلى متعة اللعب!</span>
          </h1>
          <p className={styles.heroDescription}>
            نساعد الأطفال المصابين بمتلازمة داون على تحسين النطق من خلال جلسات مدعومة بالذكاء الاصطناعي. لا حاجة للقراءة أو الكتابة — فقط التحدث والمرح مع صديق تفاعلي.
          </p>

          <div className={styles.ctaGroup}>
            <Link to={targetRoute} className={styles.primaryBtn} style={{ textDecoration: 'none' }}>
              امنح طفلك صوته اليوم
            </Link>
            <Link to="/demo" className={styles.secondaryBtn} style={{ textDecoration: 'none' }}>
              اكتشف كيف يعمل النظام
            </Link>
          </div>
        </div>

        <div className={styles.heroImageContainer}>
          <div className={styles.imageGlow}></div>
          <div className={styles.imageCard}>
            <div className={styles.imageIconWrapper}>
              <AudioLines className={styles.imageIcon} />
            </div>
            <p className={styles.imageText}>بيئة شخصيات ذكية<br />ثلاثية الأبعاد</p>
          </div>
        </div>
      </section>

      {/* ... باقي الأقسام (Features, HowItWorks, etc.) هتفضل زي ما هي بدون تغيير ... */}
      
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.cardIconYellow}>
            <LineChart className={styles.cardIcon} />
          </div>
          <h3 className={styles.cardTitle}>لوحة تحكم الطبيب</h3>
          <p className={styles.cardText}>
            مراقبة التقدم، تحديد الكلمات المستهدفة، وتتبع معدلات النجاح بعد كل جلسة بدقة.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.cardIconPurple}>
            <Gamepad2 className={styles.cardIcon} />
          </div>
          <h3 className={styles.cardTitle}>بيئة صديقة للطفل</h3>
          <p className={styles.cardText}>
            محادثات قصيرة من 5 إلى 10 دقائق مع شخصيات ذكية تفاعلية تحتفل بكل نجاح يحققه الطفل.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.cardIconYellow}>
            <Brain className={styles.cardIcon} />
          </div>
          <h3 className={styles.cardTitle}>تكيف ذكي</h3>
          <p className={styles.cardText}>
            يقوم الذكاء الاصطناعي بتقييم المحاولات تلقائياً وتعديل صعوبة الجلسة دون أي تدخل بشري.
          </p>
        </div>
      </section>

      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>كيف يعمل النظام؟</h2>
        <div className={styles.stepsContainer}>
          <div className={styles.stepsLine}></div>
          
          <div className={styles.stepItem}>
            <div className={styles.stepNumberPurple}>1</div>
            <h4 className={styles.stepTitle}>الطبيب يحدد الأهداف</h4>
            <p className={styles.stepText}>
              يقوم أخصائي التخاطب بإنشاء مسار تعليمي مخصص وتحديد كلمات مستهدفة للطفل.
            </p>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumberYellow}>2</div>
            <h4 className={styles.stepTitle}>التدريب مع الذكاء الاصطناعي</h4>
            <p className={styles.stepText}>
              يلعب الطفل ألعاباً تفاعلية ويتحدث مع شخصيات ذكية تقدم له ملاحظات صوتية فورية.
            </p>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumberPurple}>3</div>
            <h4 className={styles.stepTitle}>تتبع التقدم</h4>
            <p className={styles.stepText}>
              يتم تعديل الصعوبة تلقائياً، بينما يتلقى الآباء والأطباء تقارير تقدم مفصلة.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.bottomCtaSection}>
        <div className={styles.bottomCtaCard}>
          <h2 className={styles.bottomCtaTitle}>ابدأ رحلتك اليوم</h2>
          <p className={styles.bottomCtaText}>
            انضم إلى آلاف العائلات التي تطلق العنان لقدرات أطفالها مع علاج التخاطب المدعوم بالذكاء الاصطناعي.
          </p>
          <Link to={targetRoute} className={styles.bottomCtaBtn} style={{ textDecoration: 'none' }}>
            ابدأ الآن
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <h3 className={styles.footerLogo}>NomoAI</h3>
            <p className={styles.footerCopyright}>
              © 2026 NomoAI. نمكّن الأطفال من إيجاد صوتهم من خلال قوة الذكاء الاصطناعي.
            </p>
          </div>
          
          <div className={styles.footerLinksWrapper}>
            <div className={styles.footerCol}>
              <a href="#" className={styles.footerLink}>سياسة الخصوصية</a>
              <a href="#" className={styles.footerLink}>الدراسات السريرية</a>
            </div>
            <div className={styles.footerCol}>
              <a href="#" className={styles.footerLink}>شروط الخدمة</a>
              <a href="#" className={styles.footerLink}>إمكانية الوصول</a>
            </div>
            <div className={styles.footerCol}>
              <a href="#" className={styles.footerLink}>تواصل معنا</a>
              <a href="#" className={styles.footerLink}>الأسئلة الشائعة</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;