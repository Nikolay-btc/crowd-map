"use client";
import React, { useEffect, useState } from "react";
import { REVIEW_BADGES } from "../lib/reviews";
import { getReviewsForUser, addReview, removeReview, getStatusForUser, setStatusForUser } from "../lib/profileStore";

export type User = { id: string; name: string; photo: string; rating?: number };

export default function ProfileModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [reviews, setReviews] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const sync = () => {
      setReviews(getReviewsForUser(user.id));
      setStatus(getStatusForUser(user.id));
    };
    sync();
    const h = () => sync();
    document.addEventListener("profile:changed", h);
    return () => document.removeEventListener("profile:changed", h);
  }, [user.id]);

  const toggle = (id: string) => {
    if (reviews.includes(id)) removeReview(user.id, id);
    else addReview(user.id, id);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"grid", placeItems:"center", zIndex:1000 }}>
      <div style={{ background:"#fff", width:640, maxWidth:"90vw", borderRadius:12, boxShadow:"0 20px 50px rgba(0,0,0,.2)", overflow:"hidden" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderBottom:"1px solid #eee" }}>
          <div style={{ fontWeight:700 }}>Profile</div>
          <button onClick={onClose} style={{ border:"1px solid #ddd", borderRadius:8, padding:"6px 10px", cursor:"pointer" }}>Close</button>
        </div>

        <div style={{ padding:16 }}>
          <img src={user.photo} alt={user.name} style={{ width:"100%", height:220, objectFit:"cover", borderRadius:8 }} />
          <div style={{ marginTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:20, fontWeight:700 }}>{user.name}</div>
            {typeof user.rating === "number" && <div style={{ opacity:.7 }}>{user.rating.toFixed(1)}★</div>}
          </div>

          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:12, opacity:.7, marginBottom:6 }}>Status (tonight)</div>
            <input
              value={status}
              placeholder="e.g. open to meet, just dancing…"
              onChange={e => { setStatus(e.target.value); setStatusForUser(user.id, e.target.value); }}
              style={{ width:"100%", border:"1px solid #ddd", borderRadius:8, padding:"10px 12px" }}
            />
          </div>

          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:12, opacity:.7, marginBottom:6 }}>Positive badges</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {REVIEW_BADGES.map(b => {
                const active = reviews.includes(b.id);
                return (
                  <button key={b.id}
                    onClick={() => toggle(b.id)}
                    style={{
                      border: active ? "1px solid #222" : "1px solid #ddd",
                      background: active ? "#222" : "#fff",
                      color: active ? "#fff" : "#222",
                      borderRadius:999, padding:"8px 12px", cursor:"pointer"
                    }}>
                    <span style={{ marginRight:6 }}>{b.emoji}</span>{b.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}