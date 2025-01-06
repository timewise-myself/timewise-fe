import { Global } from "@emotion/react";

const Fonts = () => (
  <Global
    styles={`
    @font-face {
        font-family: 'SF Pro Display';
        src: url('/assets/fonts/SF-Pro-Display-Regular.woff') format('truetype');
    }
    `}
  />
);

export default Fonts;
