import { useRef, useState, useLayoutEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

const LINE_HEIGHT_CLASS =
  "text-[clamp(2.25rem,6.5vw,4.5rem)] md:text-[clamp(2.5rem,7vw,4.75rem)] leading-[1.02] tracking-[-0.02em]";

function easeOutCubic(t) {
  const x = Math.min(Math.max(t, 0), 1);
  return 1 - (1 - x) ** 3;
}

function StatementCopy({ className }) {
  return (
    <p className={`font-bold ${LINE_HEIGHT_CLASS} ${className ?? ""}`}>
      We do not
      <br />
      create
      <br />
      disposable
      <br />
      advertising.
    </p>
  );
}

export default function EditorialScrollSection() {
  const sectionRef = useRef(null);
  const columnRef = useRef(null);
  const [columnPx, setColumnPx] = useState(0);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = columnRef.current;
    if (!el) return;
    const measure = () => setColumnPx(el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const panelWidth = useTransform(scrollYProgress, (p) => {
    if (reduceMotion) return "78%";
    const t = easeOutCubic(Math.min(Math.max(p / 0.38, 0), 1));
    return `${t * 82}%`;
  });

  const topLineScaleX = useTransform(scrollYProgress, (p) => {
    if (reduceMotion) return 1;
    const u = (p - 0.5) / 0.32;
    return easeOutCubic(Math.min(Math.max(u, 0), 1));
  });

  const bottomLineScaleX = useTransform(scrollYProgress, (p) => {
    if (reduceMotion) return 1;
    const u = (p - 0.58) / 0.32;
    return easeOutCubic(Math.min(Math.max(u, 0), 1));
  });

  const innerWidth = columnPx > 0 ? columnPx : undefined;

  if (reduceMotion) {
    return (
      <section
        className="relative min-h-screen w-full bg-[#F4F3EF] px-6 py-20 md:px-14 lg:px-20"
        aria-label="Editorial statement"
      >
        <div ref={columnRef} className="relative mx-auto w-full max-w-[min(92vw,920px)]">
          <div className="mb-4 h-px w-full bg-[#111]" />
          <div className="relative py-2">
            <StatementCopy className="text-[#111]" />
            <div
              className="pointer-events-none absolute right-0 top-[-0.06em] bottom-[-0.06em] z-10 w-[78%] overflow-hidden bg-[#111]"
              aria-hidden
            >
              <div
                className="absolute left-0 top-0"
                style={{ width: innerWidth ?? "100%" }}
              >
                <StatementCopy className="text-[#F4F3EF]" />
              </div>
            </div>
          </div>
          <div className="mt-4 h-px w-full bg-[#111]" />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#F4F3EF] min-h-[400vh]"
      aria-label="Editorial statement"
    >
      <div className="sticky top-0 flex min-h-screen w-full items-center overflow-hidden px-6 py-16 md:px-14 lg:px-20">
        <div className="mx-auto w-full max-w-[min(92vw,920px)]">
          <motion.div
            className="mb-4 h-px w-full origin-left bg-[#111] will-change-transform"
            style={{ scaleX: topLineScaleX }}
            aria-hidden
          />

          <div ref={columnRef} className="relative w-full py-2">
            <StatementCopy className="text-[#111]" />

            <motion.div
              className="pointer-events-none absolute right-0 top-[-0.06em] bottom-[-0.06em] z-10 overflow-hidden bg-[#111] will-change-[width]"
              style={{ width: panelWidth }}
              aria-hidden
            >
              <div
                className="absolute left-0 top-0"
                style={{ width: innerWidth ?? "100%" }}
              >
                <StatementCopy className="text-[#F4F3EF]" />
              </div>
            </motion.div>
          </div>

          <motion.div
            className="mt-4 h-px w-full origin-left bg-[#111] will-change-transform"
            style={{ scaleX: bottomLineScaleX }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
