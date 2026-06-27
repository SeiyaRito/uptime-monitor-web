export default function Toggle({ on, onChange, disabled = false }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => !disabled && onChange(!on)}
      style={{
        position: 'relative', flexShrink: 0, width: 40, height: 23,
        borderRadius: 20, cursor: disabled ? 'not-allowed' : 'pointer', padding: 0, border: 'none',
        background: on ? '#1D9E75' : '#262626',
        outline: 'none', transition: 'background .15s',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: on ? 19 : 2,
        width: 17, height: 17, borderRadius: '50%',
        background: on ? '#04140d' : '#888',
        transition: 'left .15s ease, background .15s',
      }} />
    </button>
  );
}
