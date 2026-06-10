interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-39.342 10.574 500 500"
      className={className}
    >
      {/* Cuerpo principal */}
      <path
        d="M 135.318 206.454 Q 136.126 204.103 136.934 206.454 L 143.319 225.027 Q 144.127 227.378 142.511 227.378 L 129.741 227.378 Q 128.125 227.378 128.933 225.027 Z"
        style={{
          strokeWidth: 1,
          fill: "var(--color-brand)",
          transformOrigin: "136.125px 215.74px",
        }}
        transform="matrix(0.980858, 0.194725, -1.360828, 0.749357, 41.636856, -35.094114)"
      />
      {/* Ala pequeña */}
      <path
        d="M 188.178 219.295 Q 188.593 218.532 189.009 219.295 L 192.333 225.395 Q 192.749 226.158 191.918 226.158 L 185.269 226.158 Q 184.438 226.158 184.854 225.395 Z"
        style={{
          fill: "var(--color-surface-dark)",
          transformBox: "fill-box",
          transformOrigin: "44.7039% 51.7062%",
        }}
        transform="matrix(0.766053, -0.642778, 0.469722, 0.91126, -16.216184, -27.272915)"
      />
      {/* Cola */}
      <path
        d="M 180.008 254.344 Q 180.474 253.074 180.941 254.344 L 190.615 280.664 Q 191.082 281.934 190.149 281.934 L 170.8 281.934 Q 169.867 281.934 170.334 280.664 Z"
        style={{
          fill: "var(--color-surface-dark)",
          transformBox: "fill-box",
          transformOrigin: "50% 50%",
        }}
        transform="matrix(0.837965, 0.545725, -0.475882, 0.88345, 5.044322, -82.508895)"
      />
    </svg>
  );
}
