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
      background: conic-gradient(
        from var(--angle) at 50% 200%,
        var(--color-primary-blue) 0deg,
        var(--color-purple) 51deg,
        var(--color-dark-blue) 102deg,
        var(--color-yellow) 153deg,
        var(--color-orange) 204deg,
        var(--color-light-green) 255deg,
        var(--color-primary-red) 306deg,
        var(--color-primary-blue) 360deg
      );
      animation: gradientRotate 25s linear infinite;
    }
  `;
  document.head.appendChild(style);
}
