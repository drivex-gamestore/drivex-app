import customImage from "@schemaTypes/objects/image";
import link from "@schemaTypes/objects/link";
import ctaButton from "@schemaTypes/objects/ctaButton";
import media from "@schemaTypes/objects/media";
import headline from "@schemaTypes/objects/headline";
import availability from "@schemaTypes/objects/availability";
import contact from "@schemaTypes/objects/contact";
import linkField from "@schemaTypes/objects/linkField";
import richText from "@schemaTypes/objects/richText";
import logoImage from "@schemaTypes/objects/logoImage";
import svgItem from "@schemaTypes/objects/svgItem";
import textItem from "@schemaTypes/objects/textItem";

import project from "@schemaTypes/documents/project";
import header from "@schemaTypes/documents/header";
import footer from "@schemaTypes/documents/footer";
import heroSection from "@schemaTypes/documents/heroSection";
import cardsSection from "@schemaTypes/documents/cardsSection";
import featuredWorkSection from "@schemaTypes/documents/featuredWorkSection";
import animatedListSection from "@schemaTypes/documents/animatedListSection";
import indexedGridSection from "@schemaTypes/documents/indexedGridSection";
import accordionSection from "@schemaTypes/documents/accordionSection";
import contentBlockSection from "@schemaTypes/documents/contentBlockSection";
import aboutHero from "@schemaTypes/documents/aboutHero";
import logoSection from "@schemaTypes/documents/logoSection";
import storySection from "@schemaTypes/documents/storySection";

import homePage from "@schemaTypes/documents/homePage";
import aboutPage from "@schemaTypes/documents/aboutPage";
import workHero from "@schemaTypes/documents/workHero";
import workSliderSection from "@schemaTypes/documents/workSliderSection";


export const schemaTypes = [
  // objects
  customImage,
  link,
  ctaButton,
  media,
  headline,
  availability,
  contact,
  linkField,
  richText,
  logoImage,
  svgItem,
  textItem,
  // documents
  project,
  header,
  footer,
  heroSection,
  cardsSection,
  featuredWorkSection,
  animatedListSection,
  indexedGridSection,
  accordionSection,
  contentBlockSection,
  aboutHero,
  logoSection,
  storySection,
  // page builder singletons
  homePage,
  aboutPage,
  workHero,
  workSliderSection,
];
