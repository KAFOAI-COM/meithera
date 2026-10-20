-- Meithera — PostGIS examples against the Prisma schema.
-- Property.geo is an AREA CENTROID (geography(Point,4326)); County.boundary is geography(MultiPolygon,4326).
-- Nothing here identifies a building.

-- 1. Homes within 25 km of Dublin city centre (illustrative point), nearest first.
SELECT p."id", p."title", p."location",
       ROUND(ST_Distance(p."geo", ST_SetSRID(ST_MakePoint(-6.2603, 53.3498), 4326)::geography) / 1000.0, 1) AS km
FROM "Property" p
WHERE ST_DWithin(p."geo", ST_SetSRID(ST_MakePoint(-6.2603, 53.3498), 4326)::geography, 25000)
ORDER BY km;

-- 2. Which county contains each home's area centroid (requires County.boundary to be loaded).
SELECT p."id", p."location", c."name" AS county
FROM "Property" p
JOIN "County" c ON ST_Contains(c."boundary"::geometry, p."geo"::geometry);

-- 3. Count open offers per county, with total raise target (loan amount or total project cost).
SELECT c."name",
       COUNT(*) FILTER (WHERE p."status" = 'OPEN') AS open_offers,
       SUM(COALESCE(l."amount", p."acquisition" + p."refurbishment" + p."legal" + p."contingency")) AS raise_target_eur
FROM "Property" p
LEFT JOIN "Loan" l ON l."propertyId" = p."id"
JOIN "County" c ON c."id" = p."countyId"
GROUP BY c."name"
ORDER BY raise_target_eur DESC;

-- 4. Centroids as GeoJSON for a map layer (never a building location).
SELECT p."id", p."location", ST_AsGeoJSON(p."geo")::json AS centroid FROM "Property" p;

-- 5. Supervisor: raised per SPV vs the €5m ECSPR cap.
SELECT s."id" AS spv, s."name",
       SUM(i."netInvested") AS raised_eur,
       ROUND(100.0 * SUM(i."netInvested") / 5000000, 3) AS pct_of_cap
FROM "Spv" s
JOIN "Investment" i ON i."propertyId" = s."propertyId" AND i."status" <> 'Withdrawn (reflection period)'
GROUP BY s."id", s."name";

-- 6. Raya Chain holdings per pseudonymous holder and home (confirmed only).
SELECT t."toRef" AS holder, t."propertyId", SUM(t."units") AS units
FROM "ChainTx" t
WHERE t."type" IN ('ISSUE') AND t."status" = 'CONFIRMED'
GROUP BY t."toRef", t."propertyId"
ORDER BY units DESC;
