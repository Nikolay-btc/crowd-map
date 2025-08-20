"use client";
import {useEffect, useRef, useState} from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type VenueFeature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: { id: string; title: string; description: string; photos: string[] };
};
type Attendee = { id: string; name: string; photo: string; sticker: string };
type AttendeesMap = Record<string, Attendee[]>;

const stickers = ["знакомства","танцы","напиться","спокойный вечер","karaoke","спортбар"];

export default function Home() {
  const mapRef = useRef<HTMLDivElement|null>(null);
  const map = useRef<maplibregl.Map|null>(null);
  const [venues,setVenues] = useState<VenueFeature[]>([]);
  const [attendees,setAttendees] = useState<AttendeesMap>({});
  const [openId,setOpenId] = useState<string|null>(null);
  const [ready,setReady] = useState(false);
  const [myGoing,setMyGoing] = useState<Record<string,{sticker:string}|undefined>>({});

  // поднять z-index маркеров
  useEffect(()=>{
    const styleTag = document.createElement("style");
    styleTag.textContent = ".maplibregl-marker{z-index:1000 !important}";
    document.head.appendChild(styleTag);
    return ()=> styleTag.remove();
  },[]);

  useEffect(()=>{ try{ const raw = localStorage.getItem("myGoing"); if(raw) setMyGoing(JSON.parse(raw)); }catch{} },[]);

  useEffect(() => {
    if (!mapRef.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors"
          }
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }]
      },
      center: [131.89, 43.118],
      zoom: 12
    });
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    map.current.on("click", ()=> setOpenId(null));

    Promise.all([
      fetch("/venues.json").then(r=>r.json()),
      fetch("/attendees.json").then(r=>r.json())
    ]).then(([vjson, ajson])=>{
      const feats: VenueFeature[] = vjson.features;
      setVenues(feats);
      setAttendees(ajson);

      feats.forEach(f=>{
        const popup = new maplibregl.Popup({offset:10})
          .setHTML(`<strong>${f.properties.title}</strong>`);
        const marker = new maplibregl.Marker({color:"#18a0fb"})
          .setLngLat(f.geometry.coordinates)
          .setPopup(popup)
          .addTo(map.current!);
        popup.on("open", ()=> setOpenId(f.properties.id));
        marker.getElement().addEventListener("click", (e)=>{
          e.stopPropagation();
          setOpenId(f.properties.id);
        });
      });

      setReady(true);
    });

    return ()=> map.current?.remove();
  }, []);

  const current = venues.find(v=>v.properties.id===openId) || null;
  const list = (openId && attendees[openId]) ? attendees[openId] : [];
  const my = current ? myGoing[current.properties.id] : undefined;

  function setGoing(venueId: string, sticker?: string) {
    const value = { sticker: sticker ?? "" };
    setMyGoing(prev=>{
      const next = {...prev, [venueId]: value};
      localStorage.setItem("myGoing", JSON.stringify(next));
      return next;
    });
    setAttendees(prev=>{
      const copy: AttendeesMap = {...prev};
      const meId = "me-local";
      const others = (copy[venueId]||[]).filter(a=>a.id!==meId);
      others.unshift({ id: meId, name: "Вы", photo: "https://i.pravatar.cc/100?img=5", sticker: value.sticker });
      copy[venueId] = others;
      return copy;
    });
  }
  function cancelGoing(venueId: string) {
    setMyGoing(prev=>{
      const next = {...prev}; delete next[venueId];
      localStorage.setItem("myGoing", JSON.stringify(next));
      return next;
    });
    setAttendees(prev=>{
      const copy: AttendeesMap = {...prev};
      const meId = "me-local";
      copy[venueId] = (copy[venueId]||[]).filter(a=>a.id!==meId);
      return copy;
    });
  }
  function setSticker(venueId: string, sticker: string) {
    if (!myGoing[venueId]) return setGoing(venueId, sticker);
    setMyGoing(prev=>{
      const next = {...prev, [venueId]: { sticker }};
      localStorage.setItem("myGoing", JSON.stringify(next));
      return next;
    });
    setAttendees(prev=>{
      const copy: AttendeesMap = {...prev};
      const meId = "me-local";
      const others = (copy[venueId]||[]).filter(a=>a.id!==meId);
      others.unshift({ id: meId, name: "Вы", photo: "https://i.pravatar.cc/100?img=5", sticker });
      copy[venueId] = others;
      return copy;
    });
  }

  return (
    <div style={{height:"100dvh",width:"100vw",position:"relative",fontFamily:"system-ui,Segoe UI,Roboto,Arial"}}>
      <div ref={mapRef} style={{height:"100%",width:"100%"}} />

      {current && (
        <div style={{
          position:"absolute", top:0, right:0, height:"100%", width:"380px",
          background:"#fff", boxShadow:"-8px 0 24px rgba(0,0,0,.12)", display:"flex",
          flexDirection:"column", zIndex:2000
        }}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",borderBottom:"1px solid #eee"}}>
            <div style={{fontWeight:700}}>{current.properties.title}</div>
            <button onClick={()=>setOpenId(null)} style={{border:"none",background:"transparent",fontSize:20,cursor:"pointer"}}>×</button>
          </div>

          <div style={{display:"flex",gap:"8px",overflowX:"auto",padding:"10px 12px"}}>
            {current.properties.photos?.map((src, i)=>(
              <img key={i} src={src} alt="" style={{height:"110px",borderRadius:"10px"}} />
            ))}
          </div>

          <div style={{padding:"0 14px 10px",color:"#444",fontSize:14}}>
            {current.properties.description}
          </div>

          <div style={{padding:"0 14px 10px"}}>
            {my ? (
              <button onClick={()=> cancelGoing(current.properties.id)}
                style={{width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid #ffb3b3",background:"#ffe9e9",color:"#b00",fontWeight:600,cursor:"pointer"}}>
                Отменить «Я пойду»
              </button>
            ) : (
              <button onClick={()=> setGoing(current.properties.id)}
                style={{width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1px solid #0a84ff",background:"#0a84ff",color:"#fff",fontWeight:600,cursor:"pointer"}}>
                Я пойду
              </button>
            )}
          </div>

          <div style={{padding:"8px 14px 6px",fontWeight:600}}>Кто идёт сегодня</div>
          <div style={{padding:"0 12px 12px", display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"10px", overflowY:"auto"}}>
            {(list||[]).map(a=>(
              <div key={a.id} style={{display:"flex",alignItems:"center",gap:"8px",border:"1px solid #eee",borderRadius:"12px",padding:"8px"}}>
                <img src={a.photo} alt={a.name} style={{width:32,height:32,borderRadius:"50%"}}/>
                <div style={{fontSize:13}}>
                  <div style={{fontWeight:600}}>{a.name}</div>
                  <div style={{fontSize:12,opacity:.7}}>{a.sticker}</div>
                </div>
              </div>
            ))}
            {(list||[]).length===0 && <div style={{gridColumn:"1 / -1",opacity:.6,fontSize:13}}>Пока никто не отметился</div>}
          </div>

          <div style={{marginTop:"auto",padding:"12px 14px",borderTop:"1px solid #eee",display:"flex",gap:"8px",flexWrap:"wrap"}}>
            {stickers.map(s=>{
              const active = my?.sticker === s;
              return (
                <button key={s} onClick={()=> setSticker(current.properties.id, s)}
                  style={{
                    border: active ? "1px solid #0a84ff" : "1px solid #ddd",
                    background: active ? "#e8f2ff" : "#f8f8f8",
                    borderRadius:"999px", padding:"6px 10px", cursor:"pointer", fontSize:13
                  }}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!ready && <div style={{position:"fixed",inset:0,display:"grid",placeItems:"center",fontSize:16}}>Загружаю карту…</div>}
    </div>
  );
}
