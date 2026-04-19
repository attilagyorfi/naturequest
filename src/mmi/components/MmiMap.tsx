"use client";

import { useEffect, useMemo, useState } from "react";

import type { CountryProjectGroup } from "@/mmi/types";

type Props = {
  groups: CountryProjectGroup[];
  detailed: boolean;
  selectedCountry: string | null;
  selectedGroupId: string | null;
  onSelectGroup: (group: CountryProjectGroup) => void;
};

type Geometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

type GeoFeature = {
  type: "Feature";
  properties?: { name?: string };
  geometry: Geometry | null;
};

type GeoJson = {
  type: "FeatureCollection";
  features: GeoFeature[];
};

const WIDTH = 1200;
const HEIGHT = 560;
const MIN_LAT = -58;
const MAX_LAT = 84;

export default function MmiMap({
  groups,
  detailed,
  selectedCountry,
  selectedGroupId,
  onSelectGroup,
}: Props) {
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [zoom, setZoom] = useState(() => (detailed ? 2.4 : 1));

  useEffect(() => {
    let mounted = true;

    fetch("/mmi-data/world-countries.geojson")
      .then((response) => response.json() as Promise<GeoJson>)
      .then((geoJson) => {
        if (mounted) {
          setFeatures(geoJson.features.filter((feature) => feature.geometry));
        }
      })
      .catch((error) => {
        console.error("Unable to load world map", error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const paths = useMemo(
    () =>
      features
        .map((feature, index) => ({
          id: `${feature.properties?.name ?? "country"}-${index}`,
          name: feature.properties?.name ?? "",
          d: feature.geometry ? geometryToPath(feature.geometry) : "",
        }))
        .filter((path) => path.d),
    [features],
  );

  const viewWidth = WIDTH / zoom;
  const viewHeight = HEIGHT / zoom;
  const center = detailed && groups.length > 0 ? getGroupCenter(groups) : [WIDTH / 2, HEIGHT / 2];
  const viewX = clamp(center[0] - viewWidth / 2, 0, WIDTH - viewWidth);
  const viewY = clamp(center[1] - viewHeight / 2, 0, HEIGHT - viewHeight);

  return (
    <div className="mmi-map mmi-svg-map" aria-label="MMI references world map">
      <div className="mmi-zoom-controls" aria-label="Map zoom controls">
        <button type="button" onClick={() => setZoom((value) => Math.min(value + 0.5, 4))}>
          +
        </button>
        <button type="button" onClick={() => setZoom((value) => Math.max(value - 0.5, 1))}>
          -
        </button>
        <button type="button" onClick={() => setZoom(detailed ? 2.4 : 1)}>
          Reset
        </button>
      </div>
      <svg viewBox={`${viewX} ${viewY} ${viewWidth} ${viewHeight}`} role="img">
        <rect width={WIDTH} height={HEIGHT} className="mmi-map-ocean" />
        <g className="mmi-map-countries">
          {paths.map((path) => (
            <path key={path.id} d={path.d} aria-label={path.name} />
          ))}
        </g>
        <g className="mmi-map-markers">
          {groups.map((group) => {
            const [x, y] = project(group.longitude, group.latitude);
            const isSelected =
              selectedGroupId === group.id ||
              (!selectedGroupId && selectedCountry === group.country && !detailed);
            const markerRadius = detailed ? 12 : 17;

            return (
              <g
                key={group.id}
                className={`mmi-svg-marker ${isSelected ? "selected" : ""}`}
                style={
                  {
                    "--marker-color": group.color,
                    "--marker-radius": markerRadius,
                  } as React.CSSProperties
                }
                transform={`translate(${x} ${y})`}
                onClick={() => onSelectGroup(group)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectGroup(group);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${group.label}: ${group.projects.length} projects`}
              >
                <circle r={markerRadius} />
                <text dy="4">{group.projects.length}</text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function geometryToPath(geometry: Geometry): string {
  if (geometry.type === "Polygon") {
    return polygonToPath(geometry.coordinates as number[][][]);
  }

  return (geometry.coordinates as number[][][][])
    .map((polygon) => polygonToPath(polygon))
    .join(" ");
}

function polygonToPath(polygon: number[][][]): string {
  return polygon
    .map((ring) =>
      ring
        .map(([longitude, latitude], index) => {
          const [x, y] = project(longitude, latitude);
          return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(" ")
        .concat(" Z"),
    )
    .join(" ");
}

function project(longitude: number, latitude: number): [number, number] {
  const x = ((longitude + 180) / 360) * WIDTH;
  const clampedLatitude = Math.max(MIN_LAT, Math.min(MAX_LAT, latitude));
  const y = ((MAX_LAT - clampedLatitude) / (MAX_LAT - MIN_LAT)) * HEIGHT;
  return [x, y];
}

function getGroupCenter(groups: CountryProjectGroup[]): [number, number] {
  const points = groups.map((group) => project(group.longitude, group.latitude));
  const x = points.reduce((sum, point) => sum + point[0], 0) / points.length;
  const y = points.reduce((sum, point) => sum + point[1], 0) / points.length;
  return [x, y];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
