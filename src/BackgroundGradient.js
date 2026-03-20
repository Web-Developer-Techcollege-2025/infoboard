export function BackgroundGradient() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes gradientShift {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    #app {
      background: linear-gradient(to right, #d946ef, #06b6d4, #d946ef);
      background-size: 400% 400%;
      animation: gradientShift 25s ease infinite;
    }
  `;
  document.head.appendChild(style);
}
