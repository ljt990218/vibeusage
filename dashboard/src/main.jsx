import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { copy } from "./lib/copy.js";
import "./styles.css";

function ensureMetaTag(name, property, content) {
  if (!content) return;
  const selector = name
    ? `meta[name="${name}"]`
    : `meta[property="${property}"]`;
  let tag = document.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    if (name) tag.setAttribute("name", name);
    if (property) tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function ensureDocumentTitle() {
  const title = copy("landing.meta.title");
  if (title) document.title = title;
}

function ensureRichLinks() {
  const title = copy("landing.meta.title");
  const description = copy("landing.meta.description");
  const ogSiteName = copy("landing.meta.og_site_name");
  const ogImage = copy("landing.meta.og_image");
  const twitterCard = copy("landing.meta.twitter_card");

  // Baseline
  ensureMetaTag("description", null, description);

  // Open Graph
  ensureMetaTag(null, "og:site_name", ogSiteName);
  ensureMetaTag(null, "og:title", title);
  ensureMetaTag(null, "og:description", description);
  ensureMetaTag(null, "og:image", ogImage);
  ensureMetaTag(null, "og:type", copy("landing.meta.og_type") || "website");
  ensureMetaTag(null, "og:url", window.location.origin);

  // Twitter
  ensureMetaTag("twitter:card", null, twitterCard);
  ensureMetaTag("twitter:title", title);
  ensureMetaTag("twitter:description", description);
  ensureMetaTag("twitter:image", ogImage);
}

ensureRichLinks();
ensureDocumentTitle();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
