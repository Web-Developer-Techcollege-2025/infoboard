export function BackgroundGradient() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes gradientRotate {
      0%   { --angle: 0deg; }
      100% { --angle: 360deg; }
    }
    @property --angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }
    #app {
      background: conic-gradient(from var(--angle) at 50% 200%, #d946ef, #a855f7, #06b6d4, #0ea5e9, #facc15, #fb923c, #d946ef);
      animation: gradientRotate 25s linear infinite;
    }
  `;
  document.head.appendChild(style);
}
