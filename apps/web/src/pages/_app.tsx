import "../styles/globals.css";
import "@upstash/feedback/index.css";
import type { AppProps as NextAppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider, useTheme } from "next-themes";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/public-sans/400.css";
import "@fontsource/public-sans/500.css";
import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import cookie from "cookie";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { SkeletonTheme } from "react-loading-skeleton";

import AppLayout from "~/components/AppLayout/AppLayout";
import { FeedbackWidget } from "~/components/FeedbackWidget/FeedbackWidget";
import { api } from "~/api-client";
import { useIsMounted } from "~/hooks/useIsMounted";
import { BlobDecoderWorkerProvider } from "~/providers/BlobDecoderWorker";
import { EnvProvider, useEnv } from "~/providers/Env";

function App({ Component, pageProps }: NextAppProps) {
  const { resolvedTheme } = useTheme();
  const isMounted = useIsMounted();
  const router = useRouter();
  const { env } = useEnv();

  useEffect(() => {
    if (typeof window !== "undefined" && !!env?.PUBLIC_POSTHOG_ID) {
      posthog.init(env.PUBLIC_POSTHOG_ID, {
        api_host: env.PUBLIC_POSTHOG_HOST,
        person_profiles: "identified_only",
        loaded: (posthog) => {
          if (window.location.hostname.includes("localhost")) {
            posthog.debug();
          }
        },
      });
    }
  }, [env]);

  useEffect(() => {
    const handleRouteChange = () => {
      if (!posthog) {
        return;
      }

      const distinctId = cookie.parse(document.cookie)["distinctId"];

      if (!distinctId) {
        return;
      }

      posthog.identify(distinctId);
      posthog.capture("$pageview");
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  if (!isMounted) {
    return null;
  }

  return (
    <PostHogProvider client={posthog}>
      <SkeletonTheme
        baseColor={resolvedTheme === "dark" ? "#434672" : "#EADEFD"}
        highlightColor={resolvedTheme === "dark" ? "#7D80AB" : "#E2CFFF"}
      >
        <Head>
          <title>Blobscan</title>
          <meta
            name="description"
            content="Blobscan is the first EIP4844 Blob Transaction explorer, a web-based application that offers a seamless experience for navigating and indexing blob data."
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AppLayout>
          <Component {...pageProps} />
        </AppLayout>
        <FeedbackWidget />
        {env && env.PUBLIC_VERCEL_ANALYTICS_ENABLED && <Analytics />}
      </SkeletonTheme>
    </PostHogProvider>
  );
}

function AppWrapper(props: NextAppProps) {
  return (
    <ThemeProvider attribute="class">
      <BlobDecoderWorkerProvider>
        <EnvProvider>
          <App {...props} />
        </EnvProvider>
      </BlobDecoderWorkerProvider>
    </ThemeProvider>
  );
}

export default api.withTRPC(AppWrapper);
