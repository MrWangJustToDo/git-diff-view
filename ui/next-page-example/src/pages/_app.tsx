import "../styles/globals.css";
import "@git-diff-view/react/styles/diff-view.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
