export function Mark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M8 8 25 15 12 25Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {[
        [8, 8],
        [25, 15],
        [12, 25],
      ].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r="3" fill="currentColor" />
      ))}
    </svg>
  );
}
export default function Brand() {
  return (
    <a className="brand" href="#/">
      <Mark />
      <span>
        geo<span className="brand-light">companion</span>
      </span>
    </a>
  );
}
