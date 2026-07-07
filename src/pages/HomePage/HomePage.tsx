import { AudioLines, Brain, Gamepad2, LineChart } from "lucide-react";
import styles from "./HomePage.module.css";

const HomePage = () => {
  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.logoGroup}>
          <div className={styles.logoIconWrapper}>
            <AudioLines className={styles.logoIcon} />
          </div>
          <span className={styles.logoText}>NomoAI</span>
        </div>

        <div className={styles.navActions}>
          <button className={styles.loginBtn}>Login</button>
          <button className={styles.signupBtn}>Sign Up</button>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroTextContent}>
          <h1 className={styles.heroTitle}>
            Speech therapy that <br />
            <span className={styles.highlightText}>feels like play.</span>
          </h1>
          <p className={styles.heroDescription}>
            Helping children with Down syndrome improve speech through AI-powered sessions. No reading, no typing—just talking and having fun with an animated friend.
          </p>

          <div className={styles.ctaGroup}>
            <button className={styles.primaryBtn}>Start Session</button>
            <button className={styles.secondaryBtn}>Watch Demo</button>
          </div>
        </div>

        <div className={styles.heroImageContainer}>
          <div className={styles.imageGlow}></div>
          <div className={styles.imageCard}>
            <div className={styles.imageIconWrapper}>
              <AudioLines className={styles.imageIcon} />
            </div>
            <p className={styles.imageText}>3D AI Character<br />Space</p>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.cardIconYellow}>
            <LineChart className={styles.cardIcon} />
          </div>
          <h3 className={styles.cardTitle}>Doctor Dashboard</h3>
          <p className={styles.cardText}>
            Monitor progress, set target words, and track success rates after every single session.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.cardIconPurple}>
            <Gamepad2 className={styles.cardIcon} />
          </div>
          <h3 className={styles.cardTitle}>Child-Friendly</h3>
          <p className={styles.cardText}>
            Short, 5 to 10 minute conversations with animated AI characters that celebrate every success.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.cardIconYellow}>
            <Brain className={styles.cardIcon} />
          </div>
          <h3 className={styles.cardTitle}>Smart Adaptation</h3>
          <p className={styles.cardText}>
            The AI automatically evaluates attempts and adjusts session difficulty without human intervention.
          </p>
        </div>
      </section>

      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How it Works</h2>
        <div className={styles.stepsContainer}>
          <div className={styles.stepsLine}></div>
          
          <div className={styles.stepItem}>
            <div className={styles.stepNumberPurple}>1</div>
            <h4 className={styles.stepTitle}>Doctor Sets Targets</h4>
            <p className={styles.stepText}>
              The speech therapist creates a customized learning path and assigns specific target words for the child.
            </p>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumberYellow}>2</div>
            <h4 className={styles.stepTitle}>Practice with AI</h4>
            <p className={styles.stepText}>
              The child plays interactive games and converses with AI characters that provide real-time vocal feedback.
            </p>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumberPurple}>3</div>
            <h4 className={styles.stepTitle}>Track Progress</h4>
            <p className={styles.stepText}>
              The AI adjusts difficulty automatically, while parents and doctors receive detailed progress reports.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.bottomCtaSection}>
        <div className={styles.bottomCtaCard}>
          <h2 className={styles.bottomCtaTitle}>Start your journey today</h2>
          <p className={styles.bottomCtaText}>
            Join thousands of families who are unlocking their child's potential with AI-driven speech therapy.
          </p>
          <button className={styles.bottomCtaBtn}>Get Started Now</button>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <h3 className={styles.footerLogo}>NomoAI</h3>
            <p className={styles.footerCopyright}>
              © 2026 NomoAI. Empowering children to find their voice through the power of AI.
            </p>
          </div>
          
          <div className={styles.footerLinksWrapper}>
            <div className={styles.footerCol}>
              <a href="#" className={styles.footerLink}>Privacy Policy</a>
              <a href="#" className={styles.footerLink}>Clinical Studies</a>
            </div>
            <div className={styles.footerCol}>
              <a href="#" className={styles.footerLink}>Terms of Service</a>
              <a href="#" className={styles.footerLink}>Accessibility</a>
            </div>
            <div className={styles.footerCol}>
              <a href="#" className={styles.footerLink}>Contact Us</a>
              <a href="#" className={styles.footerLink}>FAQ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;