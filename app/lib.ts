import { twMerge } from "tailwind-merge";

export function classes(...classLists: (string | null | undefined | false)[]) {
  return twMerge(
    ...classLists.map((classList) => (!classList ? null : classList))
  );
}
