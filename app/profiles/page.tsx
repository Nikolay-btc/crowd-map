"use client";
import React, { useEffect, useMemo, useState } from "react";
import ProfileModal, { User } from "../../components/ProfileModal";

async function safeJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const txt = await res.text();
    const clean = txt.charCodeAt(0) === 0xFEFF ? txt.slice(1) : txt;
    return JSON.parse(clean) as T;
  } catch { return fallback; }
}

const FALLBACK_USERS: User[] = [
  { id: "igor",   name: "Igor",   photo: "https://i.pravatar.cc/200?img=11", rating: 4.6 },
  { id: "sasha",  name: "Sasha",  photo: "https://i.pravatar.cc/200?img=12", rating: 4.3 },
  { id: "marina", name: "Marina", photo: "https://i.pravatar.cc/200?img=13", rating: 4.7 },
];

export default function ProfilesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const u = await safeJson<User[]>("/users.json", FALLBACK_USERS);
      setUsers(u);
    })();
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => `${u.name}`.toLowerCase().includes(q));
  }, [users, query]);

  return (
    <main style={{ padding:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <h2 style={{ margin:0 }}>People</h2>
        <input
          placeholder="Search people…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ border:"1px solid #ddd", borderRadius:999, padding:"10px 14px", width:280 }}
        />
      </div>

      {list.length === 0 && <div style={{ opacity:.6 }}>No matches.</div>}

      <section style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, 240px)", gap:16 }}>
        {list.map(u => (
          <div key={u.id} style={{ border:"1px solid #eee", borderRadius:12, padding:12 }}>
            <img src={u.photo} alt={u.name} style={{ width:"100%", height:140, objectFit:"cover", borderRadius:8 }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
              <div style={{ fontWeight:700 }}>{u.name}</div>
              {typeof u.rating === "number" && <div style={{ opacity:.6 }}>{u.rating.toFixed(1)}★</div>}
            </div>
            <button onClick={() => setSelected(u)} style={{ marginTop:8, width:"100%", border:"1px solid #ddd", borderRadius:8, padding:"8px 10px", cursor:"pointer" }}>
              Open profile
            </button>
          </div>
        ))}
      </section>

      {selected && <ProfileModal user={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}