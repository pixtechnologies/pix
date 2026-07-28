import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/pages/Home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "πX Enterprise Intelligence Platform" },
      {
        name: "description",
        content:
          "πX transforms enterprise data into structured intelligence, semantic understanding, dynamic dashboards, and evidence-backed decisions.",
      },
      { property: "og:title", content: "πX Enterprise Intelligence Platform" },
      {
        property: "og:description",
        content:
          "πX transforms enterprise data into structured intelligence, semantic understanding, dynamic dashboards, and evidence-backed decisions.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});
