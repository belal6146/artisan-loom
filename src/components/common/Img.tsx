export default function Img(props: JSX.IntrinsicElements['img']) {
  const { 
    width = 640, 
    height = 480, 
    loading = 'lazy', 
    decoding = 'async', 
    ...rest 
  } = props;
  
  // eslint-disable-next-line jsx-a11y/alt-text
  return (
    <img 
      width={width} 
      height={height} 
      loading={loading} 
      decoding={decoding} 
      {...rest} 
    />
  );
}