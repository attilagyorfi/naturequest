import assert from "node:assert/strict";
import test from "node:test";
import { getBriefNarrationProfile } from "../../src/lib/ai-brief";

test("getBriefNarrationProfile returns a nature-specific voice", () => {
  const profile = getBriefNarrationProfile({
    title: "Erdei nyomkereso",
    category: { slug: "termeszet", name: "Termeszet" },
  });

  assert.equal(profile.voice, "sage");
  assert.match(profile.textTone, /termeszet/i);
});

test("getBriefNarrationProfile returns a literature-specific voice", () => {
  const profile = getBriefNarrationProfile({
    title: "Mese es helyszin",
    category: { slug: "irodalom", name: "Irodalom" },
  });

  assert.equal(profile.voice, "coral");
  assert.match(profile.speechTone, /meselo/i);
});
