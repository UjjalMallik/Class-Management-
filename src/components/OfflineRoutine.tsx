export default function OfflineRoutine() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_right,#1e293b,#020617)] px-4 pb-10 text-slate-100">
      <header className="-mx-4 mb-6 text-center">
        <img
          src="/swv_splash.png"
          alt="EUB 39 Batch"
          className="block h-auto w-full"
        />
        <p className="mx-auto mt-6 inline-block rounded-full border border-red-400/30 bg-red-500/15 px-4 py-1 text-xs font-semibold tracking-wide text-red-200">
          ● অফলাইন মোড
        </p>
        <p className="mt-4 px-4 text-sm leading-6 text-slate-300">
          আপনার নেটওয়ার্ক কানেকশন চেক দিন, ডাটা না থাকলে রিচার্জ করুন নয়তো আশেপাশের কারও কাছ থেকে হটস্পট কানেকশন নিন।
        </p>
      </header>

      <div className="mx-auto max-w-[500px]">
        <h1 className="my-7 flex items-center justify-center gap-2 text-center text-sm uppercase tracking-[0.2em] text-slate-400 before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10">
          <span>📅 অফলাইন ব্যাকআপ রুটিন</span>
        </h1>

        <RoutineDay className="border-emerald-400" day="Thursday" mode="Online">
          <RoutineSlot time="05:30PM - 06:20 PM" subject="MTH-207: MATH IV" />
          <RoutineSlot time="06:30PM - 08:20 PM" subject="CE-231: Principles of Soil Mechanics" />
          <RoutineSlot time="08:30PM - 09:20 PM" subject="CE-251: Fluid Mechanics" />
        </RoutineDay>

        <RoutineDay className="border-blue-400" day="Friday" mode="In Person">
          <RoutineSlot time="09:00 - 10:40 AM" subject="Engineering Geology & Geomorphology" room="315" />
          <RoutineSlot time="10:50 - 12:30 PM" subject="Computer Fundamental (Lab)" room="520" />
          <RoutineSlot time="03:00 - 04:40 PM" subject="Mechanics of Solid II" room="315" />
          <RoutineSlot time="04:50 - 06:30 PM" subject="Computer Programming Sessional (Lab)" room="520" />
          <RoutineSlot time="06:50 - 08:30 PM" subject="Civil Engineering Materials (Lab)" room="315" />
        </RoutineDay>

        <RoutineDay className="border-amber-400" day="Saturday" mode="In Person">
          <RoutineSlot time="05:30 - 07:10 PM" subject="Numerical Method" room="315" />
          <RoutineSlot time="07:20 - 09:00 PM" subject="Math-3" room="315" />
        </RoutineDay>

        <section className="mt-11 rounded-2xl border border-dashed border-sky-400/25 bg-sky-400/[0.04] px-5 py-6 text-center backdrop-blur-sm">
          <img
            src="/ujjal.jpeg"
            alt="Ujjal Mallik"
            className="mx-auto mb-5 h-[110px] w-[110px] rounded-full border-[3px] border-sky-400 object-cover shadow-[0_0_20px_rgba(56,189,248,0.4)]"
          />
          <p className="text-[17px] font-bold tracking-wide">
            This app developed by <span className="text-sky-400">Ujjal Mallik</span>
          </p>
          <p className="mt-2 px-2 text-[13.5px] leading-6 text-slate-400">
            Hope this app makes our class management system a little easier.
            <br />
            If you find it helpful, please keep me in your prayers! 🤲
          </p>
        </section>
      </div>
    </main>
  )
}

function RoutineDay({
  day,
  mode,
  className,
  children,
}: {
  day: string
  mode: string
  className: string
  children: React.ReactNode
}) {
  return (
    <section className={`relative mb-4 overflow-hidden rounded-2xl border border-white/5 border-l-4 bg-slate-900/60 p-5 shadow-sm backdrop-blur-md ${className}`}>
      <div className="mb-4 flex items-center justify-between border-b border-dashed border-white/10 pb-3">
        <h2 className="text-[17px] font-bold">{day}</h2>
        <span className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
          {mode}
        </span>
      </div>
      {children}
    </section>
  )
}

function RoutineSlot({
  time,
  subject,
  room,
}: {
  time: string
  subject: string
  room?: string
}) {
  return (
    <div className="mb-3.5 flex items-start last:mb-0">
      <span className="w-[125px] shrink-0 pr-3.5 pt-0.5 text-right text-[11.5px] font-semibold leading-5 text-slate-400">
        {time}
      </span>
      <span className="min-w-0 flex-1 border-l border-white/10 pl-3.5 pb-2 text-[13.5px] font-medium leading-5 text-slate-200">
        {subject}
      </span>
      {room && (
        <span className="ml-2 shrink-0 rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[11px] font-bold text-amber-300">
          {room}
        </span>
      )}
    </div>
  )
}