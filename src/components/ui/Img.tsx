"use client";
import Image, { ImageProps } from "next/image";

type ImgProps = Omit<ImageProps, "src" | "alt" | "width" | "height"> & {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  unoptimized?: boolean;
};

export default function Img({
  src,
  alt = "",
  width,
  height,
  fill,
  unoptimized = true,
  ...rest
}: ImgProps) {
  if (fill) {
    return <Image src={src} alt={alt} fill unoptimized={unoptimized} {...rest} />;
  }
  const w = width ?? 1;
  const h = height ?? 1;
  return <Image src={src} alt={alt} width={w} height={h} unoptimized={unoptimized} {...rest} />;
}




