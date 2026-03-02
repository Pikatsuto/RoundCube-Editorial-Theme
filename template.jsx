import { useState, useRef, useEffect } from "react";
import {
  Inbox, FileEdit, Send, AlertTriangle, Trash2, Archive, Folder, FolderOpen,
  ChevronRight, ChevronDown, Reply, ReplyAll, Forward, Trash, MoreHorizontal,
  Star, Paperclip, Search, Menu, Settings, Moon, RefreshCw, CheckSquare, SlidersHorizontal,
  ChevronLeft, Mail, BookUser, ArrowLeft,
  MoreVertical, Pen, Check, Repeat2
} from "lucide-react";

/*
 * ROUNDCUBE "GUILLOU" v4
 * 
 * Fixes:
 *   - Phone/Tablet: proper sizing, no zoom needed
 *   - Tablet: 2 columns (sidebar+list OR list+content), mail = fullscreen
 *   - Logo: "R." for Roundcube (not "G.")
 *   - Title/Logo font: Source Serif 4
 *   - Body font: Source Sans 3
 *   - Mono: Source Code Pro
 *   - TRUE BLACK palette from gabriel-guillou.fr
 */

const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600;700&family=Source+Code+Pro:wght@400;500&display=swap";
fontLink.rel = "stylesheet";
if (!document.querySelector('link[href*="Source+Serif"]')) document.head.appendChild(fontLink);

const C = {
  bg: "#0a0a0a", bgMenu: "#050505", bgSidebar: "#0e0e12", bgList: "#0a0a0a",
  bgContent: "#0a0a0a", bgHeader: "#141418", bgHover: "#16161e", bgActive: "#1a1a28",
  bgSelected: "#1c1c2e", bgInput: "#111116",
  text: "#f5f5f5", textSec: "#888898", textDim: "#55556a", textMuted: "#3a3a4a",
  accent: "#5b9bd5", accentHov: "#6fb0e8", accentDim: "#5b9bd520",
  danger: "#e05050", success: "#4caf7d", warning: "#e5a44d",
  border: "#1a1a24", borderMed: "#252530",
  serif: "'Source Serif 4', Georgia, serif",
  sans: "'Source Sans 3', -apple-system, sans-serif",
  mono: "'Source Code Pro', Consolas, monospace",
};

const IDENTITIES = [
  { id: 1, name: "Gabriel Guillou", email: "gabriel@guillou.dev", active: true },
  { id: 2, name: "Gabriel Guillou", email: "contact@gabriel-guillou.fr" },
  { id: 3, name: "Admin Infra", email: "admin@infra.guillou.dev" },
];

const FOLDERS = [
  { id: "INBOX", name: "Boîte de réception", icon: Inbox, unread: 12 },
  { id: "Drafts", name: "Brouillons", icon: FileEdit, unread: 2 },
  { id: "Sent", name: "Envoyés", icon: Send, unread: 0 },
  { id: "Junk", name: "Indésirables", icon: AlertTriangle, unread: 3 },
  { id: "Trash", name: "Corbeille", icon: Trash2, unread: 0 },
  { id: "Archive", name: "Archives", icon: Archive, unread: 0 },
  {
    id: "Projets", name: "Projets", icon: Folder, unread: 4,
    children: [
      {
        id: "Projets.uni-dash", name: "uni-dash", icon: Folder, unread: 2,
        children: [
          { id: "Projets.uni-dash.deploy", name: "Déploiement", icon: Folder, unread: 1 },
          { id: "Projets.uni-dash.monitoring", name: "Monitoring", icon: Folder, unread: 0 },
          { id: "Projets.uni-dash.issues", name: "Issues", icon: Folder, unread: 1 },
        ],
      },
      {
        id: "Projets.astral-emu", name: "astral-emu", icon: Folder, unread: 1,
        children: [
          { id: "Projets.astral-emu.builds", name: "Builds", icon: Folder, unread: 1 },
          { id: "Projets.astral-emu.testing", name: "Testing", icon: Folder, unread: 0 },
        ],
      },
      { id: "Projets.centrarr", name: "centrarr", icon: Folder, unread: 1 },
      { id: "Projets.isol-app", name: "isol-app", icon: Folder, unread: 0 },
    ],
  },
  {
    id: "Infra", name: "Infrastructure", icon: Folder, unread: 1,
    children: [
      { id: "Infra.alertes", name: "Alertes", icon: Folder, unread: 1 },
      { id: "Infra.backups", name: "Backups", icon: Folder, unread: 0 },
      { id: "Infra.réseau", name: "Réseau", icon: Folder, unread: 0 },
    ],
  },
];

const EMAILS = [
  { id:1, from:"Forgejo CI", subject:"[uni-dash] Pipeline #847 passed ✓", date:"10:42", preview:"Build completed. All 24 tests passed. Image pushed…", unread:true, flagged:true, attachment:false },
  { id:2, from:"Coolify Alerts", subject:"⚠ High CPU usage on node-03", date:"09:18", preview:"CPU exceeded 85% on node-03. Load: 92%…", unread:true, flagged:false, attachment:false },
  { id:3, from:"Lucas Martin", subject:"Re: Architecture K3s pour le cluster", date:"Hier", preview:"Salut, j'ai regardé ta proposition pour Longhorn…", unread:true, flagged:false, attachment:true },
  { id:4, from:"GitHub", subject:"[Pikatsuto/astral-emu] ARM64 build failing", date:"Hier", preview:"New issue: ARM64 build fails during kernel compile…", unread:true, flagged:false, attachment:false },
  { id:5, from:"OVH Cloud", subject:"Votre facture #FR-2026-03-001", date:"Hier", preview:"Facture 01/02 – 28/02. Montant : 47,88€ HT…", unread:false, flagged:false, attachment:true },
  { id:6, from:"Proxmox Backup", subject:"Backup report: 3/3 VMs OK", date:"1 mars", preview:"daily-vms completed. 128.4 GiB, 23min…", unread:false, flagged:true, attachment:false },
  { id:7, from:"Sophie Durand", subject:"Re: Retour sur l'API auth", date:"1 mars", preview:"On a intégré les modifications WebAuthn…", unread:false, flagged:false, attachment:false },
  { id:8, from:"Let's Encrypt", subject:"Cert expiry *.guillou.dev — 14j", date:"28 fév", preview:"Certificate expires in 14 days…", unread:false, flagged:false, attachment:false },
  { id:9, from:"Grafana", subject:"[RESOLVED] Disk space /data", date:"28 fév", preview:"Resolved: /data 72% (was 94%)…", unread:false, flagged:false, attachment:false },
  { id:10, from:"Pierre Lefèvre", subject:"Proposition collab DevOps", date:"27 fév", preview:"J'ai vu votre portfolio et projets…", unread:false, flagged:false, attachment:true },
];

const MSG = {
  from: "Forgejo CI", fromEmail: "ci@git.guillou.dev", to: "gabriel@guillou.dev",
  subject: "[uni-dash] Pipeline #847 passed ✓", date: "2 mars 2026, 10:42",
  body: `Pipeline #847 for uni-dash completed successfully.

Branch: main
Commit: a3f7c2e — "feat: add cluster health endpoint"
Author: Gabriel Guillou <gabriel@guillou.dev>

Build Summary:
  ✓ Lint .............. 12s
  ✓ Unit Tests ....... 45s (24/24 passed)
  ✓ Integration ...... 1m23s
  ✓ Docker Build ..... 2m07s
  ✓ Push Registry .... 18s

Image: registry.guillou.dev/uni-dash:latest
Digest: sha256:8f3a9b2c…

Total duration: 4m45s

---
Forgejo CI — git.guillou.dev`,
};

/* ── Identity Switch ── */
function IdSwitch({ identities, onSwitch, compact }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = identities.find(i => i.active);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: compact ? 4 : 5, background: "none",
        border: `1px solid ${C.border}`, borderRadius: 4, color: C.textSec,
        padding: compact ? "5px 8px" : "4px 8px", cursor: "pointer", fontFamily: C.mono,
        fontSize: compact ? 11 : 10,
      }}>
        <Repeat2 size={compact ? 12 : 11} />
        <span style={{ maxWidth: compact ? 180 : 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{active?.email}</span>
        <ChevronDown size={compact ? 11 : 10} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", right: 0, minWidth: 280,
          background: C.bgHeader, border: `1px solid ${C.borderMed}`, borderRadius: 6,
          boxShadow: "0 12px 48px rgba(0,0,0,.8)", zIndex: 1000,
        }}>
          <div style={{ padding: "8px 12px", fontSize: 9, fontFamily: C.mono, color: C.textDim, textTransform: "uppercase", letterSpacing: ".1em", borderBottom: `1px solid ${C.border}` }}>
            Identity Switch
          </div>
          {identities.map(id => (
            <button key={id.id} onClick={() => { onSwitch(id.id); setOpen(false); }} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px",
              background: id.active ? C.accentDim : "transparent", border: "none", cursor: "pointer",
              textAlign: "left", color: C.text,
            }}
              onMouseEnter={e => { if (!id.active) e.currentTarget.style.background = C.bgHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = id.active ? C.accentDim : "transparent"; }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: id.active ? C.accent : C.borderMed,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: id.active ? "#000" : C.textSec, fontSize: 11, fontFamily: C.serif, fontWeight: 700,
              }}>{id.name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontFamily: C.sans, fontWeight: id.active ? 600 : 400 }}>{id.name}</div>
                <div style={{ fontSize: 11, fontFamily: C.mono, color: C.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{id.email}</div>
              </div>
              {id.active && <Check size={13} color={C.accent} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Folder Tree ── */
function FolderTree({ folders, depth = 0, activeId, onSelect, fontSize = 13 }) {
  return (
    <ul id={depth === 0 ? "mailboxlist" : undefined} className="treelist listing folderlist"
      role={depth === 0 ? "tree" : "group"} style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {folders.map(f => <FolderNode key={f.id} f={f} depth={depth} activeId={activeId} onSelect={onSelect} fontSize={fontSize} />)}
    </ul>
  );
}

function FolderNode({ f, depth, activeId, onSelect, fontSize }) {
  const [exp, setExp] = useState(f.id === "Projets" || f.id === "Projets.uni-dash");
  const kids = f.children?.length > 0;
  const act = activeId === f.id;
  const Icon = act && kids && exp ? FolderOpen : f.icon;
  const iconSz = fontSize <= 13 ? 15 : 17;

  return (
    <li className={`mailbox${act ? " selected" : ""}${kids ? (exp ? " expanded" : " collapsed") : ""}`} role="treeitem">
      <a href={`#${f.id}`} onClick={e => { e.preventDefault(); onSelect(f.id); }} style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: `${fontSize <= 13 ? 6 : 9}px 10px ${fontSize <= 13 ? 6 : 9}px ${10 + depth * 16}px`,
        color: act ? C.accent : C.text, background: act ? C.bgActive : "transparent",
        borderLeft: act ? `2px solid ${C.accent}` : "2px solid transparent",
        textDecoration: "none", fontSize, fontFamily: C.sans,
        fontWeight: f.unread > 0 ? 600 : 400, cursor: "pointer", transition: "background .1s",
      }}
        onMouseEnter={e => { if (!act) e.currentTarget.style.background = C.bgHover; }}
        onMouseLeave={e => { e.currentTarget.style.background = act ? C.bgActive : "transparent"; }}
      >
        {kids && (
          <span onClick={e => { e.preventDefault(); e.stopPropagation(); setExp(!exp); }}
            style={{ cursor: "pointer", color: C.textDim, width: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {exp ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>
        )}
        <Icon size={iconSz} style={{ color: act ? C.accent : C.textDim, flexShrink: 0 }} />
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
        {f.unread > 0 && (
          <span style={{
            background: C.accent, color: "#000", fontSize: fontSize <= 13 ? 9 : 10, fontFamily: C.mono,
            fontWeight: 700, padding: "1px 5px", borderRadius: 10, minWidth: 16, textAlign: "center",
          }}>{f.unread}</span>
        )}
      </a>
      {kids && exp && <FolderTree folders={f.children} depth={depth + 1} activeId={activeId} onSelect={onSelect} fontSize={fontSize} />}
    </li>
  );
}

/* ── Toolbar Btn ── */
function TBtn({ Ic, label, size = 14, sz = 32 }) {
  return (
    <a title={label} style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      width: sz, height: sz, borderRadius: 5, color: C.textDim, cursor: "pointer", transition: "all .1s",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = C.bgHover; e.currentTarget.style.color = C.text; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textDim; }}
    ><Ic size={size} /></a>
  );
}

/* ══════ MAIN ══════ */
export default function App() {
  const [folder, setFolder] = useState("INBOX");
  const [msg, setMsg] = useState(null);
  const [ids, setIds] = useState(IDENTITIES);
  const [screen, setScreen] = useState("desktop");

  // Panel navigation for phone & tablet
  // phone: "sidebar" | "list" | "content"
  // tablet: "sidebar-list" | "list-content"
  const [phonePanel, setPhonePanel] = useState("list");
  const [tabletView, setTabletView] = useState("sidebar-list"); // sidebar-list | list-content

  const mob = screen === "phone";
  const tab = screen === "tablet";
  const desk = screen === "desktop";

  const switchId = id => setIds(ids.map(i => ({ ...i, active: i.id === id })));

  const selectMsg = id => {
    setMsg(id);
    if (mob) setPhonePanel("content");
    if (tab) setTabletView("list-content");
  };

  const backToList = () => {
    if (mob) { setPhonePanel("list"); setMsg(null); }
    if (tab) { setTabletView("sidebar-list"); setMsg(null); }
  };

  // Responsive container sizing — FILL the preview area, no zooming
  const containerStyle = mob
    ? { width: "100%", maxWidth: 430, height: "min(92vh, 860px)", margin: "8px auto" }
    : tab
      ? { width: "100%", maxWidth: 860, height: "min(92vh, 1050px)", margin: "8px auto" }
      : { width: "100%", maxWidth: 1440, height: "calc(100vh - 48px)" };

  return (
    <div style={{ background: "#000", minHeight: "100vh", fontFamily: C.sans }}>
      {/* Device bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "8px 12px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
        <span style={{ fontFamily: C.serif, fontSize: 15, fontWeight: 700, color: C.text }}>
          Roundcube<span style={{ color: C.accent }}>.</span>
        </span>
        <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: ".08em" }}>Theme Preview</span>
        <div style={{ display: "flex", gap: 3 }}>
          {["desktop", "tablet", "phone"].map(s => (
            <button key={s} onClick={() => { setScreen(s); setMsg(null); setPhonePanel("list"); setTabletView("sidebar-list"); }} style={{
              padding: "4px 12px", borderRadius: 3, border: `1px solid ${screen === s ? C.accent : C.border}`,
              background: screen === s ? C.accentDim : "transparent", color: screen === s ? C.accent : C.textDim,
              fontFamily: C.mono, fontSize: 9, cursor: "pointer", textTransform: "uppercase",
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Roundcube container */}
      <div style={{
        ...containerStyle,
        border: mob || tab ? `1px solid ${C.border}` : "none",
        borderRadius: mob ? 20 : tab ? 12 : 0,
        overflow: "hidden", background: C.bg,
      }}>
        <div id="layout" style={{ display: "flex", height: "100%", overflow: "hidden" }}>

          {/* ═══ #layout-menu ═══ */}
          {!mob && (
            <div id="layout-menu" style={{
              width: tab ? 48 : 52, minWidth: tab ? 48 : 52, background: C.bgMenu,
              borderRight: `1px solid ${C.border}`,
              display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 10, gap: 2,
            }}>
              <div id="logo" style={{ fontFamily: C.serif, fontSize: tab ? 15 : 16, fontWeight: 700, color: C.text, marginBottom: 14, cursor: "pointer" }}>
                R<span style={{ color: C.accent }}>.</span>
              </div>
              <div id="taskmenu" className="menu toolbar" role="navigation" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                {[
                  { Ic: Pen, label: "compose", accent: true },
                  { Ic: Mail, label: "mail", active: true },
                  { Ic: BookUser, label: "contacts" },
                  { Ic: Settings, label: "settings" },
                ].map(t => (
                  <a key={t.label} className={`button ${t.label}`} title={t.label} style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 36, height: 36, borderRadius: 6,
                    background: t.accent ? C.accent : t.active ? C.bgActive : "transparent",
                    color: t.accent ? "#000" : t.active ? C.accent : C.textDim,
                    marginBottom: t.accent ? 10 : 0, cursor: "pointer", transition: "all .12s",
                  }}
                    onMouseEnter={e => { if (!t.accent && !t.active) { e.currentTarget.style.background = C.bgHover; e.currentTarget.style.color = C.text; } }}
                    onMouseLeave={e => { if (!t.accent && !t.active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textDim; } }}
                  ><t.Ic size={t.accent ? 14 : 16} /></a>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <a style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 6, color: C.textDim, cursor: "pointer", marginBottom: 8 }}>
                <Moon size={14} />
              </a>
            </div>
          )}

          {/* ═══ PHONE LAYOUT ═══ */}
          {mob && (
            <>
              {phonePanel === "sidebar" && (
                <div id="layout-sidebar" className="listbox" style={{ width: "100%", background: C.bgSidebar, display: "flex", flexDirection: "column" }}>
                  <div className="header" style={{ display: "flex", alignItems: "center", padding: "0 12px", height: 48, minHeight: 48, borderBottom: `1px solid ${C.border}` }}>
                    <a onClick={() => setPhonePanel("list")} style={{ color: C.textSec, cursor: "pointer", marginRight: 10, display: "flex" }}><ArrowLeft size={18} /></a>
                    <span style={{ fontFamily: C.serif, fontSize: 15, fontWeight: 600, color: C.text, flex: 1 }}>
                      R<span style={{ color: C.accent }}>.</span> Dossiers
                    </span>
                  </div>
                  <div id="folderlist-content" className="scroller" style={{ flex: 1, overflowY: "auto" }}>
                    <FolderTree folders={FOLDERS} activeId={folder} fontSize={15} onSelect={id => { setFolder(id); setMsg(null); setPhonePanel("list"); }} />
                  </div>
                  <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}` }}>
                    <IdSwitch identities={ids} onSwitch={switchId} compact />
                  </div>
                </div>
              )}
              {phonePanel === "list" && (
                <div id="layout-list" className="listbox selected" style={{ width: "100%", display: "flex", flexDirection: "column", background: C.bgList }}>
                  <div className="header" style={{ display: "flex", alignItems: "center", padding: "0 10px", height: 48, minHeight: 48, borderBottom: `1px solid ${C.border}`, gap: 6 }}>
                    <a onClick={() => setPhonePanel("sidebar")} style={{ color: C.textSec, cursor: "pointer", display: "flex" }}><Menu size={20} /></a>
                    <span className="header-title" style={{ flex: 1, fontFamily: C.serif, fontSize: 15, fontWeight: 600, color: C.text }}>
                      {FOLDERS.find(f => f.id === folder)?.name || folder}
                    </span>
                    <a style={{ color: C.textDim, cursor: "pointer", display: "flex", padding: 4 }}><RefreshCw size={16} /></a>
                  </div>
                  <div className="searchbar" style={{ padding: "6px 10px", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px" }}>
                      <Search size={15} color={C.textDim} />
                      <input placeholder="Rechercher…" style={{ background: "none", border: "none", outline: "none", color: C.text, fontFamily: C.sans, fontSize: 14, width: "100%" }} />
                    </div>
                  </div>
                  <div className="scroller" style={{ flex: 1, overflowY: "auto" }}>
                    <table id="messagelist" className="listing messagelist" style={{ width: "100%", borderCollapse: "collapse" }}>
                      <tbody>
                        {EMAILS.map(e => (
                          <tr key={e.id} className={`message${e.unread ? " unread" : ""}`} onClick={() => selectMsg(e.id)}
                            style={{ cursor: "pointer", borderBottom: `1px solid ${C.border}`, background: e.unread ? "#0c0c10" : "transparent" }}>
                            <td style={{ width: 30, padding: "12px 2px 12px 10px", verticalAlign: "top" }}>
                              <Star size={15} fill={e.flagged ? C.warning : "none"} color={e.flagged ? C.warning : C.textMuted} />
                            </td>
                            <td style={{ padding: "12px 12px 12px 6px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                                <span style={{ fontSize: 15, fontWeight: e.unread ? 700 : 400, color: e.unread ? C.text : C.textSec }}>{e.from}</span>
                                <span style={{ fontSize: 12, fontFamily: C.mono, color: C.textDim, display: "flex", alignItems: "center", gap: 4 }}>
                                  {e.attachment && <Paperclip size={11} />}{e.date}
                                </span>
                              </div>
                              <div style={{ fontSize: 14, fontWeight: e.unread ? 600 : 400, color: e.unread ? C.text : C.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>{e.subject}</div>
                              <div style={{ fontSize: 13, color: C.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.preview}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {phonePanel === "content" && msg && (
                <div id="layout-content" style={{ width: "100%", display: "flex", flexDirection: "column", background: C.bgContent }}>
                  <div className="header" role="toolbar" style={{ display: "flex", alignItems: "center", padding: "0 8px", height: 48, minHeight: 48, borderBottom: `1px solid ${C.border}`, gap: 2 }}>
                    <a onClick={backToList} style={{ color: C.textSec, cursor: "pointer", display: "flex", padding: 6 }}><ArrowLeft size={18} /></a>
                    <span style={{ flex: 1 }} />
                    {[Reply, ReplyAll, Forward, Trash, MoreHorizontal].map((Ic, i) => <TBtn key={i} Ic={Ic} size={16} sz={36} />)}
                  </div>
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    <div style={{ padding: 16, borderBottom: `1px solid ${C.border}` }}>
                      <h2 style={{ fontFamily: C.serif, fontSize: 19, fontWeight: 700, color: C.text, margin: "0 0 12px", lineHeight: 1.3 }}>{MSG.subject}</h2>
                      <div style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontFamily: C.serif, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>F</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{MSG.from} <span style={{ fontFamily: C.mono, fontSize: 11, color: C.textDim, fontWeight: 400 }}>&lt;{MSG.fromEmail}&gt;</span></div>
                          <div style={{ fontFamily: C.mono, fontSize: 11, color: C.textDim }}>À : {MSG.to} · {MSG.date}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: 16 }}>
                      <pre style={{ fontFamily: C.mono, fontSize: 13, lineHeight: 1.6, color: C.text, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, background: C.bgSidebar, padding: 14, borderRadius: 6, border: `1px solid ${C.border}` }}>{MSG.body}</pre>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══ TABLET LAYOUT — 2 columns ═══ */}
          {tab && (
            <>
              {tabletView === "sidebar-list" && (
                <>
                  {/* Sidebar */}
                  <div id="layout-sidebar" className="listbox" style={{ width: 240, minWidth: 240, background: C.bgSidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
                    <div className="header" style={{ display: "flex", alignItems: "center", padding: "0 10px", height: 46, minHeight: 46, borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ fontFamily: C.serif, fontSize: 14, fontWeight: 600, color: C.text, flex: 1 }}>{ids.find(i => i.active)?.email}</span>
                      <a style={{ color: C.textDim, cursor: "pointer" }}><MoreVertical size={15} /></a>
                    </div>
                    <div className="scroller" style={{ flex: 1, overflowY: "auto" }}>
                      <FolderTree folders={FOLDERS} activeId={folder} onSelect={id => { setFolder(id); setMsg(null); }} fontSize={14} />
                    </div>
                    <div style={{ padding: "8px 10px", borderTop: `1px solid ${C.border}` }}>
                      <IdSwitch identities={ids} onSwitch={switchId} compact />
                    </div>
                    <div style={{ padding: "8px 10px", borderTop: `1px solid ${C.border}`, fontFamily: C.mono, fontSize: 10, color: C.textDim }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}><span>Stockage</span><span>2.4 / 10 Go</span></div>
                      <div style={{ height: 2, background: C.border, borderRadius: 1 }}><div style={{ width: "24%", height: "100%", background: C.accent, borderRadius: 1 }} /></div>
                    </div>
                  </div>
                  {/* List */}
                  <div id="layout-list" className="listbox selected" style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bgList }}>
                    <div className="header" style={{ display: "flex", alignItems: "center", padding: "0 8px", height: 46, minHeight: 46, borderBottom: `1px solid ${C.border}`, gap: 4 }}>
                      <span style={{ flex: 1, fontFamily: C.serif, fontSize: 14, fontWeight: 600, color: C.text }}>
                        {FOLDERS.find(f => f.id === folder)?.name || folder}
                      </span>
                      <TBtn Ic={CheckSquare} label="Sélectionner" size={15} sz={34} />
                      <TBtn Ic={SlidersHorizontal} label="Options" size={15} sz={34} />
                      <TBtn Ic={RefreshCw} label="Actualiser" size={15} sz={34} />
                    </div>
                    <div className="searchbar" style={{ padding: "5px 8px", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px" }}>
                        <Search size={14} color={C.textDim} />
                        <input placeholder="Rechercher…" style={{ background: "none", border: "none", outline: "none", color: C.text, fontFamily: C.sans, fontSize: 13, width: "100%" }} />
                      </div>
                    </div>
                    <div className="scroller" style={{ flex: 1, overflowY: "auto" }}>
                      <table id="messagelist" className="listing messagelist" style={{ width: "100%", borderCollapse: "collapse" }}>
                        <tbody>
                          {EMAILS.map(e => (
                            <tr key={e.id} className={`message${e.unread ? " unread" : ""}${msg === e.id ? " selected" : ""}`}
                              onClick={() => selectMsg(e.id)}
                              style={{ cursor: "pointer", borderBottom: `1px solid ${C.border}`, background: msg === e.id ? C.bgSelected : e.unread ? "#0c0c10" : "transparent", transition: "background .08s" }}
                              onMouseEnter={ev => { if (msg !== e.id) ev.currentTarget.style.background = C.bgHover; }}
                              onMouseLeave={ev => { ev.currentTarget.style.background = msg === e.id ? C.bgSelected : e.unread ? "#0c0c10" : "transparent"; }}
                            >
                              <td style={{ width: 28, padding: "11px 2px 11px 8px", verticalAlign: "top" }}>
                                <Star size={14} fill={e.flagged ? C.warning : "none"} color={e.flagged ? C.warning : C.textMuted} />
                              </td>
                              <td style={{ padding: "11px 10px 11px 4px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 1 }}>
                                  <span style={{ fontSize: 14, fontWeight: e.unread ? 700 : 400, color: e.unread ? C.text : C.textSec }}>{e.from}</span>
                                  <span style={{ fontSize: 11, fontFamily: C.mono, color: C.textDim, display: "flex", alignItems: "center", gap: 4 }}>{e.attachment && <Paperclip size={10} />}{e.date}</span>
                                </div>
                                <div style={{ fontSize: 13, fontWeight: e.unread ? 600 : 400, color: e.unread ? C.text : C.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{e.subject}</div>
                                <div style={{ fontSize: 12, color: C.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.preview}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="pagenav" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", borderTop: `1px solid ${C.border}`, fontFamily: C.mono, fontSize: 10, color: C.textDim }}>
                      <span>1 – 10 / 248</span>
                      <div style={{ display: "flex", gap: 8 }}><ChevronLeft size={12} color={C.textMuted} /><ChevronRight size={12} color={C.textSec} style={{ cursor: "pointer" }} /></div>
                    </div>
                  </div>
                </>
              )}
              {tabletView === "list-content" && msg && (
                <div id="layout-content" style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bgContent }}>
                  <div className="header" role="toolbar" style={{ display: "flex", alignItems: "center", padding: "0 10px", height: 46, minHeight: 46, borderBottom: `1px solid ${C.border}`, gap: 2 }}>
                    <a onClick={backToList} style={{ color: C.textSec, cursor: "pointer", display: "flex", padding: 6, marginRight: 6 }}><ArrowLeft size={18} /></a>
                    <span style={{ flex: 1 }} />
                    {[Reply, ReplyAll, Forward, Trash, MoreHorizontal].map((Ic, i) => <TBtn key={i} Ic={Ic} size={16} sz={36} />)}
                  </div>
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}` }}>
                      <h2 style={{ fontFamily: C.serif, fontSize: 21, fontWeight: 700, color: C.text, margin: "0 0 14px", lineHeight: 1.3 }}>{MSG.subject}</h2>
                      <div style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontFamily: C.serif, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>F</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{MSG.from} <span style={{ fontFamily: C.mono, fontSize: 11, color: C.textDim, fontWeight: 400 }}>&lt;{MSG.fromEmail}&gt;</span></div>
                          <div style={{ fontFamily: C.mono, fontSize: 11, color: C.textDim }}>À : {MSG.to} · {MSG.date}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: 20 }}>
                      <pre style={{ fontFamily: C.mono, fontSize: 13, lineHeight: 1.65, color: C.text, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, background: C.bgSidebar, padding: 16, borderRadius: 6, border: `1px solid ${C.border}` }}>{MSG.body}</pre>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══ DESKTOP LAYOUT — 4 columns ═══ */}
          {desk && (
            <>
              <div id="layout-sidebar" className="listbox" style={{ width: 230, minWidth: 230, background: C.bgSidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
                <div className="header" style={{ display: "flex", alignItems: "center", padding: "0 10px", height: 42, minHeight: 42, borderBottom: `1px solid ${C.border}` }}>
                  <span className="username" style={{ fontFamily: C.mono, fontSize: 11, color: C.textSec, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ids.find(i => i.active)?.email}</span>
                  <a style={{ color: C.textDim, cursor: "pointer" }}><MoreVertical size={13} /></a>
                </div>
                <div className="scroller" style={{ flex: 1, overflowY: "auto" }}>
                  <FolderTree folders={FOLDERS} activeId={folder} onSelect={id => { setFolder(id); setMsg(null); }} />
                </div>
                <div style={{ padding: "7px 10px", borderTop: `1px solid ${C.border}`, fontFamily: C.mono, fontSize: 9, color: C.textDim }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}><span>Stockage</span><span>2.4 / 10 Go</span></div>
                  <div style={{ height: 2, background: C.border, borderRadius: 1 }}><div style={{ width: "24%", height: "100%", background: C.accent, borderRadius: 1 }} /></div>
                </div>
              </div>

              <div id="layout-list" className="listbox selected" style={{ flex: msg ? "0 0 370px" : 1, display: "flex", flexDirection: "column", borderRight: msg ? `1px solid ${C.border}` : "none", background: C.bgList, minWidth: 280 }}>
                <div className="header" style={{ display: "flex", alignItems: "center", padding: "0 6px", height: 42, minHeight: 42, borderBottom: `1px solid ${C.border}`, gap: 2 }}>
                  <span style={{ flex: 1 }} />
                  <TBtn Ic={CheckSquare} label="Select" /><TBtn Ic={SlidersHorizontal} label="Options" /><TBtn Ic={RefreshCw} label="Refresh" />
                  <div style={{ marginLeft: 4 }}><IdSwitch identities={ids} onSwitch={switchId} /></div>
                </div>
                <div className="searchbar" style={{ padding: "5px 8px", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 5, padding: "5px 9px" }}>
                    <Search size={13} color={C.textDim} />
                    <input placeholder="Rechercher…" style={{ background: "none", border: "none", outline: "none", color: C.text, fontFamily: C.sans, fontSize: 12, width: "100%" }} />
                  </div>
                </div>
                <div className="scroller" style={{ flex: 1, overflowY: "auto" }}>
                  <table id="messagelist" className="listing messagelist" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      {EMAILS.map(e => (
                        <tr key={e.id} className={`message${e.unread ? " unread" : ""}${msg === e.id ? " selected" : ""}`}
                          onClick={() => setMsg(e.id)}
                          style={{ cursor: "pointer", borderBottom: `1px solid ${C.border}`, background: msg === e.id ? C.bgSelected : e.unread ? "#0c0c10" : "transparent", transition: "background .08s" }}
                          onMouseEnter={ev => { if (msg !== e.id) ev.currentTarget.style.background = C.bgHover; }}
                          onMouseLeave={ev => { ev.currentTarget.style.background = msg === e.id ? C.bgSelected : e.unread ? "#0c0c10" : "transparent"; }}
                        >
                          <td style={{ width: 26, padding: "10px 2px 10px 8px", verticalAlign: "top" }}>
                            <Star size={13} fill={e.flagged ? C.warning : "none"} color={e.flagged ? C.warning : C.textMuted} />
                          </td>
                          <td style={{ padding: "10px 10px 10px 4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 1 }}>
                              <span style={{ fontSize: 13, fontWeight: e.unread ? 700 : 400, color: e.unread ? C.text : C.textSec }}>{e.from}</span>
                              <span style={{ fontSize: 10, fontFamily: C.mono, color: C.textDim, display: "flex", alignItems: "center", gap: 5 }}>{e.attachment && <Paperclip size={10} />}{e.date}</span>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: e.unread ? 600 : 400, color: e.unread ? C.text : C.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{e.subject}</div>
                            <div style={{ fontSize: 11.5, color: C.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.preview}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pagenav" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 10px", borderTop: `1px solid ${C.border}`, fontFamily: C.mono, fontSize: 9, color: C.textDim }}>
                  <span>1 – 10 / 248</span>
                  <div style={{ display: "flex", gap: 8 }}><ChevronLeft size={12} color={C.textMuted} /><ChevronRight size={12} color={C.textSec} style={{ cursor: "pointer" }} /></div>
                </div>
              </div>

              <div id="layout-content" style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bgContent, minWidth: 0 }}>
                <div className="header" role="toolbar" style={{ display: "flex", alignItems: "center", gap: 1, padding: "0 6px", height: 42, minHeight: 42, borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ flex: 1 }} />
                  {msg && [Reply, ReplyAll, Forward, Trash, MoreHorizontal].map((Ic, i) => <TBtn key={i} Ic={Ic} />)}
                </div>
                {msg ? (
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    <div style={{ padding: "18px 22px", borderBottom: `1px solid ${C.border}` }}>
                      <h2 style={{ fontFamily: C.serif, fontSize: 20, fontWeight: 700, color: C.text, margin: "0 0 12px", lineHeight: 1.3 }}>{MSG.subject}</h2>
                      <div style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontFamily: C.serif, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>F</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{MSG.from} <span style={{ fontFamily: C.mono, fontSize: 10, color: C.textDim, fontWeight: 400 }}>&lt;{MSG.fromEmail}&gt;</span></div>
                          <div style={{ fontFamily: C.mono, fontSize: 10, color: C.textDim, marginTop: 2 }}>À : {MSG.to} · {MSG.date}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: 22 }}>
                      <pre style={{ fontFamily: C.mono, fontSize: 12, lineHeight: 1.65, color: C.text, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, background: C.bgSidebar, padding: 14, borderRadius: 5, border: `1px solid ${C.border}` }}>{MSG.body}</pre>
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <Mail size={32} color={C.textMuted} strokeWidth={1} />
                    <span style={{ fontFamily: C.serif, fontSize: 14, color: C.textDim, fontStyle: "italic" }}>Sélectionnez un message</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "8px 0", fontFamily: C.mono, fontSize: 8, color: C.textDim }}>
        Roundcube "Guillou" — Elastic DOM v1.6 · Identity Switch · Folder Hierarchy · Responsive 3/2/1 col
      </div>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
        ::-webkit-scrollbar-thumb:hover{background:${C.textDim};}
        input::placeholder{color:${C.textDim}!important;}
      `}</style>
    </div>
  );
}
