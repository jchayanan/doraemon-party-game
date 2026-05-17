"use client";

export default function RuleReminder() {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-4 mb-4 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 backdrop-blur-sm">
        <span className="shrink-0 text-amber-400 text-xl mt-0.5">⚠️</span>
        <p className="text-amber-300 text-sm font-medium leading-snug">
          <span className="font-bold text-amber-200">ห้ามชี้นิ้ว!</span>{" "}
          โดเรมอนไม่มีนิ้ว ใครชี้โดนปรับดื่ม 1 อึก
        </p>
      </div>
    </div>
  );
}
