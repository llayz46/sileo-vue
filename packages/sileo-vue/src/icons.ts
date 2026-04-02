import { h, type FunctionalComponent } from "vue";

type SVGProps = Record<string, unknown>;

const svgBase: SVGProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 12,
  height: 12,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2.5,
  "stroke-linecap": "round" as const,
  "stroke-linejoin": "round" as const,
};

export const Check: FunctionalComponent = () =>
  h("svg", svgBase, [
    h("title", "Check"),
    h("path", { d: "M20 6 9 17l-5-5" }),
  ]);

export const X: FunctionalComponent = () =>
  h("svg", svgBase, [
    h("title", "Error"),
    h("path", { d: "M18 6 6 18" }),
    h("path", { d: "m6 6 12 12" }),
  ]);

export const AlertTriangle: FunctionalComponent = () =>
  h("svg", svgBase, [
    h("title", "Warning"),
    h("path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }),
    h("path", { d: "M12 9v4" }),
    h("path", { d: "M12 17h.01" }),
  ]);

export const Info: FunctionalComponent = () =>
  h("svg", svgBase, [
    h("title", "Info"),
    h("circle", { cx: 12, cy: 12, r: 10 }),
    h("path", { d: "M12 16v-4" }),
    h("path", { d: "M12 8h.01" }),
  ]);

export const LoaderCircle: FunctionalComponent<{ spin?: boolean }> = (props) =>
  h(
    "svg",
    {
      ...svgBase,
      ...(props.spin ? { "data-sileo-icon": "spin" } : {}),
    },
    [
      h("title", "Loading"),
      h("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" }),
    ]
  );

export const Zap: FunctionalComponent = () =>
  h("svg", svgBase, [
    h("title", "Action"),
    h("path", { d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" }),
  ]);
