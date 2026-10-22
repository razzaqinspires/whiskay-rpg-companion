'use client';
import { useEffect, useState } from 'react';
export default function PlayerToast(){const [toast,setToast]=useState(null);useEffect(()=>{let timer;const onToast=e=>{setToast(e.detail||null);clearTimeout(timer);timer=setTimeout(()=>setToast(null),3600)};window.addEventListener('whiskay:toast',onToast);return()=>{clearTimeout(timer);window.removeEventListener('whiskay:toast',onToast)}},[]);if(!toast)return null;return <div className={`whiskay-toast ${toast.kind||''}`} role="status">{toast.message}</div>}
