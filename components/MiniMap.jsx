'use client';
/** Lightweight 2D minimap overlay; coordinates use a bounded world-space projection. */
export default function MiniMap({ position = { x: 0, z: 0 }, boss = null, resources = [] }) {
  const project = (x, z) => ({ left: `${Math.max(7, Math.min(93, 50 + Number(x || 0) * 1.65))}%`, top: `${Math.max(15, Math.min(93, 50 + Number(z || 0) * 1.65))}%` });
  const nearResources = resources.filter(r => Math.hypot((r.x || 0) - position.x, (r.z || 0) - position.z) < 12);
  return <div aria-label="Adventure minimap" role="img" style={{position:'absolute',right:'max(8px, env(safe-area-inset-right))',top:'max(8px, env(safe-area-inset-top))',width:112,height:112,background:'linear-gradient(135deg,#06131df0,#102b38ed)',border:'1px solid #41727a',borderRadius:12,padding:8,fontSize:10,boxSizing:'border-box',backgroundImage:'linear-gradient(#4a839422 1px,transparent 1px),linear-gradient(90deg,#4a839422 1px,transparent 1px)',backgroundSize:'17px 17px',zIndex:50,pointerEvents:'none'}}>
    <b style={{fontSize:8,letterSpacing:1,color:'#a9e9ee'}}>FIELD MAP</b>
    {nearResources.map(r=><i key={r.id} title={r.material || 'Resource'} style={{position:'absolute',...project(r.x,r.z),width:5,height:5,borderRadius:2,background:r.kind==='ore'?'#78e9ff':'#e8c17a',boxShadow:'0 0 5px currentColor'}}/>)}
    {boss && <i title="World Boss" style={{position:'absolute',...project(boss.x,boss.z),width:7,height:7,borderRadius:'50%',background:'#ff547b',boxShadow:'0 0 8px #ff547b'}}/>}
    <i title="Player" style={{position:'absolute',...project(position.x,position.z),width:8,height:8,borderRadius:'50%',background:'#64f5c7',boxShadow:'0 0 8px #64f5c7',transform:'translate(-50%,-50%)'}}/>
    <span style={{position:'absolute',bottom:5,left:7,color:'#b6d5d8',fontSize:8}}>● You　◆ Ore　● Tree</span>
  </div>;
}
