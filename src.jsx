import React, { useState, useRef } from "react";
import {
  Church, Landmark, GraduationCap, Building2, UtensilsCrossed, Clapperboard, Mic,
  MessageCircle, Download, Check, Ruler, Activity, FileText
} from "lucide-react";

/* ------------------------------------------------------------------ assets */
const LOGO_HEADER = "data:image/png;base64,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";
const LOGO_FOOTER = "data:image/png;base64,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";

/* ------------------------------------------------------------------ tokens */
const C = {
  ground: "#F1F0EC", surface: "#E9E8E4", dark: "#0B0B0B", darkSurface: "#1D1D1B",
  ink: "#0B0B0B", body: "#4A4A4A", muted: "#6B6A67",
  goldText: "#856A20", gold: "#C6A13A", goldLight: "#D6B355",
  line: "#DFDEDA", lineDark: "#292927", slate: "#4F6F9C",
};
const F = {
  serif: "'Spectral', Georgia, serif",
  sans: "'IBM Plex Sans', system-ui, -apple-system, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
};

const PHONE_DISPLAY = "+91 99622 32223";
const WHATSAPP = "919962232223";
const SITE = "www.reverentialav.in";
const EMAIL = "hello@reverentialav.in";
const W3F_KEY = "06c67d2a-e95e-4b5c-ae30-6a26c28491a4";

const DIAL_CODES = [
  ["+91", "India"], ["+971", "UAE"], ["+966", "Saudi Arabia"], ["+65", "Singapore"],
  ["+60", "Malaysia"], ["+94", "Sri Lanka"], ["+44", "UK"], ["+1", "US"], ["+61", "Australia"],
];

const SOCIALS = [
  ["Facebook", "https://www.facebook.com/share/18JnPFbRnB/"],
  ["Instagram", "https://www.instagram.com/reverential_av"],
  ["LinkedIn", "https://www.linkedin.com/company/reverential_av/"],
  ["YouTube", "https://youtube.com/@reverentialav"],
];

/* ------------------------------------------------------------------ nav */
const scrollTo = (e, id) => {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

/* ------------------------------------------------------------------ atoms */
const Eyebrow = ({ children, onDark }) => (
  <p className="mb-4 uppercase"
     style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: "0.09em",
              color: onDark ? C.goldLight : C.goldText }}>{children}</p>
);

const H2 = ({ children, onDark }) => (
  <h2 className="mb-3"
      style={{ fontFamily: F.serif, fontWeight: 400, letterSpacing: "-0.012em",
               fontSize: "clamp(1.5rem, 1.2rem + 1.4vw, 2.3rem)", lineHeight: 1.18,
               color: onDark ? C.ground : C.ink }}>{children}</h2>
);

const Lede = ({ children, onDark }) => (
  <p style={{ fontFamily: F.serif, fontWeight: 300,
              fontSize: "clamp(1.05rem,1rem + 0.4vw,1.25rem)", lineHeight: 1.55,
              color: onDark ? "#B4B0A6" : C.body, maxWidth: "56ch" }}>{children}</p>
);

const Btn = ({ children, variant = "solid", onDark = false, href, target, onClick, disabled = false }) => {
  const base = {
    fontFamily: F.sans, fontSize: 14, fontWeight: 500, borderRadius: 2,
    padding: "11px 22px", cursor: "pointer", border: "1px solid",
    transition: "all .18s ease", display: "inline-block", textAlign: "center",
    textDecoration: "none", lineHeight: 1.5,
  };
  const s =
    variant === "solid"
      ? onDark ? { ...base, background: C.gold, borderColor: C.gold, color: "#120D03" }
               : { ...base, background: C.ink, borderColor: C.ink, color: C.ground }
      : onDark ? { ...base, background: "transparent", borderColor: "#4A4A4A", color: C.ground }
               : { ...base, background: "transparent", borderColor: C.ink, color: C.ink };

  if (href) {
    const internal = href.startsWith("#");
    return (
      <a href={href} target={target} style={s}
         onClick={internal ? (e) => scrollTo(e, href.slice(1)) : undefined}>
        {children}
      </a>
    );
  }
  const ds = disabled ? { ...s, opacity: 0.45, cursor: "not-allowed" } : s;
  return <button style={ds} onClick={onClick} disabled={disabled}>{children}</button>;
};

const Section = ({ children, bg = C.ground, id, topRule = true }) => (
  <section id={id}
           style={{ background: bg, scrollMarginTop: 78,
                    borderTop: topRule ? `1px solid ${bg === C.dark ? C.lineDark : C.line}` : "none" }}>
    <div className="rev-wrap rev-band">
      {children}
    </div>
  </section>
);

/* ------------------------------------------------------------------ RT60 chart */
const PX = { x0: 70, x1: 690, y0: 40, y1: 340, tMax: 3, dbMax: 60 };
const xFor = (t) => PX.x0 + (t / PX.tMax) * (PX.x1 - PX.x0);
const yFor = (db) => PX.y0 + (-db / PX.dbMax) * (PX.y1 - PX.y0);
const levelAt = (t, rt) => Math.max(-60, (-60 * t) / rt);

function DecayChart() {
  const [view, setView] = useState("both");
  const [cursor, setCursor] = useState(null);
  const svgRef = useRef(null);

  const AS_BUILT = 2.4, TREATED = 0.9, THRESHOLD = 1.4;
  const showA = view === "both" || view === "asbuilt";
  const showB = view === "both" || view === "treated";

  const move = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 760;
    const t = ((px - PX.x0) / (PX.x1 - PX.x0)) * PX.tMax;
    setCursor(t >= 0 && t <= PX.tMax ? t : null);
  };

  return (
    <figure style={{ background: "#F6F3EC", border: `1px solid ${C.line}`, borderRadius: 2, padding: 16 }}>
      <div className="rev-chart-head">
        <span style={{ fontFamily: F.mono, fontSize: 10.5, color: C.muted }}>
          RT60 DECAY — 500 Hz BAND
        </span>
        <div className="rev-chart-tabs">
          {[["both", "Compare"], ["asbuilt", "As built"], ["treated", "After treatment"]].map(([k, label]) => {
            const on = view === k;
            return (
              <button key={k} onClick={() => setView(k)}
                style={{ fontFamily: F.mono, fontSize: 10.5, padding: "5px 10px", borderRadius: 2,
                         cursor: "pointer", transition: "all .15s ease",
                         border: `1px solid ${on ? C.goldText : C.line}`,
                         background: on ? C.goldText : "transparent",
                         color: on ? C.ground : C.muted }}>{label}</button>
            );
          })}
        </div>
      </div>

      <svg ref={svgRef} viewBox="0 0 760 400" className="w-full h-auto"
           onMouseMove={move} onMouseLeave={() => setCursor(null)} role="img"
           aria-label="Reverberation decay. The room as built takes 2.4 seconds to fall 60 decibels; after treatment, 0.9 seconds.">
        <rect x={xFor(THRESHOLD)} y={PX.y0} width={PX.x1 - xFor(THRESHOLD)} height={PX.y1 - PX.y0}
              fill={C.gold} opacity="0.07" />
        <line x1={xFor(THRESHOLD)} y1={PX.y0} x2={xFor(THRESHOLD)} y2={PX.y1}
              stroke={C.gold} strokeWidth="1" strokeDasharray="4 4" />
        <text x={xFor(THRESHOLD) + 9} y={PX.y0 + 16}
              style={{ fontFamily: F.mono, fontSize: 11, fill: C.goldText }}>
          words start to blur together
        </text>

        {[-20, -40].map((db) => (
          <line key={db} x1={PX.x0} y1={yFor(db)} x2={PX.x1} y2={yFor(db)}
                stroke={C.line} strokeWidth="1" strokeDasharray="2 4" />
        ))}
        <line x1={PX.x0} y1={PX.y1} x2={PX.x1} y2={PX.y1} stroke={C.line} strokeWidth="1" />
        <line x1={PX.x0} y1={PX.y0} x2={PX.x0} y2={PX.y1} stroke={C.line} strokeWidth="1" />

        {[0, -20, -40, -60].map((db) => (
          <text key={db} x={PX.x0 - 10} y={yFor(db) + 4} textAnchor="end"
                style={{ fontFamily: F.mono, fontSize: 11, fill: C.muted }}>{db}</text>
        ))}
        <text x={26} y={190} textAnchor="middle" transform="rotate(-90 26 190)"
              style={{ fontFamily: F.mono, fontSize: 11, fill: C.muted }}>level (dB)</text>
        {[0, 1, 2, 3].map((t) => (
          <text key={t} x={xFor(t)} y={PX.y1 + 22} textAnchor="middle"
                style={{ fontFamily: F.mono, fontSize: 11, fill: C.muted }}>{t.toFixed(1)}</text>
        ))}
        <text x={380} y={PX.y1 + 44} textAnchor="middle"
              style={{ fontFamily: F.mono, fontSize: 11, fill: C.muted }}>
          time after the sound stops (seconds)
        </text>

        <line x1={xFor(0)} y1={yFor(0)} x2={xFor(AS_BUILT)} y2={yFor(-60)}
              stroke={C.gold} strokeWidth="2.6" strokeLinecap="round"
              style={{ opacity: showA ? 1 : 0.12, transition: "opacity .3s ease" }} />
        <line x1={xFor(0)} y1={yFor(0)} x2={xFor(TREATED)} y2={yFor(-60)}
              stroke={C.slate} strokeWidth="2.6" strokeLinecap="round"
              style={{ opacity: showB ? 1 : 0.12, transition: "opacity .3s ease" }} />

        <text x={xFor(AS_BUILT) + 12} y={yFor(-60) - 4}
              style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 500, fill: C.goldText,
                       opacity: showA ? 1 : 0.2 }}>2.4 s — as built</text>
        <text x={xFor(TREATED) + 12} y={yFor(-60) - 26}
              style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 500, fill: C.slate,
                       opacity: showB ? 1 : 0.2 }}>0.9 s — after treatment</text>

        {cursor !== null && (
          <g>
            <line x1={xFor(cursor)} y1={PX.y0} x2={xFor(cursor)} y2={PX.y1}
                  stroke={C.ink} strokeWidth="1" opacity="0.35" />
            {showA && <circle cx={xFor(cursor)} cy={yFor(levelAt(cursor, AS_BUILT))} r="4.5" fill={C.gold} />}
            {showB && <circle cx={xFor(cursor)} cy={yFor(levelAt(cursor, TREATED))} r="4.5" fill={C.slate} />}
            <g transform={`translate(${Math.min(xFor(cursor) + 12, 560)}, ${PX.y0 + 34})`}>
              <rect width="176" height={showA && showB ? 62 : 44} fill={C.ground} stroke={C.line} rx="2" />
              <text x="12" y="20" style={{ fontFamily: F.mono, fontSize: 11, fill: C.muted }}>
                t = {cursor.toFixed(2)} s
              </text>
              {showA && (
                <text x="12" y="38" style={{ fontFamily: F.mono, fontSize: 11, fill: C.goldText }}>
                  as built {levelAt(cursor, AS_BUILT).toFixed(1)} dB
                </text>
              )}
              {showB && (
                <text x="12" y={showA ? 55 : 38}
                      style={{ fontFamily: F.mono, fontSize: 11, fill: C.slate }}>
                  treated {levelAt(cursor, TREATED).toFixed(1)} dB
                </text>
              )}
            </g>
          </g>
        )}
      </svg>

      <figcaption className="mt-3" style={{ fontFamily: F.mono, fontSize: 11, lineHeight: 1.6, color: C.muted }}>
        RT60 — how long sound keeps ringing in a room after the source stops. Move across the chart
        to read the level at any moment. The longer the tail, the more the previous word covers up
        the next one.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ data */
const FAILURES = [
  { title: "The speech intelligibility gap",
    body: "Sound builds up on tile, glass, concrete and plaster and arrives late, masking the consonants that carry meaning. Turning the system up feeds the same reflections. Clear at the front, unusable at the back — and no loudspeaker will fix it." },
  { title: "Over-specifying hardware to solve a room",
    body: "When margin comes from equipment, the diagnosis is always that there was not enough of it. Organisations replace their system two or three times before anyone measures the room, and each replacement inherits the same problem." },
  { title: "Nobody measured anything",
    body: "A proposal that names brands and quantities but cannot state the predicted clarity score at the back row is a shopping list, not a design. Ask any supplier for their coverage prediction before you sign." },
  { title: "Operator knowledge that walks out of the building",
    body: "An undocumented system lives in one person's head. When they travel or leave, the settings drift and the system degrades. Documentation is what makes a system survive a handover." },
];

const SECTORS = [
  { id: "churches", label: "Churches", Icon: Church,
    line: "From full contemporary worship bands to cathedral organs and hymns, the words have to reach the back row.",
    pains: ["The band is loud but the vocals get lost underneath it",
            "Clear in the front rows, echo at the back, whatever the equipment cost",
            "Stone walls and a high ceiling ring for seconds, which suits the organ and defeats the sermon",
            "The worship team cannot hear themselves on stage",
            "Feedback at the pulpit that nobody can permanently cure",
            "The production room grew piece by piece, so streaming and presentation fail mid service",
            "The system only works when one particular volunteer is on the desk"],
    avl: "Also delivered here: camera, switching and streaming video, presentation and lyric playback for the tech team, and stage lighting that suits a band set and a traditional service equally." },
  { id: "auditoriums", label: "Auditoriums", Icon: Landmark,
    line: "One hall, many uses — speech, music and visiting productions.",
    pains: ["Speech wants a dry room, music wants a live one — tuned by instinct, it serves neither",
            "Visiting productions arrive with a technical rider the house system cannot meet",
            "Balconies and side blocks covered by hope rather than by design",
            "No documented house specification to put in front of a hirer"],
    avl: "Also delivered here: projection and LED wall, stage and house lighting, and the control system that ties them together." },
  { id: "education", label: "Education", Icon: GraduationCap,
    line: "If the back row cannot follow the lecture, the room is the problem.",
    pains: ["Ceiling fans and split ACs sitting a few decibels below the teacher's voice",
            "Teachers pushing their voice all week and losing it by Wednesday",
            "A single front loudspeaker adding volume without adding clarity",
            "Recorded and hybrid lectures that sound like a tunnel"],
    avl: "Also delivered here: lecture capture and streaming video, displays, and lighting for halls and lecture theatres." },
  { id: "corporate", label: "Corporate", Icon: Building2,
    line: "Video calls where the far end hears every word the first time.",
    pains: ["Glass-walled rooms with nothing in them to absorb a voice",
            "\"Camera problems\" and \"network problems\" that are room problems",
            "Town halls held in atriums and cafeterias never designed for speech",
            "Rooms certified on paper but never verified in practice"],
    avl: "Also delivered here: conference cameras and displays, digital signage, and meeting room lighting control." },
  { id: "hospitality", label: "Hospitality", Icon: UtensilsCrossed,
    line: "Atmosphere without the shouting.",
    pains: ["The shouting spiral — guests raise their voices, so everyone else does too",
            "Polished concrete, brick, glass and steel: beautiful, acoustically hostile",
            "One volume for a bar that wants energy and a dining room that wants conversation",
            "Systems fitted during interior works by a contractor with no measurement kit"],
    avl: "Also delivered here: display and menu screens, and lighting scenes that change with the time of day." },
  { id: "studios", label: "Studios", Icon: Mic,
    line: "Studios, control rooms and church production rooms, where small spaces are hardest to get right.",
    pains: ["In a small room the space colours everything you hear",
            "The mix does not translate to a car, headphones or the auditorium",
            "Production rooms assembled piece by piece, then failing mid service",
            "Audio, video and control traffic all fighting over one unmanaged switch"],
    avl: "Also delivered here: camera, switching and streaming video, with key and background lighting designed for it." },
  { id: "residential", label: "Residential", Icon: Clapperboard,
    line: "The performance you already paid for, out of the room you have.",
    pains: ["Bass overwhelming in one seat and absent in the next",
            "Dialogue you keep rewinding, because of reflections you cannot hear as reflections",
            "Seating placed for the furniture, not for the sound",
            "Cinema levels travelling through the rest of the house after nine at night"],
    avl: "Also delivered here: projection or LED display, picture calibration, and cinema lighting scenes." },
];

const PHASES = [
  { n: "01", title: "Measured assessment", Icon: Ruler,
    body: "We visit the space in use and again when it is empty, and listen from where your audience actually sits. Reverberation, speech clarity, background noise and the existing system's response are measured with calibrated equipment, so the cause is identified rather than guessed at.",
    deliverable: "A written site survey report with annotated measurement graphs, prioritised recommendations and indicative budget ranges — yours to keep whether or not you continue." },
  { n: "02", title: "Acoustic simulation", Icon: Activity,
    body: "Treatment and loudspeaker layout are modelled in EASE Focus 3 against your actual seating plan. We know what every seat will receive before a single box is ordered.",
    deliverable: "Coverage prediction across the seating plan, targeting a 3 dB spread from the front row to the back, with the acoustic treatment schedule that makes it achievable." },
  { n: "03", title: "System design", Icon: FileText,
    body: "The design is written down: loudspeaker selection and positions, signal chain, network topology, control layout, and the predicted performance figures we intend to hit.",
    deliverable: "A full system design, itemised budget, signal flow drawing and a scope of work with predicted performance written into it." },
  { n: "04", title: "Physical integration", Icon: Building2,
    body: "Rigging, cabling, networking and installation, scheduled around your calendar. All overhead rigging is installed to load-rated standards with written load calculations. Existing equipment is reused wherever it is genuinely fit for purpose.",
    deliverable: "As-built cable schedule, rack elevations, rigging documentation and signal flow drawing matching what is actually in the building." },
  { n: "05", title: "Tuning and verification", Icon: Activity,
    body: "Time alignment, equalisation and gain structure set by measurement in Smaart v9, then verified at the seats. The room is measured again and compared against the prediction from stage two.",
    deliverable: "A commissioning report with before and after transfer functions and intelligibility figures. If the result falls short of the prediction and the cause is within our scope, correcting it is on us." },
  { n: "06", title: "Documentation and training", Icon: FileText,
    body: "Your own staff or volunteers are trained on the system as installed, not on a generic manual. Procedures are written for the people who will actually operate it.",
    deliverable: "Operating manual, scene list, written procedures and a training session — so the system survives a change of operator." },
];

const CREDENTIALS = [
  ["Smaart v9 — System Alignment and Tuning",
   "Rational Acoustics · certified",
   "Verified before-and-after transfer functions on every project. The credential that turns opinion into evidence."],
  ["Diploma in Audio Engineering and Music Production",
   "AAT College, Chennai (formerly SAE)",
   "Formal grounding in signal flow, acoustics and production — the foundation the rest is built on."],
  ["Architectural Acoustics",
   "SWAYAM / NPTEL · in progress, 2026",
   "The absorption, geometry and reverberation recommendations behind every survey report."],
  ["Certified Technology Specialist (CTS)",
   "AVIXA · in progress, November 2026",
   "The international benchmark credential for audiovisual systems integration."],
  ["Networking and control platforms",
   "Dante Level 2 (Audinate) · NETGEAR AV · Q-SYS Architect",
   "Audio-over-IP across multiple switches, network configuration that keeps audio and video stable on one building network, and the control platform your staff will actually operate."],
];


const FAQS = [
  ["How do we start, and what does it cost?",
   "Start with a free twenty minute call. We will work out whether the problem is the space, the system design, the installation or the way it is being operated, and tell you honestly if you do not need us. If you want to go deeper, a one hour discovery call is ₹2,000 plus GST. A full site survey, on site with measurement equipment and followed by a written report, is normally ₹8,000 plus GST, currently ₹6,000 for the first ten clients. Travel and stay are extra where applicable, and the survey fee is adjusted in full against any project that follows."],
  ["What will a full project cost?",
   "It depends almost entirely on the space, which is why we measure and design before quoting. The survey report gives you a priority order, so you can spread the work across budget years instead of committing to all of it at once. We will give you honest budget ranges on the first call, before you have spent anything with us."],
  ["We have a full band. Do you understand contemporary worship?",
   "Yes. The founder has spent a decade mixing live bands, so the specific problems are familiar rather than theoretical. Low end from kick and bass covering the vocal, stage volume fighting the room, in-ear monitoring, tracks and click, and a livestream feed that has to work at the same time as the room."],
  ["Do you handle video and lighting as well as sound?",
   "Yes. Video and lighting are delivered with production partners we have worked alongside for years, specified and project managed to the same standard as the audio. You deal with one team and one scope of work."],
  ["We already have a tech team. Are you replacing them?",
   "No. Your team knows your services, your musicians and your building, and none of that transfers. Our job is to give them a system that behaves the same way every week and documentation that survives a handover, then train them on it."],
  ["Where do you work?",
   "Based in Chennai and Bengaluru, we work across Tamil Nadu, Kerala and Karnataka, from the capital cities down through Coimbatore, Trichy, Madurai and the Nagercoil and Kanniyakumari belt, and across Kochi, Thiruvananthapuram and the wider Kerala coast. Andhra Pradesh, Telangana and Hyderabad are covered from Bengaluru. Projects elsewhere in India are taken on merit, as are Gulf projects. Travel and stay are quoted separately and openly."],
];

/* ------------------------------------------------------------------ page */
export default function Reverential() {
  const [sector, setSector] = useState("churches");
  const [phase, setPhase] = useState(0);
  const [faq, setFaq] = useState(0);
  const [form, setForm] = useState({
    name: "", org: "", space: "Church or house of worship", phone: "", email: "", message: "",
  });
  const [dial, setDial] = useState("+91");
  const [attempted, setAttempted] = useState(false);
  const [checklistAttempted, setChecklistAttempted] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [checklistEmail, setChecklistEmail] = useState("");
  const [checklistSent, setChecklistSent] = useState(false);

  const emailLooksValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  const errors = {
    name: !form.name.trim() ? "Please tell us your name." : "",
    phone: !form.phone.trim()
      ? "We need a number to reach you on."
      : !/^[0-9][0-9\s-]{5,14}$/.test(form.phone.trim())
      ? "Enter the number without the country code."
      : "",
    email: !form.email.trim()
      ? "Please add an email address."
      : !emailLooksValid(form.email)
      ? "That email address does not look right."
      : "",
  };
  const hasErrors = Boolean(errors.name || errors.phone || errors.email);
  const checklistError = !checklistEmail.trim()
    ? "Please add an email address."
    : !emailLooksValid(checklistEmail)
    ? "That email address does not look right."
    : "";

  const postToWeb3Forms = async (payload) => {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ access_key: W3F_KEY, ...payload }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "submit failed");
    return data;
  };

  const submitConsultation = async () => {
    if (sending) return;
    setAttempted(true);
    if (hasErrors) { setFailed(false); return; }
    setSending(true); setFailed(false);
    try {
      await postToWeb3Forms({
        subject: "New consultation request — reverentialav.in",
        from_name: "Reverential website",
        name: form.name, organisation: form.org, space: form.space,
        phone: `${dial} ${form.phone.trim()}`, email: form.email, message: form.message,
      });
      setSent(true);
    } catch (err) { setFailed(true); }
    setSending(false);
  };

  const submitChecklist = async () => {
    setChecklistAttempted(true);
    if (checklistError) return;
    try {
      await postToWeb3Forms({
        subject: "12-point checklist request — reverentialav.in",
        from_name: "Reverential website",
        email: checklistEmail,
        message: "Requested the 12-point sound system check.",
      });
      setChecklistSent(true);
    } catch (err) {}
  };

  const active = SECTORS.find((s) => s.id === sector);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const inputStyle = {
    fontFamily: F.sans, fontSize: 16, color: C.ground, background: C.darkSurface,
    border: `1px solid ${C.lineDark}`, borderRadius: 2, padding: "10px 12px",
    width: "100%", outline: "none",
  };
  const labelStyle = { fontFamily: F.sans, fontSize: 13, color: "#8E8375", marginBottom: 5, display: "block" };
  const Req = () => <span style={{ color: C.goldLight, marginLeft: 3 }} aria-hidden="true">*</span>;
  const errStyle = { fontFamily: F.sans, fontSize: 12, color: "#D98B7A", margin: "5px 0 0" };
  const fieldStyle = (bad) => (bad ? { ...inputStyle, borderColor: "#9E4B38" } : inputStyle);

  const pickSector = (e, id) => { setSector(id); scrollTo(e, "sectors"); };

  return (
    <div style={{ background: C.ground, color: C.body, fontFamily: F.sans, lineHeight: 1.65 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Spectral:wght@300;400;600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        input:focus, textarea:focus, select:focus { border-color: ${C.gold} !important; }
        .rev-nav a:hover { color: ${C.goldText} !important; }
        .rev-social:hover { border-color: ${C.gold} !important; color: ${C.goldLight} !important; }

        /* fluid container: padding and width scale with the viewport */
        .rev-wrap { max-width: 1180px; margin-inline: auto;
                    padding-inline: clamp(1.1rem, 4vw, 3rem); }
        .rev-band { padding-block: clamp(2.75rem, 6vw, 5rem); }
        .rev-head { padding-block: 0.6rem; }
        .rev-foot-pad { padding-block: clamp(2.5rem, 5vw, 3.25rem); }

        /* hero: single column until there is genuinely room for two */
        .rev-hero { display: grid; grid-template-columns: 1fr;
                    gap: clamp(1.75rem, 4vw, 2.75rem); align-items: center; }
        @media (min-width: 1000px) {
          .rev-hero { grid-template-columns: minmax(0,5fr) minmax(0,7fr); }
        }

        /* sector tabs: even grid instead of a ragged wrap on tablets */
        .rev-tabs { display: grid; gap: 0.5rem; margin-top: 2rem;
                    grid-template-columns: repeat(auto-fit, minmax(138px, 1fr)); }
        @media (max-width: 420px) { .rev-tabs { grid-template-columns: 1fr 1fr; } }

        /* sector panel: divider flips from bottom to right at the breakpoint */
        .rev-panel { display: grid; grid-template-columns: 1fr; margin-top: 2rem; }
        .rev-panel-l { padding: clamp(1.4rem, 2.6vw, 2rem);
                       border-bottom: 1px solid ${C.line}; }
        .rev-panel-r { padding: clamp(1.4rem, 2.6vw, 2rem); }
        @media (min-width: 840px) {
          .rev-panel { grid-template-columns: minmax(0,4.5fr) minmax(0,7.5fr); }
          .rev-panel-l { border-bottom: 0; border-right: 1px solid ${C.line}; }
        }

        /* credentials rows */
        .rev-cred { display: grid; grid-template-columns: 1fr; gap: 0.4rem;
                    padding: 18px 0; border-bottom: 1px solid ${C.line}; }
        @media (min-width: 760px) {
          .rev-cred { grid-template-columns: minmax(0,16rem) minmax(0,1fr); gap: 0.4rem 2.2rem; }
        }

        /* method body indent scales down on small screens */
        .rev-phase-body { padding-left: clamp(1.6rem, 5vw, 2.75rem);
                          padding-bottom: 1.5rem; max-width: 72ch; }

        /* booking + form */
        .rev-book { display: grid; grid-template-columns: 1fr;
                    gap: clamp(2.25rem, 4vw, 3rem); }
        @media (min-width: 960px) {
          .rev-book { grid-template-columns: minmax(0,1fr) minmax(0,1fr); }
        }
        .rev-care { display: grid; grid-template-columns: 1fr; gap: 1.1rem; }
        @media (min-width: 760px) { .rev-care { grid-template-columns: 1fr 1fr; } }
        .rev-form { display: grid; grid-template-columns: 1fr; gap: 0.9rem; margin-top: 1.75rem; }
        @media (min-width: 540px) { .rev-form { grid-template-columns: 1fr 1fr; } }
        .rev-form-full { grid-column: 1 / -1; }

        /* footer */
        .rev-avl { display: grid; grid-template-columns: 1fr 1fr; gap: 0;
                   border-top: 1px solid ${C.line}; border-bottom: 1px solid ${C.line}; }
        .rev-avl > div { padding: 1.15rem 1.4rem 1.15rem 0;
                         border-right: 1px solid ${C.line};
                         border-bottom: 1px solid ${C.line}; }
        .rev-avl > div:nth-child(2n) { border-right: 0; }
        .rev-avl > div:nth-child(n+3) { border-bottom: 0; }
        @media (min-width: 900px) {
          .rev-avl { grid-template-columns: repeat(4, 1fr); }
          .rev-avl > div { border-bottom: 0; border-right: 1px solid ${C.line}; }
          .rev-avl > div:last-child { border-right: 0; }
        }

        .rev-two { display: grid; grid-template-columns: 1fr; gap: 1px;
                   background: ${C.line}; border: 1px solid ${C.line}; }
        .rev-two > div { background: ${C.ground}; padding: clamp(1.2rem, 2.2vw, 1.6rem); }
        @media (min-width: 700px) { .rev-two { grid-template-columns: 1fr 1fr; } }

        .rev-foot { display: grid; gap: clamp(1.5rem, 3vw, 1.9rem);
                    grid-template-columns: repeat(auto-fit, minmax(min(100%, 190px), 1fr)); }

        /* chart controls never overflow */
        .rev-chart-head { display: flex; flex-wrap: wrap; align-items: center;
                          justify-content: space-between; gap: 0.5rem; margin-bottom: 0.75rem; }
        .rev-chart-tabs { display: flex; flex-wrap: wrap; gap: 4px; }
      `}</style>

      {/* ---------------- header ---------------- */}
      <header className="sticky top-0 z-50"
              style={{ background: "rgba(241,240,236,0.94)", backdropFilter: "blur(8px)",
                       borderBottom: `1px solid ${C.line}` }}>
        <div className="rev-wrap rev-head flex items-center" style={{ gap: 20 }}>
          <a href="#top" onClick={(e) => scrollTo(e, "top")} style={{ flexShrink: 0 }}>
            <img src={LOGO_HEADER} alt="Reverential — AV Acoustics Integration"
                 style={{ height: 38, width: "auto", display: "block" }} />
          </a>
          <nav className="rev-nav ml-auto hidden lg:flex items-center" style={{ gap: 22 }}>
            {SECTORS.map((s) => (
              <a key={s.id} href="#sectors" onClick={(e) => pickSector(e, s.id)}
                 style={{ fontSize: 14, color: C.body, textDecoration: "none", cursor: "pointer" }}>
                {s.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto lg:ml-0">
            <Btn href="#book">Book a Free Consultation</Btn>
          </div>
        </div>
      </header>

      {/* ---------------- hero ---------------- */}
      <section id="top" style={{ background: C.ground, scrollMarginTop: 78 }}>
        <div className="rev-wrap rev-band">
          <div className="rev-hero">
            <div>
              <Eyebrow>Reverential™ — Audio, Video, Lighting &amp; Acoustics</Eyebrow>
              <h1 style={{ fontFamily: F.serif, fontWeight: 400, letterSpacing: "-0.015em",
                           fontSize: "clamp(2.1rem, 1.5rem + 3vw, 3.7rem)", lineHeight: 1.07,
                           color: C.ink, marginBottom: 20 }}>
                They can hear the sound. They can’t understand the words.
              </h1>
              <Lede>
                We design and deploy audiovisual, acoustic and lighting systems. We measure the
                space with calibrated instruments to find out what is actually going wrong, engineer
                the solution that fixes it, and prove the finished system works before we hand it
                over.
              </Lede>
              <div className="flex flex-wrap mt-8" style={{ gap: 12 }}>
                <Btn href="#book">Book a Free 20-Minute Consultation</Btn>
                <Btn href="#method" variant="ghost">See How We Work</Btn>
              </div>
            </div>
            <div><DecayChart /></div>
          </div>
        </div>
      </section>

      {/* ---------------- disciplines ---------------- */}
      <Section>
        <H2>Audio, video, lighting and acoustics, as one system.</H2>
        <Lede>
          We specialise in all four. They are designed together and delivered by one team, so the
          picture, the light and the sound answer to the same room rather than to four separate
          contracts.
        </Lede>
        <div className="rev-avl mt-8">
          <div>
            <span style={{ fontFamily: F.serif, fontSize: "1.08rem", color: C.ink,
                           display: "block", marginBottom: 4 }}>Audio</span>
            <span style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.55, display: "block",
                           maxWidth: "26ch" }}>
              Design, installation and measured commissioning.
            </span>
          </div>
          <div>
            <span style={{ fontFamily: F.serif, fontSize: "1.08rem", color: C.ink,
                           display: "block", marginBottom: 4 }}>Video</span>
            <span style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.55, display: "block",
                           maxWidth: "26ch" }}>
              Displays, projection, camera and streaming.
            </span>
          </div>
          <div>
            <span style={{ fontFamily: F.serif, fontSize: "1.08rem", color: C.ink,
                           display: "block", marginBottom: 4 }}>Lighting</span>
            <span style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.55, display: "block",
                           maxWidth: "26ch" }}>
              Stage and architectural, with our production partners.
            </span>
          </div>
          <div>
            <span style={{ fontFamily: F.serif, fontSize: "1.08rem", color: C.ink,
                           display: "block", marginBottom: 4 }}>Acoustics</span>
            <span style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.55, display: "block",
                           maxWidth: "26ch" }}>
              Measurement, treatment and noise control.
            </span>
          </div>
        </div>
      </Section>

      {/* ---------------- direct vs reflected ---------------- */}
      <Section>
        <H2>Two sounds reach every listener.</H2>
        <Lede>
          Nearly every speech problem in a room comes down to the balance between them.
        </Lede>
        <div className="rev-two mt-8">
          <div>
            <span style={{ fontFamily: F.serif, fontSize: "1.12rem", color: C.ink,
                           display: "block", marginBottom: 6 }}>Direct sound</span>
            <p style={{ margin: 0, fontSize: 15, color: C.body, maxWidth: "44ch" }}>
              Travels straight from the loudspeaker to the ear. It carries the words, and it
              weakens the further back you sit.
            </p>
          </div>
          <div>
            <span style={{ fontFamily: F.serif, fontSize: "1.12rem", color: C.ink,
                           display: "block", marginBottom: 6 }}>Reflected sound</span>
            <p style={{ margin: 0, fontSize: 15, color: C.body, maxWidth: "44ch" }}>
              The same sound returning off walls, ceiling and floor as hundreds of overlapping
              copies, arriving slightly late. It stays strong everywhere in the room.
            </p>
          </div>
        </div>
        <p className="mt-6" style={{ color: C.body, maxWidth: "72ch" }}>
          At the back, the direct sound has faded but the reflections have not, so one word smears
          into the next. Turning up the volume raises both together. The fix is in the room and in
          the system design.
        </p>
      </Section>

      {/* ---------------- failure modes ---------------- */}
      <Section>
        <H2>The equipment is rarely at fault.</H2>
        <Lede>
          Most organisations replace their sound system two or three times before anyone measures
          the room. Each new system inherits the problem the old one had.
        </Lede>
        <ul className="mt-8" style={{ listStyle: "none", padding: 0, margin: 0, borderTop: `1px solid ${C.line}` }}>
          {FAILURES.map((f) => (
            <li key={f.title} style={{ borderBottom: `1px solid ${C.line}`, padding: "22px 0" }}>
              <h3 style={{ fontFamily: F.serif, fontWeight: 400, fontSize: "1.22rem",
                           color: C.ink, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ margin: 0, maxWidth: "68ch", color: C.body }}>{f.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------------- sectors ---------------- */}
      <Section bg={C.surface} id="sectors">
        <H2>Spaces we work in</H2>
        <Lede>
          The measurement discipline is identical in every one of these rooms. What changes is what
          the room is for, and therefore what we are optimising towards.
        </Lede>

        <div className="rev-tabs">
          {SECTORS.map(({ id, label, Icon }) => {
            const on = sector === id;
            return (
              <button key={id} onClick={() => setSector(id)} className="flex items-center"
                style={{ gap: 8, fontFamily: F.sans, fontSize: 14, fontWeight: 500,
                         padding: "10px 16px", borderRadius: 2, cursor: "pointer",
                         transition: "all .18s ease",
                         border: `1px solid ${on ? C.ink : C.line}`,
                         background: on ? C.ink : "transparent", color: on ? C.ground : C.body }}>
                <Icon size={15} strokeWidth={1.6} color={on ? C.gold : C.goldText} />
                {label}
              </button>
            );
          })}
        </div>

        <div className="rev-panel"
             style={{ border: `1px solid ${C.line}`, borderRadius: 2, background: C.ground }}>
          <div className="rev-panel-l">
            <active.Icon size={26} strokeWidth={1.4} color={C.goldText} />
            <h3 className="mt-4" style={{ fontFamily: F.serif, fontWeight: 400, fontSize: "1.5rem",
                                          lineHeight: 1.25, color: C.ink }}>{active.label}</h3>
            <p className="mt-2" style={{ color: C.body, maxWidth: "34ch" }}>{active.line}</p>
          </div>
          <div className="rev-panel-r">
            <p className="uppercase" style={{ fontFamily: F.mono, fontSize: 10.5,
                                              letterSpacing: "0.09em", color: C.goldText, marginBottom: 14 }}>
              What usually goes wrong
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {active.pains.map((p) => (
                <li key={p} className="flex" style={{ gap: 12, padding: "11px 0", borderTop: `1px solid ${C.line}` }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, flexShrink: 0,
                                 marginTop: 9, border: `1px solid ${C.gold}` }} />
                  <span style={{ color: C.body, fontSize: 15 }}>{p}</span>
                </li>
              ))}
            </ul>
            {active.avl && (
              <p style={{ margin: "16px 0 0", paddingTop: 14, fontSize: 13.5, lineHeight: 1.6,
                          color: C.muted, borderTop: `1px solid ${C.line}`, maxWidth: "62ch" }}>
                {active.avl}
              </p>
            )}
          </div>
        </div>
      </Section>

      {/* ---------------- method ---------------- */}
      <Section id="method">
        <H2>How the work is sequenced</H2>
        <Lede>
          Six stages. Each one produces a document you keep, whether or not you continue to the next.
        </Lede>

        <div className="mt-8" style={{ borderTop: `1px solid ${C.line}` }}>
          {PHASES.map((p, i) => {
            const open = phase === i;
            return (
              <div key={p.n} style={{ borderBottom: `1px solid ${C.line}` }}>
                <button onClick={() => setPhase(open ? -1 : i)} className="w-full flex items-start text-left"
                        style={{ gap: 18, padding: "20px 0", background: "transparent",
                                 border: "none", cursor: "pointer" }}>
                  <span style={{ fontFamily: F.mono, fontSize: 11, color: C.goldText,
                                 width: 26, flexShrink: 0, paddingTop: 5 }}>{p.n}</span>
                  <span className="flex-1">
                    <span style={{ fontFamily: F.serif, fontWeight: 400, fontSize: "1.25rem",
                                   color: C.ink, display: "block" }}>{p.title}</span>
                  </span>
                  <span style={{ fontFamily: F.mono, fontSize: 18, color: C.goldText,
                                 lineHeight: 1, paddingTop: 6 }}>{open ? "–" : "+"}</span>
                </button>
                {open && (
                  <div className="rev-phase-body">
                    <p style={{ color: C.body }}>{p.body}</p>
                    <div className="flex" style={{ gap: 10, marginTop: 14, padding: "14px 16px",
                                                   background: C.surface, borderRadius: 2,
                                                   borderLeft: `2px solid ${C.gold}` }}>
                      <Check size={15} strokeWidth={2} color={C.goldText} style={{ flexShrink: 0, marginTop: 4 }} />
                      <p style={{ margin: 0, fontSize: 14.5, color: C.body }}>
                        <span style={{ fontFamily: F.mono, fontSize: 12, color: C.goldText }}>YOU RECEIVE — </span>
                        {p.deliverable}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* ---------------- after handover ---------------- */}
      <Section id="care">
        <Eyebrow>Optional · annual · cancel any time</Eyebrow>
        <H2>We do not disappear at handover.</H2>
        <Lede>
          The person who signs the contract is rarely the person running the system on a Sunday
          three years later. A system drifts, staff change, firmware moves on. If you want us to
          stay involved, we offer two retainers. Neither is a condition of any project.
        </Lede>

        <div className="rev-care mt-8">
          {[
            ["Reverential Care", "Standard", "from ₹12,500 + GST a year", [
              "One annual measurement check, reverberation, gain structure and coverage compared against the handover figures",
              "Firmware and DSP updates applied and documented",
              "One remote support call each quarter",
              "Priority response when something fails",
            ]],
            ["Reverential Care", "Extended", "from ₹22,500 + GST a year", [
              "Everything in Standard",
              "Two on site visits a year",
              "Retraining whenever your operating team changes",
              "Written equipment condition report with photographs",
            ]],
          ].map(([brand, tier, price, points]) => (
            <div key={tier} style={{ border: `1px solid ${C.line}`, borderRadius: 2, padding: 24 }}>
              <p className="uppercase" style={{ fontFamily: F.mono, fontSize: 10.5,
                                                letterSpacing: "0.09em", color: C.goldText, margin: 0 }}>
                {brand}
              </p>
              <h3 style={{ fontFamily: F.serif, fontWeight: 400, fontSize: "1.5rem",
                           color: C.ink, margin: "6px 0 2px" }}>{tier}</h3>
              <p style={{ fontFamily: F.mono, fontSize: 13, color: C.body, margin: "0 0 16px" }}>
                {price}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {points.map((t) => (
                  <li key={t} className="flex" style={{ gap: 11, padding: "9px 0",
                                                        borderTop: `1px solid ${C.line}` }}>
                    <Check size={14} strokeWidth={2} color={C.gold} style={{ flexShrink: 0, marginTop: 5 }} />
                    <span style={{ color: C.body, fontSize: 14.5 }}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-6" style={{ fontFamily: F.mono, fontSize: 12.5, lineHeight: 1.9,
                                     color: C.muted, maxWidth: "70ch" }}>
          The final figure depends on the scale of the system and the travel involved. Ask about it
          on the consultation call and we will put a number against your building rather than a
          bracket.
        </p>
      </Section>

      {/* ---------------- credentials ---------------- */}
      <Section bg={C.surface} id="credentials">
        <H2>Who is doing the work</H2>
        <Lede>
          Reverential is led by Thomas Jeffrin, an audio engineer with a decade in live sound system
          engineering behind him, now working full time in acoustic design and system deployment.
          Each qualification is listed with what it lets us deliver for you.
        </Lede>

        <div className="mt-8" style={{ borderTop: `1px solid ${C.line}` }}>
          {CREDENTIALS.map(([name, issuer, delivers]) => (
            <div key={name} className="rev-cred">
              <div>
                <span style={{ fontFamily: F.serif, fontSize: "1.06rem", color: C.ink, display: "block" }}>
                  {name}
                </span>
                <span style={{ fontFamily: F.mono, fontSize: 11, color: C.goldText,
                               display: "block", marginTop: 3 }}>{issuer}</span>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 15, color: C.body, maxWidth: "58ch" }}>{delivers}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8" style={{ color: C.body, maxWidth: "72ch" }}>
          Before founding Reverential, that expertise was earned on large scale live sound systems
          across three countries. It began on the Chennai club and band circuit, in intimate
          acoustic sessions and in institutional annual day productions.
        </p>

        <p className="mt-4" style={{ color: C.body, maxWidth: "72ch" }}>
          It grew through multi-tier stadium audio for a regional cricket league in the UAE, brand
          launches staged at a skydive drop zone, in open desert and at a waterfront island
          development, and production audio in five star and above hotel properties. In Saudi
          Arabia it reached a four acre open air entertainment zone running a 250 tower distributed
          loudspeaker system over Dante and RedNet, and principal audio for a high profile
          international economic forum.
        </p>

        <p className="mt-4" style={{ color: C.body, maxWidth: "72ch" }}>
          A live sound system engineer walks into an unfamiliar room, measures it, aligns the system
          to it and makes it work before doors open. A permanent installation asks for that same
          judgement, held to a standard that has to last a decade and be run by people who were not
          there when it was built.
        </p>
      </Section>

      {/* ---------------- faq ---------------- */}
      <Section id="faq">
        <H2>Questions we are asked</H2>
        <div className="mt-8" style={{ borderTop: `1px solid ${C.line}` }}>
          {FAQS.map(([q, a], i) => {
            const open = faq === i;
            return (
              <div key={q} style={{ borderBottom: `1px solid ${C.line}` }}>
                <button onClick={() => setFaq(open ? -1 : i)} className="w-full flex items-start text-left"
                        style={{ gap: 18, padding: "18px 0", background: "transparent",
                                 border: "none", cursor: "pointer" }}>
                  <span className="flex-1" style={{ fontFamily: F.serif, fontWeight: 400,
                                                    fontSize: "1.12rem", color: C.ink, lineHeight: 1.4 }}>
                    {q}
                  </span>
                  <span style={{ fontFamily: F.mono, fontSize: 18, color: C.goldText,
                                 lineHeight: 1, paddingTop: 4 }}>{open ? "–" : "+"}</span>
                </button>
                {open && (
                  <p style={{ paddingBottom: 20, margin: 0, color: C.body, maxWidth: "74ch" }}>{a}</p>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* ---------------- booking ---------------- */}
      <section id="book" style={{ background: C.dark, borderTop: `1px solid ${C.lineDark}`, scrollMarginTop: 78 }}>
        <div className="rev-wrap rev-band">
          <div className="rev-book">

            <div>
              <Eyebrow onDark>No charge · twenty minutes · phone or WhatsApp</Eyebrow>
              <H2 onDark>Start with a free consultation.</H2>
              <Lede onDark>
                Tell us what is happening in your space. We will work out whether the problem is the
                space, the design, the installation or the way it is being operated, and tell you
                honestly if you do not need us.
              </Lede>

              <div className="rev-form">
                <div>
                  <label htmlFor="rv-name" style={labelStyle}>Your name<Req /></label>
                  <input id="rv-name" name="name" required autoComplete="name"
                         aria-invalid={attempted && !!errors.name}
                         style={fieldStyle(attempted && errors.name)}
                         value={form.name} onChange={set("name")} />
                  {attempted && errors.name && <p style={errStyle}>{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="rv-org" style={labelStyle}>Church or organisation</label>
                  <input id="rv-org" name="organisation" autoComplete="organization"
                         style={inputStyle} value={form.org} onChange={set("org")} />
                </div>
                <div className="rev-form-full">
                  <label htmlFor="rv-space" style={labelStyle}>Type of space<Req /></label>
                  <select id="rv-space" name="space" required style={inputStyle}
                          value={form.space} onChange={set("space")}>
                    <option>Church or house of worship</option>
                    <option>Auditorium or convention centre</option>
                    <option>School, college or training room</option>
                    <option>Corporate office or boardroom</option>
                    <option>Restaurant, café or hotel</option>
                    <option>Studio or production room</option>
                    <option>Home cinema or listening room</option>
                    <option>Something else</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="rv-phone" style={labelStyle}>Phone or WhatsApp<Req /></label>
                  <div className="flex" style={{ gap: 8 }}>
                    <select aria-label="Country dialling code" name="dial_code"
                            value={dial} onChange={(e) => setDial(e.target.value)}
                            style={{ ...inputStyle, width: "auto", flex: "0 0 auto", paddingRight: 8 }}>
                      {DIAL_CODES.map(([code, place]) => (
                        <option key={code} value={code}>{code} {place}</option>
                      ))}
                    </select>
                    <input id="rv-phone" name="phone" type="tel" required
                           inputMode="numeric" autoComplete="tel-national"
                           aria-invalid={attempted && !!errors.phone}
                           className="flex-1"
                           style={fieldStyle(attempted && errors.phone)}
                           value={form.phone} onChange={set("phone")} />
                  </div>
                  {attempted && errors.phone && <p style={errStyle}>{errors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="rv-email" style={labelStyle}>Email<Req /></label>
                  <input id="rv-email" name="email" type="email" required autoComplete="email"
                         aria-invalid={attempted && !!errors.email}
                         style={fieldStyle(attempted && errors.email)}
                         value={form.email} onChange={set("email")} />
                  {attempted && errors.email && <p style={errStyle}>{errors.email}</p>}
                </div>
                <div className="rev-form-full">
                  <label htmlFor="rv-message" style={labelStyle}>What is happening in the space?</label>
                  <textarea id="rv-message" name="message"
                            style={{ ...inputStyle, minHeight: 92, resize: "vertical" }}
                            value={form.message} onChange={set("message")}
                            placeholder="For example: the band is loud but the vocals get lost, and the back rows only hear echo." />
                </div>
              </div>

              <div className="flex flex-wrap items-center mt-5" style={{ gap: 12 }}>
                <Btn onDark onClick={submitConsultation} disabled={sending || (attempted && hasErrors)}>
                  {sending ? "Sending..." : sent ? "Request received" : "Request my free consultation"}
                </Btn>
                <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hello Reverential, I'd like to book the free 20 minute consultation.")}`}
                   target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                  <span className="inline-flex items-center"
                        style={{ gap: 8, fontFamily: F.sans, fontSize: 14, fontWeight: 500,
                                 padding: "11px 20px", borderRadius: 2, cursor: "pointer",
                                 border: `1px solid ${C.lineDark}`, color: C.ground }}>
                    <MessageCircle size={15} strokeWidth={1.7} color={C.goldLight} />
                    Ask on WhatsApp
                  </span>
                </a>
              </div>

              <p className="mt-4" style={{ fontSize: 13, color: sent ? C.goldLight : "#8E8375", maxWidth: "48ch" }}>
                {sent
                  ? "Thank you. Your request has reached us and we reply within one working day."
                  : attempted && hasErrors
                  ? "Please complete the fields marked with an asterisk."
                  : failed
                  ? "That did not send. Please try again, or reach us on WhatsApp."
                  : "Fields marked * are required. We reply within one working day and we do not pass your details to equipment suppliers."}
              </p>

              <p style={{ fontFamily: F.mono, fontSize: 13, color: "#B4B0A6", margin: "20px 0 0" }}>
                {PHONE_DISPLAY} &nbsp;·&nbsp; {EMAIL}
              </p>
            </div>

            <div>
              <div style={{ background: C.darkSurface, border: `1px solid ${C.lineDark}`,
                            borderRadius: 2, padding: 28 }}>
                <Download size={22} strokeWidth={1.5} color={C.goldLight} />
                <h3 className="mt-4" style={{ fontFamily: F.serif, fontWeight: 400,
                                              fontSize: "1.4rem", color: C.ground }}>
                  The 12-point sound system check
                </h3>
                <p className="mt-3" style={{ color: "#B4B0A6", maxWidth: "42ch" }}>
                  A check your own team can run this week. Coverage, gain structure, background
                  noise from fans and air conditioning, and the four things that most often go wrong
                  in Indian buildings. No charge, no visit needed.
                </p>
                <div className="mt-5" style={{ display: "grid", gap: 12, maxWidth: 380 }}>
                  <div>
                    <label htmlFor="rv-checklist-email" style={labelStyle}>Email<Req /></label>
                    <input id="rv-checklist-email" name="checklist_email" type="email" required
                           autoComplete="email" placeholder="you@example.com"
                           aria-invalid={checklistAttempted && !!checklistError}
                           style={fieldStyle(checklistAttempted && checklistError)}
                           value={checklistEmail}
                           onChange={(e) => setChecklistEmail(e.target.value)} />
                    {checklistAttempted && checklistError && <p style={errStyle}>{checklistError}</p>}
                  </div>
                  <div><Btn onDark variant="ghost" onClick={submitChecklist}>
                    {checklistSent ? "On its way" : "Send me the checklist"}
                  </Btn></div>
                </div>
              </div>

              <div className="mt-6" style={{ border: `1px solid ${C.lineDark}`, borderRadius: 2, padding: 24 }}>
                <p className="uppercase" style={{ fontFamily: F.mono, fontSize: 10.5,
                                                  letterSpacing: "0.09em", color: C.goldLight, marginBottom: 12 }}>
                  What a full site survey covers
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {["Reverberation time measured by frequency band, at several seating positions",
                    "Speech clarity (STI — Speech Transmission Index) at front, middle and rear",
                    "Background noise survey — air conditioning, fans, traffic",
                    "Loudspeaker coverage checked against the real seating layout",
                    "Written report with prioritised recommendations and budget ranges"].map((t) => (
                    <li key={t} className="flex" style={{ gap: 11, padding: "9px 0", borderTop: `1px solid ${C.lineDark}` }}>
                      <Check size={14} strokeWidth={2} color={C.gold} style={{ flexShrink: 0, marginTop: 5 }} />
                      <span style={{ color: "#B4B0A6", fontSize: 14.5 }}>{t}</span>
                    </li>
                  ))}
                </ul>
                <p style={{ fontFamily: F.mono, fontSize: 11.5, lineHeight: 1.85, color: "#8E8375",
                            margin: "18px 0 0", paddingTop: 16, borderTop: `1px solid ${C.lineDark}` }}>
                  The report is written by the engineer who took the measurements. No templates, no
                  generated copy. The survey fee is adjusted in full against any project that follows.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------- footer ---------------- */}
      <footer style={{ background: C.dark, borderTop: `1px solid ${C.lineDark}` }}>
        <div className="rev-wrap rev-foot-pad">
          <img src={LOGO_FOOTER} alt="Reverential — AV Acoustics Integration"
               style={{ height: 92, width: "auto", display: "block", marginBottom: 26 }} />
          <div className="rev-foot">
            <div>
              <h4 style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 13.5, color: C.ground, marginBottom: 8 }}>
                Reverential AV Integration Private Limited
              </h4>
              <p style={{ fontSize: 13.5, color: "#8E8375", maxWidth: "30ch", margin: 0 }}>
                We find the real problem before we design the solution.
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 13.5, color: C.ground, marginBottom: 8 }}>
                Spaces
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {SECTORS.map((s) => (
                  <li key={s.id} style={{ marginBottom: 5 }}>
                    <a href="#sectors" onClick={(e) => pickSector(e, s.id)}
                       style={{ fontSize: 13.5, color: "#B4B0A6", textDecoration: "none", cursor: "pointer" }}>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 13.5, color: C.ground, marginBottom: 8 }}>
                Contact
              </h4>
              <p style={{ fontSize: 13.5, margin: "0 0 5px" }}>
                <a href={`tel:+${WHATSAPP}`} style={{ color: "#B4B0A6", textDecoration: "none" }}>
                  {PHONE_DISPLAY}
                </a>
              </p>
              <p style={{ fontSize: 13.5, margin: "0 0 5px" }}>
                <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"
                   style={{ color: "#B4B0A6", textDecoration: "none" }}>WhatsApp</a>
              </p>
              <p style={{ fontSize: 13.5, margin: "0 0 5px" }}>
                <a href={`mailto:${EMAIL}`} style={{ color: "#B4B0A6", textDecoration: "none" }}>{EMAIL}</a>
              </p>
              <p style={{ fontSize: 13.5, margin: 0 }}>
                <a href={`https://${SITE}`} target="_blank" rel="noreferrer"
                   style={{ color: "#B4B0A6", textDecoration: "none" }}>{SITE}</a>
              </p>
              <div className="flex flex-wrap items-center mt-4" style={{ gap: 8 }}>
                {SOCIALS.map(([name, url]) => (
                  <a key={name} href={url} target="_blank" rel="noreferrer noopener"
                     aria-label={`Reverential on ${name}`}
                     className="rev-social inline-flex items-center uppercase"
                     style={{ fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.09em",
                              padding: "6px 10px", borderRadius: 2, textDecoration: "none",
                              border: `1px solid ${C.lineDark}`, color: "#B4B0A6" }}>
                    {name}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 13.5, color: C.ground, marginBottom: 8 }}>
                Based in
              </h4>
              <p style={{ fontSize: 13.5, color: "#B4B0A6", maxWidth: "30ch", margin: 0 }}>
                Chennai and Bengaluru, working across Tamil Nadu, Kerala and Karnataka, with
                Andhra Pradesh and Telangana covered from Bengaluru. Projects elsewhere in India
                and in the Gulf taken on merit.
              </p>
            </div>
          </div>

          <div className="mt-10 pt-6" style={{ borderTop: `1px solid ${C.lineDark}`, fontFamily: F.mono,
                                               fontSize: 11, color: "#6B6A67", lineHeight: 1.9 }}>
            REVERENTIAL™ and REVERENTIAL AV™ are trade marks of Reverential AV Integration Private
            Limited. Trade mark applications pending in India.<br />
            Company registration in progress. CIN and GSTIN will be published here once issued.<br />
            © {new Date().getFullYear()} Reverential AV Integration Private Limited.
          </div>
        </div>
      </footer>
    </div>
  );
}
