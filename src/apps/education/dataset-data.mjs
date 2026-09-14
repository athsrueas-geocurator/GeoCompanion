import {
  EDUCATION_SPACE as SPACE,
  EDUCATION_CATALOG,
} from '../../config/geo.mjs';
import { geoReader } from '../../shared/geo/client.mjs';
import { BLOCK, orderedBlockRecords } from './block-capabilities.mjs';
import {
  completeEdges,
  edgeWindow,
  REL,
  validId,
} from '../../shared/geo/collections.mjs';
export const DATASET = '0c4babfb43893486af827341bbf32e09';
export const F = {
  name: 'a126ca530c8e48d5b88882c734c38935',
  description: '9b1f76ff9711404c861e59dc3fa7d037',
  markdown: 'e3e363d1dd294ccb8e6ff3b76d99bc33',
  effect: 'e500e2585a964d2c9df4a47b199616c3',
  se: 'cc28953bd89e406096c9627021f4713d',
  unit: '8405509cc7354655a348591349a5f025',
  grade: '98c0849922164db0822b5a78444c17b3',
  arm: 'a0109f6192b1414fa93fb756779643ed',
  comparison: '061dbc4816b0413b83ebe771ef3d9875',
  related: 'dfa6aebe1ca94bf29faccc4cc7afb24c',
  estimand: 'ba643714da274c37a340a7f8396198dc',
  actualMean: '698a64065ce14aa2b0022605e6b803c1',
  estimatedCounterfactual: '7711cba8c1ed4db0bc3d3afc2709d240',
  outcome: '0e1320cbf9b3b4f5fe066780d1803b13',
  followup: 'c962e0fb4a3148e5ba125144691236a8',
};
const fields = `id name spaceIds values(first:100,filter:{spaceId:{is:$space}}){nodes{propertyId spaceId property{id name} text decimal integer boolean}pageInfo{hasNextPage}}`;
export const RECORDS = `query DatasetRecords($space:UUID!,$ids:[UUID!]!){entitiesConnection(first:50,spaceId:$space,filter:{id:{in:$ids}}){nodes{${fields} relations(first:100,filter:{spaceId:{is:$space}}){nodes{id typeId spaceId type{id name}toEntityId toEntity{id name spaceIds}}pageInfo{hasNextPage}}}pageInfo{hasNextPage}}}`;
// Collection members have their own cursor reader. Do not fetch them again
// merely to determine whether a block is an explicit collection.
export const BLOCK_RECORDS = `query DatasetBlockRecords($space:UUID!,$ids:[UUID!]!){entitiesConnection(first:50,spaceId:$space,filter:{id:{in:$ids}}){nodes{${fields} relations(first:100,filter:{spaceId:{is:$space},typeId:{in:["${BLOCK.types}","${BLOCK.source}"]}}){nodes{id typeId spaceId type{id name}toEntityId toEntity{id name spaceIds}}pageInfo{hasNextPage}}}pageInfo{hasNextPage}}}`;
export function parseRecord(e) {
  const invalid = {
    id: e.id,
    name: e.name || 'Entry unavailable',
    description: '',
    fields: [],
    relations: [],
    unavailable: true,
  };
  if (
    !validId(e.id) ||
    !Array.isArray(e.values?.nodes) ||
    !Array.isArray(e.relations?.nodes) ||
    e.values.pageInfo?.hasNextPage !== false ||
    e.relations.pageInfo?.hasNextPage !== false
  )
    return invalid;
  if (
    e.values.nodes.some((v) => v.spaceId !== SPACE) ||
    e.relations.nodes.some((r) => r.spaceId !== SPACE)
  )
    return invalid;
  const grouped = new Map();
  for (const v of e.values.nodes) {
    const value = v.decimal ?? v.integer ?? v.boolean ?? v.text;
    if (value === null || value === undefined) continue;
    const prior = grouped.get(v.propertyId);
    if (prior && String(prior.value) !== String(value)) return invalid;
    grouped.set(v.propertyId, {
      id: v.propertyId,
      name: v.property?.name || 'Field',
      value,
      numeric: v.decimal != null || v.integer != null,
    });
  }
  const fs = [...grouped.values()];
  return {
    id: e.id,
    name: String(grouped.get(F.name)?.value || e.name || 'Untitled entry'),
    description: String(grouped.get(F.description)?.value || ''),
    fields: fs,
    relations: e.relations.nodes,
    unavailable: false,
  };
}
export async function datasetRecords(ids, query = RECORDS) {
  const rows = [];
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    rows.push(
      ...(await geoReader.read(
        query,
        { space: SPACE, ids: batch },
        (d) => {
          const c = d.entitiesConnection;
          if (!Array.isArray(c?.nodes) || c.pageInfo?.hasNextPage !== false)
            throw Error('Records could not be loaded completely.');
          if (c.nodes.some((e) => !batch.includes(e.id)))
            throw Error('Unexpected record.');
          return c.nodes.map(parseRecord);
        },
        'dataset-records-1',
      )),
    );
  }
  return rows;
}
export async function datasetBlocks(id) {
  const edges = await completeEdges(SPACE, id, REL.blocks);
  const records = await datasetRecords(
    [...new Set(edges.map((e) => e.toEntityId))],
    BLOCK_RECORDS,
  );
  return orderedBlockRecords(edges, records);
}
export async function datasetCatalog() {
  const edges = await completeEdges(SPACE, EDUCATION_CATALOG, REL.item);
  const ids = [...new Set(edges.map((e) => e.toEntityId))];
  const q = `query CatalogRecords($space:UUID!,$ids:[UUID!]!){entitiesConnection(first:50,spaceId:$space,typeId:"${DATASET}",filter:{id:{in:$ids}}){nodes{id name values(first:4,filter:{spaceId:{is:$space},propertyId:{in:["${F.name}","${F.description}"]}}){nodes{propertyId text}pageInfo{hasNextPage}}}pageInfo{hasNextPage}}}`;
  const rows = [];
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    rows.push(
      ...(await geoReader.read(
        q,
        { space: SPACE, ids: batch },
        (d) => {
          const c = d.entitiesConnection;
          if (!Array.isArray(c?.nodes) || c.pageInfo?.hasNextPage !== false)
            throw Error('Catalog could not be read completely.');
          return c.nodes
            .filter((e) => e.values?.pageInfo?.hasNextPage === false)
            .map((e) => ({
              id: e.id,
              name:
                e.values.nodes.find((v) => v.propertyId === F.name)?.text ||
                e.name ||
                'Untitled dataset',
              description:
                e.values.nodes.find((v) => v.propertyId === F.description)
                  ?.text || '',
            }));
        },
        'catalog-members-1',
      )),
    );
  }
  const byId = new Map(rows.map((r) => [r.id, r]));
  return {
    rows: ids.map(
      (id) =>
        byId.get(id) || {
          id,
          name: 'Dataset unavailable',
          description: '',
          unavailable: true,
        },
    ),
    next: null,
  };
}
export async function resultRows(id) {
  const edges = await completeEdges(SPACE, id, REL.item);
  return hydrateResults(edges);
}
/** @param {string} id @param {any} previous */
export async function resultPage(id, previous = null) {
  const page = await edgeWindow(SPACE, id, REL.item, previous);
  return { page, rows: await hydrateResults(page.edges) };
}
async function hydrateResults(edges) {
  const ids = [...new Set(edges.map((e) => e.toEntityId))];
  const records = new Map((await datasetRecords(ids)).map((r) => [r.id, r]));
  const related = [
    ...new Set(
      [...records.values()].flatMap((r) =>
        r.relations
          .filter((e) => e.typeId === F.related)
          .map((e) => e.toEntityId),
      ),
    ),
  ];
  const studies = new Set();
  for (let i = 0; i < related.length; i += 50) {
    const batch = related.slice(i, i + 50);
    const q = `query ResultStudies($space:UUID!,$ids:[UUID!]!){entitiesConnection(first:50,spaceId:$space,typeId:"3ef269bc5f114691abc02dcbf398fd63",filter:{id:{in:$ids}}){nodes{id}pageInfo{hasNextPage}}}`;
    const found = await geoReader.read(
      q,
      { space: SPACE, ids: batch },
      (d) => {
        const c = d.entitiesConnection;
        if (!Array.isArray(c?.nodes) || c.pageInfo?.hasNextPage !== false)
          throw Error('Study identity could not be checked.');
        return c.nodes.map((e) => e.id);
      },
      'study-members-1',
    );
    found.forEach((x) => studies.add(x));
  }
  for (const record of records.values())
    records.set(record.id, {
      ...record,
      studyIds: record.relations
        .filter((e) => e.typeId === F.related && studies.has(e.toEntityId))
        .map((e) => e.toEntityId),
    });
  return ids.map(
    (id) =>
      records.get(id) || {
        id,
        name: 'Entry unavailable',
        description: '',
        fields: [],
        relations: [],
        unavailable: true,
      },
  );
}
export function field(record, id) {
  return record.fields.find((f) => f.id === id)?.value ?? null;
}
export function estimate(record) {
  if (record.unavailable) return null;
  const value = field(record, F.effect),
    se = field(record, F.se),
    unit = field(record, F.unit);
  if (
    value === null ||
    se === null ||
    typeof value === 'boolean' ||
    typeof se === 'boolean' ||
    !record.fields.find((f) => f.id === F.effect)?.numeric ||
    !record.fields.find((f) => f.id === F.se)?.numeric ||
    !Number.isFinite(Number(value)) ||
    !Number.isFinite(Number(se)) ||
    Number(se) < 0 ||
    typeof unit !== 'string' ||
    !unit
  )
    return null;
  return { value: Number(value), se: Number(se), unit };
}
