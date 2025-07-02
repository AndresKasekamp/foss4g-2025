import fetch from "node-fetch";
import wtf from "wtf_wikipedia";
import { extractWebsiteFromWikitext, exportToExcel, excelCityWebsites, WIKIPEDIA_API_URL } from "./utils.js"; // Assuming this function is defined in utils.js

const ARTICLE_TITLE = "List of cities in Bosnia and Herzegovina";
const TARGET_SECTION = "Organization";

async function getCityWebsiteFromInfobox(cityPageTitle) {
  try {
    const apiUrl = new URL(WIKIPEDIA_API_URL);
    apiUrl.search = new URLSearchParams({
      action: "query",
      titles: cityPageTitle,
      prop: "revisions",
      rvprop: "content",
      formatversion: "2",
      format: "json",
      rvsection: "0",
    }).toString();

    console.log(`🔍 Fetching wikitext for "${cityPageTitle}"...`);

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const page = data?.query?.pages?.[0];
    const wikitext = page?.revisions?.[0]?.content;

    if (!wikitext) {
      console.warn(`⚠️ No wikitext found for "${cityPageTitle}".`);
      return null;
    }

    const website = extractWebsiteFromWikitext(wikitext);

    if (website) {
      return website;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`💥 Error retrieving infobox for "${cityPageTitle}":`, error);
    return null;
  }
}

async function getWikiSectionWikitext(pageTitle, sectionName) {
  try {
    // Helper to build API URL with parameters
    const buildApiUrl = (params) => {
      const url = new URL(WIKIPEDIA_API_URL);
      url.search = new URLSearchParams(params).toString();
      return url;
    };

    // Step 1: Get all section metadata
    const sectionsUrl = buildApiUrl({
      action: "parse",
      page: pageTitle,
      prop: "sections",
      format: "json",
    });

    const sectionsRes = await fetch(sectionsUrl);
    if (!sectionsRes.ok) throw new Error(`HTTP error: ${sectionsRes.status}`);
    const sectionsData = await sectionsRes.json();

    if (sectionsData?.error) {
      throw new Error(`Wikipedia API error: ${sectionsData.error.info}`);
    }

    const sections = sectionsData?.parse?.sections || [];
    const targetSection = sections.find(
      (s) => s.line.toLowerCase() === sectionName.toLowerCase()
    );

    if (!targetSection) {
      console.warn(`⚠️ Section "${sectionName}" not found in "${pageTitle}".`);
      return null;
    }

    const sectionId = targetSection.index;
    console.log(`📄 Found section "${sectionName}" with ID: ${sectionId}`);

    // Step 2: Fetch the wikitext content of the target section
    const wikitextUrl = buildApiUrl({
      action: "parse",
      page: pageTitle,
      prop: "wikitext",
      section: sectionId,
      format: "json",
    });

    const wikitextRes = await fetch(wikitextUrl);
    if (!wikitextRes.ok) throw new Error(`HTTP error: ${wikitextRes.status}`);
    const wikitextData = await wikitextRes.json();

    if (wikitextData?.error) {
      throw new Error(`Wikipedia API error: ${wikitextData.error.info}`);
    }

    return wikitextData?.parse?.wikitext?.["*"] || null;
  } catch (error) {
    console.error(
      `💥 Error fetching wikitext for "${sectionName}" section in "${pageTitle}":`,
      error
    );
    return null;
  }
}

async function extractCitiesAndLinks(wikitext) {
  if (!wikitext) {
    return [];
  }

  // Use wtf_wikipedia to parse the wikitextF
  const doc = wtf(wikitext);
  const cities = [];

  const lists = doc.lists();
  lists.forEach((list) => {
    list.lines().forEach((line) => {
      line.links().forEach((link) => {
        // Check if the link is an internal Wikipedia link
        if (link.wiki) {
          cities.push(link.page());
        }
      });
    });
  });

  // Filter out duplicates based on the URL or name if necessary
  console.log(
    `Found ${cities.length} unique cities with links in the "${TARGET_SECTION}" section.`
  );
  return cities;
}

async function main() {
  const wikitext = await getWikiSectionWikitext(ARTICLE_TITLE, TARGET_SECTION);

  if (wikitext) {
    const citiesData = await extractCitiesAndLinks(wikitext);

    if (citiesData.length > 0) {
      const cityURL = [];
      for (let city of citiesData) {
        const cityWebsite = await getCityWebsiteFromInfobox(city);
        if (cityWebsite) {
          console.log(`🌐Official website for ${city}: ${cityWebsite}`);
          cityURL.push({ city, url: cityWebsite });
        } else {
          console.log(`❌No official website found for ${city}.`);
          cityURL.push({ city, url: null });
        }
      }
      exportToExcel(cityURL, excelCityWebsites);
      console.log("✅ Exported city websites to Excel file.");
    } else {
      console.log(
        "No cities or links found in the 'Organization' section, or section structure is unexpected."
      );
    }
  } else {
    console.log("Could not retrieve wikitext for the 'Organization' section.");
  }
}

main();
