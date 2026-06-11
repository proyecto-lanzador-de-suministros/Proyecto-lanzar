interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-38.764 10.196 46.2566 36.1732"
      className={className}
    >
      {/* Cuerpo principal */}
      <path
        d="M135.318 206.454q.808-2.351 1.616 0l6.385 18.573q.808 2.351-.808 2.351h-12.77q-1.616 0-.808-2.351Z"
        fill="#69a9f6"
        style={{
          transformBox: "fill-box",
          transformOrigin: "50% 46%",
        }}
        transform="rotate(11.229 901.332 -867.822)skewX(-49.931)"
      />
      {/* Ala pequeña */}
      <path
        d="M188.178 219.295q.415-.763.831 0l3.324 6.1q.416.763-.415.763h-6.649q-.831 0-.415-.763Z"
        fill="#ffffff"
        style={{
          transformBox: "fill-box",
          transformOrigin: "50% 56%",
        }}
        transform="rotate(-40 -357.982 195.771)skewX(-12.73)"
      />
      {/* Cola */}
      <path
        d="M180.008 254.344q.466-1.27.933 0l9.674 26.32q.467 1.27-.466 1.27H170.8q-.933 0-.466-1.27Z"
        fill="#ffffff"
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        transform="rotate(33.074 309.213 -436.904)skewX(4.764)"
      />
    </svg>
  );
}
