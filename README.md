# FOSS4G Europe 2025

![Wikidata Badge](https://img.shields.io/badge/Wikidata-069?logo=wikidata&logoColor=fff&style=for-the-badge)
![Wikipedia Badge](https://img.shields.io/badge/Wikipedia-000?logo=wikipedia&logoColor=fff&style=for-the-badge)
![Node.js Badge](https://img.shields.io/badge/Node.js-5FA04E?logo=nodedotjs&logoColor=fff&style=for-the-badge)
![Qgis Badge](https://img.shields.io/badge/Qgis-589632?logo=qgis&logoColor=fff&style=for-the-badge)
![Lighthouse Badge](https://img.shields.io/badge/Lighthouse-F44B21?logo=lighthouse&logoColor=fff&style=for-the-badge)

Map Gallery Submission for [FOSS4G Europe 2025 Mostar](https://2025.europe.foss4g.org/). The city website URL-s are from Wikipedia [List of cities in Bosnia and Herzegovina](https://en.wikipedia.org/wiki/List_of_cities_in_Bosnia_and_Herzegovina).

## 🏃 Running

1. Make sure you have node installed

```bash
node -v
```

2. Install all the packages

```bash
npm i
```

3. Get the city names and urls scores (uses Wikipedia API and ReGex)

```bash
node 01-get-cities-with-url.js
```

📌 Note: some website were missing (Livno and Prnjavor). Additionally, Laktaši directed to some Korean casino site. So I added them manually.

4. Get the website accessibility scores (uses lighthouse)

```bash
node 02-get-accessibility-score.js
```

5. Get the city coordinates (uses Wikidata) in GeoJSON

```bash
node 03-get-coordinates.js
```

Then the visualization was done in QGIS and the final output can be seen in [output/foss4g-2025-kasekamp.png](output/foss4g-2025-kasekamp.png). Intermediate outputs are in [data](/data/) directory.

## 🤴 Contact

![LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)
![Outlook](https://img.shields.io/badge/Microsoft_Outlook-0078D4?style=for-the-badge&logo=microsoft-outlook&logoColor=white)

💼 [Andres Kasekamp](https://www.linkedin.com/in/andres-kasekamp-a226b2198) \
📧 [andres.kasekamp@maaruum.ee](mailto:andres.kasekamp@maaruum.ee)

<div>
    <img
        alt="MaRu logo" 
        height="100px"
        src="https://maaruum.ee/sites/default/files/Maa-%20ja%20Ruumiamet_sinine.svg">
</div>
<br>
