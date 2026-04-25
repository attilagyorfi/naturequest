type QuestCategoryLike = {
  slug: string;
  name: string;
};

type QuestBriefLike = {
  title: string;
  category: QuestCategoryLike;
};

export function getBriefNarrationProfile(quest: QuestBriefLike) {
  switch (quest.category.slug) {
    case "termeszet":
      return {
        voice: "sage",
        spokenLabel: "csendes, figyelo, termeszetjaro",
        textTone:
          "Legyen nyugodt, szemlelodo, termeszetkozeli es kivancsisagot ebreszto.",
        speechTone:
          "Beszelj magyarul nyugodt, szemlelodo, termeszetkozeli hangnemben, puhabb ritmussal.",
      };
    case "tortenelem":
      return {
        voice: "alloy",
        spokenLabel: "felfedezo, tiszteletteljes, kalandos",
        textTone:
          "Legyen felfedezo, kicsit unnepelyes, de tovabbra is gyerekbarat es konkret.",
        speechTone:
          "Beszelj magyarul tiszta, felfedezo, enyhen unnepelyes hangnemben, jo artikulacioval.",
      };
    case "irodalom":
      return {
        voice: "coral",
        spokenLabel: "meleg, kepzeletgazdag, inspiralo",
        textTone:
          "Legyen meleg, kepzeletet mozgo, kreativ es finoman meselo hangulatu.",
        speechTone:
          "Beszelj magyarul meleg, kreativ, meselo hangnemben, termeszetes es baratsagos ritmussal.",
      };
    case "kozgazdasagtan":
      return {
        voice: "verse",
        spokenLabel: "baratsagos, tiszta, magabiztos",
        textTone:
          "Legyen tiszta, konnyen ertheto, gyakorlatias es batorito.",
        speechTone:
          "Beszelj magyarul tiszta, konnyen ertheto, baratsagos es lenduletes hangnemben.",
      };
    default:
      return {
        voice: "coral",
        spokenLabel: "baratsagos, nyugodt, gyerekbarat",
        textTone:
          "Legyen rovid, baratsagos, gyerekbarat es konkret.",
        speechTone:
          "Beszelj magyarul meleg, nyugodt, gyerekbarat hangnemben, termeszetes ritmussal.",
      };
  }
}
