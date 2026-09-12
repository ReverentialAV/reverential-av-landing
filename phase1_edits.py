#!/usr/bin/env python3
"""
Phase 1 edit script for Reverential src.jsx.
Every edit must match its target string exactly ONE time. If a match count
is not exactly 1, the script aborts before writing anything, per the
non-negotiable build rule: "every replace must have count == 1, script
aborts otherwise."

Freshly authored this session — the original Phase 0 edit script and its
137+113 regression suite were not recoverable (they lived only in a prior
session's container, which does not persist). This script covers the
change set defined in /areas/reverential-website-build-phase1-spec.md.

NOTE: Change 6 (locked vocabulary, Section 5 / Failure Modes six-instance
pattern) is NOT included here. The spec's locked wording for that section
does not match any content actually present in src.jsx (see README_FLAGS.md
for it and one addressed to memory update). Applying it here would mean
either inventing 6 failure-mode paragraphs from a one-line pattern
description, or silently overwriting the 4 existing FAILURES entries
with content that doesn't match what's on file — both violate the
"never invent data" integrity rule. That change is deliberately held out
pending your direction.
"""
import sys

PATH = "src.jsx"

with open(PATH, "r", encoding="utf-8") as f:
    src = f.read()

edits = []  # list of (label, old, new)

# ---------------------------------------------------------------- Change 2
# AVL full 7-sector breakdown. Restructure `avl:` from a single "Also
# delivered here" sentence into a structured Audio/Video/Lighting/
# Acoustics/Control object per sector, and update the render.

AVL_DATA = {
    "churches": {
        "Audio": "Line array and distributed speaker systems, wireless microphone systems, digital mixing consoles, in-ear monitor systems, feedback elimination through EQ and speaker placement, SMAART-verified system tuning",
        "Video": "PTZ cameras, multi-camera live switching, YouTube/Facebook streaming, OBS and encoder configuration, LED video walls, projection and screen systems, lyric and presentation software integration",
        "Lighting": "Stage and platform lighting, DMX programming, architectural and altar lighting, LED fixture installation, haze and effects for contemporary worship",
        "Acoustics": "RT60 measurement and reverberation control, acoustic panel design and installation, bass management, STI speech intelligibility verification",
        "Control": "Dante/AES67 audio networking, scheduled automation, single-operator simplified control interfaces",
    },
    "auditoriums": {
        "Audio": "Main hang and delay fill systems, stage monitoring, digital FOH consoles, broadcast mix feed, hearing assistance, delay calibration, feedback elimination",
        "Video": "FOH and stage confidence displays, multi-camera recording/streaming, LED video walls, projection, IMAG",
        "Lighting": "Front wash, follow spots, overhead grid, DMX programming, theatrical/concert lighting, house/emergency integration",
        "Acoustics": "Acoustic simulation against seating plan, RT60 targeting, panel/diffuser specification, background noise measurement",
        "Control": "Show control/cue systems, centralised AV control, remote management",
    },
    "education": {
        "Audio": "Lecture hall PA, ceiling speaker distribution, wireless mics for lecturers, conference/seminar audio, feedback elimination",
        "Video": "Laser projectors, interactive flat panels, lecture capture/recording, video conferencing, digital signage",
        "Lighting": "Energy-efficient LED, auditorium/multipurpose lighting, zoned control",
        "Acoustics": "Background noise assessment, speech clarity for learning, noise reduction between spaces",
        "Control": "One-touch interfaces for non-technical staff, scheduled automation",
    },
    "corporate": {
        "Audio": "Boardroom/conference audio, ceiling/surface speakers, beamforming/boundary mics, Teams/Zoom/Webex certified, all-hands PA, feedback elimination",
        "Video": "Video walls, large-format displays, video conferencing systems, wireless presentation, digital signage, hybrid meeting infrastructure",
        "Lighting": "Boardroom/presentation lighting, architectural/ambient, circadian-tuned LED, zoned scene control",
        "Acoustics": "Speech intelligibility in meeting rooms, acoustic privacy between spaces, reverberation control",
        "Control": "One-touch room control (Crestron/Q-SYS/AMX compatible), remote IT management, scheduled automation",
    },
    "hospitality": {
        "Audio": "Zoned background music, restaurant/lobby/poolside/ballroom audio, event PA, outdoor speakers, feedback elimination for event use",
        "Video": "Digital signage, ballroom projection/LED walls, outdoor displays, IP TV distribution",
        "Lighting": "Ambient/accent/event lighting, façade and landscape, DMX-controlled event lighting for banquets",
        "Acoustics": "Noise control between dining/event spaces, ambient level management, outdoor sound containment",
        "Control": "Property management integration, scheduled zone programming, staff-operable interfaces",
    },
    "studios": {
        "Audio": "Studio monitor placement/calibration, recording chain design, talkback/headphone distribution, acoustic isolation, Dante-networked recording",
        "Video": "Multi-camera rigs, green screen/virtual production, streaming/broadcast output, video switching/recording",
        "Lighting": "Studio lighting for video, colour-accurate LED panels, DMX-controlled broadcast setups",
        "Acoustics": "Full acoustic design: absorption, diffusion, bass trapping, flutter echo elimination, RT60 targeting for recording vs podcast vs broadcast",
        "Control": "DAW integration, hardware/software routing, remote recording over network",
    },
    "residential": {
        "Audio": "Home theatre surround, whole-home multi-room audio, outdoor/poolside speakers, high-fidelity listening rooms",
        "Video": "Home theatre projection/screens, 4K display, media server/streaming integration",
        "Lighting": "Smart lighting control, home theatre scene lighting, landscape/architectural, home automation integration",
        "Acoustics": "Home theatre acoustic treatment, dedicated listening room design, soundproofing between spaces",
        "Control": "Single-app smart home (Control4/Savant/KNX compatible), voice control, scheduled scenes",
    },
}

OLD_AVL_LINES = {
    "churches": '    avl: "Also delivered here: camera, switching and streaming video, presentation and lyric playback for the tech team, and stage lighting that suits a band set and a traditional service equally." },',
    "auditoriums": '    avl: "Also delivered here: projection and LED wall, stage and house lighting, and the control system that ties them together." },',
    "education": '    avl: "Also delivered here: lecture capture and streaming video, displays, and lighting for halls and lecture theatres." },',
    "corporate": '    avl: "Also delivered here: conference cameras and displays, digital signage, and meeting room lighting control." },',
    "hospitality": '    avl: "Also delivered here: display and menu screens, and lighting scenes that change with the time of day." },',
    "studios": '    avl: "Also delivered here: camera, switching and streaming video, with key and background lighting designed for it." },',
    "residential": '    avl: "Also delivered here: projection or LED display, picture calibration, and cinema lighting scenes." },',
}

def js_str(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')

for sid, fields in AVL_DATA.items():
    old = OLD_AVL_LINES[sid]
    pairs = ", ".join(f'["{k}", "{js_str(v)}"]' for k, v in fields.items())
    new = f'    avl: [{pairs}], }},'
    edits.append((f"avl-breakdown-{sid}", old, new))

# Update the render: active.avl is now an array of [label, text] pairs,
# not a single string. Render each as a labeled line instead of one <p>.
old_avl_render = '''            {active.avl && (
              <p style={{ margin: "16px 0 0", paddingTop: 14, fontSize: 13.5, lineHeight: 1.6,
                          color: C.muted, borderTop: `1px solid ${C.line}`, maxWidth: "62ch" }}>
                {active.avl}
              </p>
            )}'''
new_avl_render = '''            {active.avl && (
              <div style={{ margin: "16px 0 0", paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
                <p className="uppercase" style={{ fontFamily: F.mono, fontSize: 10.5,
                                                  letterSpacing: "0.09em", color: C.goldText, marginBottom: 10 }}>
                  Also delivered here
                </p>
                {active.avl.map(([label, text]) => (
                  <p key={label} style={{ margin: "0 0 8px", fontSize: 13.5, lineHeight: 1.6,
                                          color: C.muted, maxWidth: "62ch" }}>
                    <strong style={{ color: C.body, fontWeight: 600 }}>{label}:</strong> {text}
                  </p>
                ))}
              </div>
            )}'''
edits.append(("avl-render-update", old_avl_render, new_avl_render))

# ---------------------------------------------------------------- Change 1
# Thomas's testimony panel, churches only, inserted after the sectors panel
old_panel_close = '''            {active.avl && (
              <div style={{ margin: "16px 0 0", paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
                <p className="uppercase" style={{ fontFamily: F.mono, fontSize: 10.5,
                                                  letterSpacing: "0.09em", color: C.goldText, marginBottom: 10 }}>
                  Also delivered here
                </p>
                {active.avl.map(([label, text]) => (
                  <p key={label} style={{ margin: "0 0 8px", fontSize: 13.5, lineHeight: 1.6,
                                          color: C.muted, maxWidth: "62ch" }}>
                    <strong style={{ color: C.body, fontWeight: 600 }}>{label}:</strong> {text}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>'''

TESTIMONY_BODY = """I grew up in church. My father has been a church committee member my whole life, and I have been involved since I was old enough to carry a cable. I played drums and Roland SPD-30 in worship, picked up acoustic guitar and sang, served as head of the youth fellowship, and still do — and I am the technical support for my own church today.

I studied audio engineering in the first place to serve the church.

Church music is the genre I love most. The sanctuary is the room I know best after my own home.

I started Reverential because I watched churches being served by contractors who would walk in, sell you as much equipment as they could, move boxes, install without any real understanding of what a church needs or any conviction about why it matters — and walk away. No measurement. No accountability. No purpose behind the work beyond the invoice.

Every congregation deserves to be served — not sold to. We named this company Reverential because that is exactly what it means: a deep reverence toward God, toward the Church, and toward every person who walks through those doors to worship. That is not a positioning statement. It is the reason this work exists."""

testimony_paragraphs = "\n".join(
    f'''                <p className="mt-4" style={{{{ color: C.body, maxWidth: "70ch" }}}}>
                  {js_str(p)}
                </p>''' for p in TESTIMONY_BODY.split("\n\n")
)

new_panel_close = f'''            {{active.avl && (
              <div style={{{{ margin: "16px 0 0", paddingTop: 14, borderTop: `1px solid ${{C.line}}` }}}}>
                <p className="uppercase" style={{{{ fontFamily: F.mono, fontSize: 10.5,
                                                  letterSpacing: "0.09em", color: C.goldText, marginBottom: 10 }}}}>
                  Also delivered here
                </p>
                {{active.avl.map(([label, text]) => (
                  <p key={{label}} style={{{{ margin: "0 0 8px", fontSize: 13.5, lineHeight: 1.6,
                                          color: C.muted, maxWidth: "62ch" }}}}>
                    <strong style={{{{ color: C.body, fontWeight: 600 }}}}>{{label}}:</strong> {{text}}
                  </p>
                ))}}
              </div>
            )}}
          </div>
        </div>

        {{active.id === "churches" && (
          <div className="mt-8" style={{{{ border: `1px solid ${{C.line}}`, borderRadius: 2,
                                        background: C.ground, padding: 28 }}}}>
            <Eyebrow>Why churches come first</Eyebrow>
{testimony_paragraphs}
            <p className="mt-4" style={{{{ color: C.body, maxWidth: "70ch" }}}}>
              — Thomas Jeffrin, Founder
            </p>
          </div>
        )}}
      </Section>'''

edits.append(("testimony-panel", old_panel_close, new_panel_close))

# ---------------------------------------------------------------- Change 3
# Reverential Care — pricing removed
old_care = '''        <div className="rev-care mt-8">
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
        </p>'''

new_care = '''        <div className="rev-care mt-8">
          {[
            ["Reverential Care", "Standard", [
              "One annual measurement check, reverberation, gain structure and coverage compared against the handover figures",
              "Firmware and DSP updates applied and documented",
              "One remote support call each quarter",
              "Priority response when something fails",
            ]],
            ["Reverential Care", "Extended", [
              "Everything in Standard",
              "Two on site visits a year",
              "Retraining whenever your operating team changes",
              "Written equipment condition report with photographs",
            ]],
          ].map(([brand, tier, points]) => (
            <div key={tier} style={{ border: `1px solid ${C.line}`, borderRadius: 2, padding: 24 }}>
              <p className="uppercase" style={{ fontFamily: F.mono, fontSize: 10.5,
                                                letterSpacing: "0.09em", color: C.goldText, margin: 0 }}>
                {brand}
              </p>
              <h3 style={{ fontFamily: F.serif, fontWeight: 400, fontSize: "1.5rem",
                           color: C.ink, margin: "6px 0 16px" }}>{tier}</h3>
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
          Priced to the scale of the system. We quote each retainer against the actual system
          installed. Ask on your consultation call.
        </p>
        <p className="mt-2" style={{ fontFamily: F.mono, fontSize: 12.5, lineHeight: 1.9,
                                     color: C.muted, maxWidth: "70ch" }}>
          Each Care client receives a dedicated support portal for fault logging, warranty tracking
          and service history.
        </p>'''

edits.append(("care-pricing-removed", old_care, new_care))

# ---------------------------------------------------------------- Change 4
# FAQ 7th entry
old_faq_close = '''  ["Where do you work?",
   "Based in Chennai and Bengaluru, we work across Tamil Nadu, Kerala and Karnataka, from the capital cities down through Coimbatore, Trichy, Madurai and the Nagercoil and Kanniyakumari belt, and across Kochi, Thiruvananthapuram and the wider Kerala coast. Andhra Pradesh, Telangana and Hyderabad are covered from Bengaluru. Projects elsewhere in India are taken on merit, as are Gulf projects. Travel and stay are quoted separately and openly."],
];'''

new_faq_close = '''  ["Where do you work?",
   "Based in Chennai and Bengaluru, we work across Tamil Nadu, Kerala and Karnataka, from the capital cities down through Coimbatore, Trichy, Madurai and the Nagercoil and Kanniyakumari belt, and across Kochi, Thiruvananthapuram and the wider Kerala coast. Andhra Pradesh, Telangana and Hyderabad are covered from Bengaluru. Projects elsewhere in India are taken on merit, as are Gulf projects. Travel and stay are quoted separately and openly."],
  ["What if something fails before a service or event?",
   "Call or WhatsApp +91 99622 32223 directly. We will diagnose the fault on the call and tell you within minutes whether it is fixable remotely. If we need to be on site, we will tell you honestly how fast we can get there. Audio failures before a Sunday service, a conference or a feast day are exactly what this number is for."],
];'''

edits.append(("faq-emergency-entry", old_faq_close, new_faq_close))

# ---------------------------------------------------------------- Change 5
# Floating WhatsApp button
old_end = '''      </footer>
    </div>
  );
}'''

new_end = '''      </footer>

      <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"
         aria-label="Chat with us on WhatsApp"
         title="We're here — day or night"
         style={{ position: "fixed", bottom: 24, right: 24, zIndex: 60,
                  width: 56, height: 56, borderRadius: "50%",
                  background: C.dark, border: `2px solid ${C.gold}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.35)", textDecoration: "none" }}>
        <MessageCircle size={26} strokeWidth={1.8} color="#FFFFFF" />
      </a>
    </div>
  );
}'''

edits.append(("whatsapp-floating-button", old_end, new_end))

# ---------------------------------------------------------------- apply
# Edits are checked and applied sequentially (not pre-checked as a batch)
# because later edits (e.g. testimony-panel) target text produced by
# earlier edits (e.g. avl-render-update). If any edit's count != 1 at the
# point it runs, abort and write nothing.

working = src
applied_log = []
for label, old, new in edits:
    count = working.count(old)
    if count != 1:
        print(f"ABORT at edit '{label}': matched {count} times (expected exactly 1). "
              f"No changes written. Edits applied before this point: {[l for l, *_ in applied_log]}",
              file=sys.stderr)
        sys.exit(1)
    working = working.replace(old, new, 1)
    applied_log.append((label,))
    print(f"applied: {label}")

with open(PATH, "w", encoding="utf-8") as f:
    f.write(working)

print(f"\n{len(edits)} edits applied successfully to {PATH}")
