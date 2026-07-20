import os
import json
import geopandas as gpd
import pandas as pd

# ============================================================
# Configurações
# ============================================================

PASTA_SHP = "./"          
CSV_VAZAO = "IPH_20260719.csv"  
SAIDA = "rios_vazao.geojson"

# ============================================================
# Relação Shapefile -> Nome da série no CSV
# ============================================================

MAPA_VAZAO = {
    "Camaqua": "Qcamaqua",
    "Piratini": "Qpiratini",
    "Jaguarao": "Qjaguarao",
    "Taquari": "Qtacuari",
    "Cebollati": "Qcebollati",
    "S_Goncalo": "Qsaogoncalo",
}

# ============================================================
# Lê CSV
# ============================================================

df = pd.read_csv(CSV_VAZAO)

# primeira coluna contém o nome das séries
df = df.set_index(df.columns[0])

# transforma cada linha em dicionário
vazoes = {}

for indice, linha in df.iterrows():
    vazoes[indice] = {}

    for coluna in df.columns:
        valor = linha[coluna]

        if pd.notna(valor):
            vazoes[indice][coluna] = float(valor)
        else:
            vazoes[indice][coluna] = None

# ============================================================
# Lê e une shapefiles
# ============================================================

geojsons = []

for shp, serie_csv in MAPA_VAZAO.items():

    caminho = os.path.join(PASTA_SHP, f"{shp}.shp")

    print(f"Lendo {caminho}")

    gdf = gpd.read_file(caminho)

    # garante WGS84 para uso no React/Mapbox/Leaflet
    gdf = gdf.to_crs(epsg=4326)

    # adiciona informações
    gdf["rio"] = shp
    gdf["serie"] = serie_csv

    # adiciona todas as vazões
    gdf["vazao"] = json.dumps(vazoes[serie_csv])

    geojsons.append(gdf)

# ============================================================
# Une tudo
# ============================================================

gdf_final = gpd.GeoDataFrame(
    pd.concat(geojsons, ignore_index=True),
    crs="EPSG:4326"
)

# ============================================================
# Converte string JSON novamente para objeto
# ============================================================

geojson = json.loads(gdf_final.to_json())

for feature in geojson["features"]:
    feature["properties"]["vazao"] = json.loads(
        feature["properties"]["vazao"]
    )

# ============================================================
# Salva
# ============================================================

with open(SAIDA, "w", encoding="utf-8") as f:
    json.dump(geojson, f, ensure_ascii=False)

print(f"\nGeoJSON salvo em {SAIDA}")