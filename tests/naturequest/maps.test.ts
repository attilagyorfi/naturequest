import assert from "node:assert/strict";
import test from "node:test";
import {
  buildGoogleMapsEmbedUrl,
  buildGoogleMapsSearchUrl,
  buildQuestMapQuery,
} from "../../src/lib/maps";

test("buildQuestMapQuery combines title, hint, and country", () => {
  assert.equal(
    buildQuestMapQuery("Erdei nyomkereso", "kozeli park"),
    "Erdei nyomkereso, kozeli park, Hungary"
  );
});

test("buildGoogleMapsEmbedUrl returns null without an api key", () => {
  assert.equal(buildGoogleMapsEmbedUrl("Budapest", undefined), null);
});

test("buildGoogleMapsEmbedUrl builds a place embed url", () => {
  const url = buildGoogleMapsEmbedUrl("Budapest", "test-key");
  assert.ok(url?.startsWith("https://www.google.com/maps/embed/v1/place?"));
  assert.match(url ?? "", /key=test-key/);
  assert.match(url ?? "", /q=Budapest/);
});

test("buildGoogleMapsSearchUrl builds a public search url", () => {
  const url = buildGoogleMapsSearchUrl("Erdei nyomkereso");
  assert.ok(url.startsWith("https://www.google.com/maps/search/?"));
  assert.match(url, /api=1/);
  assert.match(url, /query=Erdei\+nyomkereso/);
});
