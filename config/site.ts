import { SidebarNavItem, SiteConfig } from "types";
import { env } from "@/env.mjs";

const site_url = env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
  title: "Gift Dreams | DreamBez.com",
  name: "DreamBez.com",
  description:
    "At DreamBez.com, we create your Hyper Realistic Dream Album with Artificial Intelligence and lots of Love.",
  url: site_url,
  ogImage: `${site_url}/_static/og.jpg`,
  links: {
    twitter: "https://twitter.com/jcarpio",
    github: "https://github.com/jcarpio/DreamBez",
  },
  mailSupport: "support@enkire.com",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DreamBez.com",
    "url": site_url,
    "description": "At DreamBez.com, we create your Hyper Realistic Dream Photos and Album with Artificial Intelligence and lots of Love.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${site_url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  },
  keywords: [
      "Dreams",
  ],
  authors: [
    {
      name: "Enkire",
    },
  ],
  creator: "Enkire",
  twitterCreator: "@enkire",
  icons: "/favicon.ico",
  manifest: `${site_url}/site.webmanifest`,
};

export const footerLinks: SidebarNavItem[] = [
  {
    title: "Company",
    items: [
      { title: "Terms", href: "/terms" },
      { title: "Privacy", href: "/privacy" },
    ],
  },
  {
    title: "Resources",
    items: [
      { title: "Styles", href: "/generator-styles" },
      { title: "Pricing", href: "/pricing" },
      { title: "Blog", href: "/blog" },
    ],
  },
];
