'use client';
import React from 'react';

/** Lightweight, touch-friendly lore modal. Parent owns open/close and NPC text. */
export default function StoryLoreUI({open, title='Kisah Aetheria', text, onClose, onContinue}) {
  if (!open) return null;
  return <div role="dialog" aria-modal="true" aria-label={title} style={{position:'absolute',inset:0,zIndex:120,display:'grid',placeItems:'center',padding:'max(16px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left))',background:'rgba(2,8,18,.48)',backdropFilter:'blur(3px)',pointerEvents:'auto'}}>
    <section style={{width:'min(520px,94vw)',maxHeight:'min(70dvh,520px)',overflowY:'auto',border:'1px solid rgba(223,190,112,.72)',borderRadius:18,background:'linear-gradient(145deg,rgba(9,23,39,.94),rgba(20,24,48,.9))',boxShadow:'0 18px 55px #0009',padding:'clamp(16px,4vw,26px)',color:'#edfaff',touchAction:'pan-y'}}>
      <div style={{display:'flex',alignItems:'start',justifyContent:'space-between',gap:12}}><div><small style={{letterSpacing:'.18em',color:'#e4c57b'}}>CHRONICLES OF AETHERIA</small><h2 style={{fontFamily:'Georgia,serif',fontSize:'clamp(21px,5vw,30px)',fontWeight:600,margin:'8px 0 12px',color:'#f4dda0'}}>{title}</h2></div><button onClick={onClose} aria-label="Tutup lore" style={closeStyle}>×</button></div>
      <p style={{fontSize:14,lineHeight:1.75,color:'#d7e8f1',whiteSpace:'pre-line',margin:'0 0 18px'}}>{text}</p>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8}}><button onClick={onClose} style={secondary}>Nanti</button><button onClick={onContinue||onClose} style={primary}>Lanjutkan petualangan</button></div>
    </section>
  </div>;
}
const closeStyle={width:40,height:40,flexShrink:0,borderRadius:12,border:'1px solid #a5cbd455',background:'#ffffff0b',color:'#f4dda0',fontSize:27,touchAction:'manipulation'};
const secondary={minHeight:44,padding:'0 15px',borderRadius:12,border:'1px solid #7395a566',background:'#102335',color:'#dceaf3',touchAction:'manipulation'};
const primary={minHeight:44,padding:'0 15px',borderRadius:12,border:'1px solid #dfc37d',background:'linear-gradient(135deg,#9b7136,#59462f)',color:'#fff4cf',fontWeight:700,touchAction:'manipulation'};
