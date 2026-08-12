import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StoreSettings } from '../types';
import { Sparkles, ShieldCheck, Shirt, Award } from 'lucide-react';

import { RELIABLE_FALLBACK_IMAGES } from '../utils/imageUtils';

const DEFAULT_MODEL_IMAGE = '/images/philosophy_model.jpg';

interface PhilosophySectionProps {
  imageUrl?: string;
  storeSettings?: StoreSettings;
  onExplore?: () => void;
}

export const PhilosophySection: React.FC<PhilosophySectionProps> = ({
  imageUrl,
  storeSettings,
  onExplore,
}) => {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const rawUrl = storeSettings?.philosophyImageUrl ?? imageUrl ?? DEFAULT_MODEL_IMAGE;
  const isHidden = !rawUrl || rawUrl.trim() === '' || rawUrl === 'none' || rawUrl === 'hide';
  const activeImageUrl = isHidden ? '' : rawUrl;

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const isRtl = language === 'ar';

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-16 sm:py-20 md:py-24 bg-[#f6f4ee] text-neutral-900 border-y border-amber-900/10 px-4 sm:px-6 md:px-16 overflow-hidden relative"
    >
      {/* Decorative Warm Golden Background Glow */}
      <div className="absolute top-1/2 ltr:left-10 rtl:right-10 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Section Container */}
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Column 1: Text Content */}
        <div className="order-2 md:order-1 z-20 space-y-6 max-w-xl mx-auto md:mx-0 relative">
          {/* Subtitle & Golden Line */}
          <div className="flex items-center gap-3">
            <span
              className="h-[1.5px] bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-800 ease-out"
              style={{
                width: isVisible ? '2.5rem' : '0rem',
                opacity: isVisible ? 1 : 0,
              }}
            />
            <span
              className="text-amber-800 text-xs tracking-[0.25em] font-bold uppercase transition-all duration-700 ease-out"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible
                  ? 'translateX(0)'
                  : isRtl
                  ? 'translateX(20px)'
                  : 'translateX(-20px)',
                transitionDelay: '200ms',
              }}
            >
              {language === 'ar'
                ? storeSettings?.philosophyBadgeAr || 'فلسفة دار الأزياء'
                : storeSettings?.philosophyBadgeEn || 'OUR PHILOSOPHY'}
            </span>
          </div>

          {/* Main Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-neutral-950 font-extrabold leading-tight tracking-tight">
            <span
              className="block transition-all duration-700 ease-out"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: '300ms',
              }}
            >
              {language === 'ar'
                ? storeSettings?.philosophyTitle1Ar || 'إتقان يدوي..'
                : storeSettings?.philosophyTitle1En || 'Pure Craftsmanship.'}
            </span>
            <span
              className="block italic text-amber-700 font-serif font-light transition-all duration-700 ease-out mt-1"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: '420ms',
              }}
            >
              {language === 'ar'
                ? storeSettings?.philosophyTitle2Ar || 'وأناقة تدوم طويلاً'
                : storeSettings?.philosophyTitle2En || 'Unhurried Elegance.'}
            </span>
          </h2>

          {/* Golden Horizontal Divider */}
          <div
            className="h-[1px] bg-gradient-to-r from-amber-600/30 via-amber-600/15 to-transparent transition-all duration-1000"
            style={{
              width: isVisible ? '100%' : '0%',
              opacity: isVisible ? 1 : 0,
              transitionDelay: '500ms',
            }}
          />

          {/* Paragraphs */}
          <div
            className="space-y-4 text-neutral-700 transition-all duration-800 ease-out"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
              transitionDelay: '580ms',
            }}
          >
            <p className="text-sm sm:text-base leading-relaxed font-normal">
              {language === 'ar'
                ? storeSettings?.philosophyParagraph1Ar ||
                  'في توزا، نؤمن أن الفخامة الحقيقية تكمن في البساطة والتفاصيل الدقيقة. يتم تصميم كل قطعة بعناية فائقة باستخدام ألمس خامات الكتان المصري والقطن الفاخر 100%.'
                : storeSettings?.philosophyParagraph1En ||
                  'At TOUZA, we believe true luxury lives in restraint. Every shirt in our collection is meticulously tailored using pure 100% Egyptian cotton and fine linen.'}
            </p>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
              {language === 'ar'
                ? storeSettings?.philosophyParagraph2Ar ||
                  'تصاميم تعبر عن الأناقة الهادئة والثقة المطلقة، مع ضمان معاينة الشحنة قبل الدفع وخدمة شحن سريعة لجميع المحافظات.'
                : storeSettings?.philosophyParagraph2En ||
                  'Designed for daily confidence with premium stitching and express door-to-door delivery across Egypt.'}
            </p>
          </div>

          {/* CTA Button */}
          <div
            className="pt-2 transition-all duration-800 ease-out"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
              transitionDelay: '700ms',
            }}
          >
            <button
              onClick={onExplore}
              className="group relative inline-flex items-center justify-center gap-3 bg-neutral-900 text-[#e2c792] py-3.5 px-8 text-xs sm:text-sm font-bold tracking-wider uppercase rounded-xl hover:bg-black transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{language === 'ar' ? 'اكتشف التشكيلة الكاملة' : 'Explore Collection'}</span>
              <span className="text-base transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                {language === 'ar' ? '←' : '→'}
              </span>
            </button>
          </div>
        </div>

        {/* Column 2: Frameless Creative Integrated Model Display */}
        <div className="order-1 md:order-2 relative z-10 w-full flex justify-center items-center min-h-[460px] sm:min-h-[520px]">
          {!isHidden ? (
            /* Frameless Creative Integrated Cutout Model Display */
            <div
              className="relative w-full max-w-[420px] flex items-center justify-center transition-all duration-1000 ease-out select-none"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
                transitionDelay: '250ms',
              }}
            >
              {/* Giant Luxury Watermark Typography Behind Model */}
              <div className="absolute -top-4 sm:-top-8 inset-x-0 text-center font-serif font-black text-[90px] sm:text-[130px] md:text-[160px] text-amber-900/10 tracking-widest leading-none pointer-events-none select-none z-0">
                TOUZA
              </div>

              {/* Ambient Golden Radial Glow */}
              <div className="absolute w-64 h-64 sm:w-80 sm:h-80 bg-amber-400/25 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none" />

              {/* Floating Badge Top Right */}
              <div className="absolute top-2 right-0 sm:right-2 z-20 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-full border border-amber-500/30 shadow-md flex items-center gap-2 text-[11px] font-bold text-neutral-900 animate-bounce-slow">
                <span className="text-amber-600">✦</span>
                <span>{language === 'ar' ? 'تصميم كاجوال فاخر' : 'LUXURY ATELIER'}</span>
              </div>

              {/* Floating Badge Bottom Left */}
              <div className="absolute bottom-4 left-0 sm:left-2 z-20 bg-neutral-900/90 backdrop-blur-md px-3.5 py-2 rounded-full border border-amber-500/30 shadow-lg flex items-center gap-2 text-[11px] font-bold text-[#e2c792]">
                <span className="text-amber-400">✦</span>
                <span>{language === 'ar' ? 'قطن مصري 100%' : '100% EGYPTIAN COTTON'}</span>
              </div>

              {/* Frameless Cutout Model Image (No border, No frame box, Seamless Multiply Blend) */}
              <img
                src={activeImageUrl}
                alt="TOUZA Atelier Model"
                onError={(e) => {
                  if (e.currentTarget.src !== RELIABLE_FALLBACK_IMAGES.model) {
                    e.currentTarget.src = RELIABLE_FALLBACK_IMAGES.model;
                  }
                }}
                className="relative z-10 w-full max-h-[520px] sm:max-h-[580px] object-contain object-bottom mix-blend-multiply filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.18)] transition-transform duration-700 ease-out hover:scale-[1.03] cursor-pointer"
              />
            </div>
          ) : (
            /* Features Grid when image is hidden */
            <div className="w-full max-w-[420px] grid grid-cols-1 gap-4">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-start gap-4">
                <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400 shrink-0">
                  <Shirt className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white mb-1">
                    {language === 'ar' ? 'كتان وقطن مصري 100%' : '100% Natural Egyptian Fabric'}
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {language === 'ar'
                      ? 'خامات طبيعية ناعمة ومريحة تمنحك إطلالة عصرية في الصيف والحر.'
                      : 'Lightweight, ultra-breathable linen and cotton weave.'}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-start gap-4">
                <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400 shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white mb-1">
                    {language === 'ar' ? 'قصات أوفربوكس احترافية' : 'Tailored Overbox Fit'}
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {language === 'ar'
                      ? 'مصممة خصيصاً لتوفير أقصى درجات الراحة مع المظهر الأنيق الجذاب.'
                      : 'Crafted for relaxed modern street style and effortless movement.'}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-start gap-4">
                <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white mb-1">
                    {language === 'ar' ? 'معاينة الشحنة قبل الدفع' : 'Inspect Before Payment'}
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {language === 'ar'
                      ? 'يمكنك فتح الطرد ومعاينة القميص قبل التسليم والتأكد من مقاسك بضمان كامل.'
                      : 'Open and inspect your package upon delivery for 100% peace of mind.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
