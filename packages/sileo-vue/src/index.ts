import "./styles.css";

export { sileo } from "./store";
export { default as Toaster } from "./Toaster.vue";
export { useToast } from "./composables";

export type {
  SileoButton,
  SileoOptions,
  SileoPosition,
  SileoState,
  SileoStyles,
  SileoItem,
  SileoPromiseOptions,
  ToasterProps,
} from "./types";
