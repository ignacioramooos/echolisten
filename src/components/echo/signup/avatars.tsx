const Avatar1 = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <rect x="10" y="10" width="60" height="60" fill="none" stroke="#000" strokeWidth="2" />
    <rect x="25" y="25" width="30" height="30" fill="#000" />
  </svg>
);
const Avatar2 = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <circle cx="40" cy="40" r="30" fill="none" stroke="#000" strokeWidth="2" />
    <circle cx="40" cy="40" r="12" fill="#000" />
  </svg>
);
const Avatar3 = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <line x1="10" y1="70" x2="40" y2="10" stroke="#000" strokeWidth="2" />
    <line x1="40" y1="10" x2="70" y2="70" stroke="#000" strokeWidth="2" />
    <line x1="10" y1="70" x2="70" y2="70" stroke="#000" strokeWidth="2" />
  </svg>
);
const Avatar4 = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <rect x="5" y="5" width="70" height="70" fill="none" stroke="#000" strokeWidth="2" transform="rotate(45 40 40)" />
  </svg>
);
const Avatar5 = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <line x1="10" y1="20" x2="70" y2="20" stroke="#000" strokeWidth="2" />
    <line x1="10" y1="40" x2="70" y2="40" stroke="#000" strokeWidth="2" />
    <line x1="10" y1="60" x2="70" y2="60" stroke="#000" strokeWidth="2" />
    <circle cx="40" cy="40" r="15" fill="#000" />
  </svg>
);
const Avatar6 = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <rect x="10" y="10" width="25" height="25" fill="#000" />
    <rect x="45" y="10" width="25" height="25" fill="none" stroke="#000" strokeWidth="2" />
    <rect x="10" y="45" width="25" height="25" fill="none" stroke="#000" strokeWidth="2" />
    <rect x="45" y="45" width="25" height="25" fill="#000" />
  </svg>
);

export const defaultAvatars = [Avatar1, Avatar2, Avatar3, Avatar4, Avatar5, Avatar6];
