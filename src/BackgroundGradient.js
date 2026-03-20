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
      background: conic-gradient(from var(--angle) at 2120px 2170px, #d946ef, #facc15, #06b6d4, #d946ef);
      animation: gradientRotate 25s linear infinite;
    }
  `;
  document.head.appendChild(style);
}
