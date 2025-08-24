import { useState } from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & { 
  fallback?: string;
};

const FALLBACK = "https://picsum.photos/seed/artisan/600/400";

export default function ImageWithFallback({ 
  fallback = FALLBACK, 
  onError, 
  ...rest 
}: Props) {
  const [src, setSrc] = useState(rest.src);
  
  return (
    <img
      {...rest}
      src={src}
      loading="lazy"
      decoding="async"
      width={rest.width ?? 600}
      height={rest.height ?? 400}
      onError={(e) => {
        setSrc(fallback);
        onError?.(e as React.SyntheticEvent<HTMLImageElement, Event>);
      }}
    />
  );
}