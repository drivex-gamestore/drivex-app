"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { muxInput } from "sanity-plugin-mux-input";
import { schemaTypes } from "./src/schemaTypes";
import { env } from "./env.mjs";

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET;

export default defineConfig({
  name: "default",
  title: "DriveX GameShop Studio",

  projectId,
  dataset,

  basePath: "/studio",

  plugins: [structureTool(), visionTool(), muxInput()],

  schema: {
    types: schemaTypes,
  },
});
