import { expect, test } from "bun:test";
import { docsFaults, skillFaults, treeFaults, versionFaults } from "./gate";

const skill = (front: string) => `---\n${front}\n---\n\nBody.\n`;

test("frontmatter: a valid skill passes", () => {
  expect(skillFaults("read-back", skill("name: read-back\ndescription: Read my prompt back to me.\ndisable-model-invocation: true"))).toEqual([]);
  expect(skillFaults("a1", skill('name: "a1"\ndescription: "Quoted."'))).toEqual([]);
});

test("frontmatter: each rule fails on its own", () => {
  const one = (folder: string, front: string, says: string) => expect(skillFaults(folder, skill(front)).join("\n")).toContain(says);
  one("x", "name: y\ndescription: d", "isn't its folder's name");
  one("Bad_Name", "name: Bad_Name\ndescription: d", "lowercase words");
  one("a--b", "name: a--b\ndescription: d", "lowercase words");
  one("a".repeat(65), `name: ${"a".repeat(65)}\ndescription: d`, "≤ 64");
  one("x", "name: x", "description is 0 chars");
  one("x", `name: x\ndescription: ${"d".repeat(1025)}`, "1–1024");
  one("x", "name: x\ndescription: use <tool> here", "no XML tags");
  expect(skillFaults("x", "no frontmatter")[0]).toContain("no frontmatter");
});

test("tree: skills/ holds only SKILL.md and references, assets/ only images; artifacts and unlisted roots fail", () => {
  expect(treeFaults(["skills/a/SKILL.md", "skills/a/references/b.md", "README.md", "assets/a.svg", "assets/a.png"])).toEqual([]);
  const f = treeFaults(["skills/a/run.sh", "skills/a/NOTES.md", "docs/x.md", "stray.txt", "assets/x.jpg"]).join("\n");
  for (const bad of ["skills/a/run.sh", "skills/a/NOTES.md", "docs/x.md: under docs/", "stray.txt: a root entry", "assets/x.jpg: assets/ holds only"]) expect(f).toContain(bad);
});

const SKILL = "## Format\n\n```\n**Intent** — x\n\n**Unclear** — y\n\nGo, correct me, or cancel?\n```\n\n## After\n\n- **Go** → run.\n- **Cancel** (or \"scrap\") → stop.\n";
const README = "- **Go**: runs.\n- **Cancel**: stops.\n\n> **Intent** — a\n>\n> **Unclear** — b\n>\n> Go, correct me, or cancel?\n";

test("docs: a README featuring every reply, section and the closing line passes", () => {
  expect(docsFaults(SKILL, README)).toEqual([]);
});

test("docs: a reply, a section or the closing line the README lacks fails", () => {
  expect(docsFaults(SKILL, README.replace("- **Cancel**: stops.\n", "")).join("\n")).toContain("never names **Cancel**");
  expect(docsFaults(SKILL, README.replace("> **Unclear** — b\n>\n", "")).join("\n")).toContain("no **Unclear** section");
  expect(docsFaults(SKILL, README.replace("Go, correct me, or cancel?", "Go, or correct me?")).join("\n")).toContain("doesn't end on");
  expect(docsFaults("", README).length).toBeGreaterThan(0);
});

test("version: a SKILL.md change without a version bump fails", () => {
  expect(versionFaults(true, "0.2.1", "0.2.1")[0]).toContain("bump it");
  expect(versionFaults(true, "0.2.2", "0.2.1")).toEqual([]);
  expect(versionFaults(false, "0.2.1", "0.2.1")).toEqual([]);
});
