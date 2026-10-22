'use client';

export default function QuickUseUI({ player, onUsePotion }) {
  const hp = Math.max(0, Number(player?.hp) || 0);
  const maxHp = Math.max(1, Number(player?.maxHp) || 100);
  const potions = Math.max(0, Number(player?.potions) || 0);
  const disabled = potions <= 0 || hp >= maxHp;

  return (
    <div className="quick-use-dock" role="group" aria-label="Quick use items">
      <div className="quick-use-info">
        <span className="quick-use-label">QUICK USE</span>
        <span className="quick-use-count">Potion × {potions}</span>
      </div>
      <button
        type="button"
        className="quick-use-potion"
        onClick={onUsePotion}
        disabled={disabled}
        aria-label={`Gunakan potion, tersedia ${potions}`}
      >
        <span className="quick-use-icon" aria-hidden="true">🧪</span>
        <span className="quick-use-copy">
          <strong>POTION</strong>
          <small>{potions <= 0 ? 'HABIS' : hp >= maxHp ? 'HP PENUH' : 'PULIHKAN HP'}</small>
        </span>
      </button>
    </div>
  );
}
