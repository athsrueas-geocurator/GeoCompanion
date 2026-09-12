import {
  EDUCATION_SPACE as SPACE,
  QUESTION_COLLECTION,
} from '../../config/geo.mjs';
import { geoReader } from '../../shared/geo/client.mjs';
import { completeEdges, REL, validId } from '../../shared/geo/collections.mjs';
export const QUESTION = '4318a1d2c441455cb76544049c45e6cf';
export const ANSWER = 'a4fa26b57a4b41559d5cd571519fe527';
export const ANSWERS = '73609ae8644c4463a50a90a3ee585746';
const NAME = 'a126ca530c8e48d5b88882c734c38935',
  DESC = '9b1f76ff9711404c861e59dc3fa7d037',
  URL = '412ff593e9154012a43d4c27ec5c68b6',
  TYPES = '8f151ba4de204e3c9cb499ddf96f48f1';
export const QUERY = `query QuestionRecords($space:UUID!,$ids:[UUID!]!){entitiesConnection(first:50,spaceId:$space,filter:{id:{in:$ids}}){nodes{id values(first:20,filter:{spaceId:{is:$space},propertyId:{in:["${NAME}","${DESC}","${URL}"]}}){nodes{propertyId spaceId text}pageInfo{hasNextPage}} relations(first:20,filter:{spaceId:{is:$space},typeId:{is:"${TYPES}"}}){nodes{toEntityId spaceId}pageInfo{hasNextPage}}}pageInfo{hasNextPage}}}`;
export function parseRecords(data, ids, type) {
  const c = data.entitiesConnection;
  if (!Array.isArray(c?.nodes) || c.pageInfo?.hasNextPage !== false)
    throw Error('Entries could not be loaded completely.');
  return c.nodes.map((e) => {
    if (!ids.includes(e.id) || !validId(e.id))
      throw Error('Unexpected entry returned.');
    const unavailable = {
      id: e.id,
      name: 'Entry unavailable',
      description: '',
      url: '',
      unavailable: true,
    };
    if (
      e.values?.pageInfo?.hasNextPage !== false ||
      e.relations?.pageInfo?.hasNextPage !== false ||
      !Array.isArray(e.values?.nodes) ||
      !Array.isArray(e.relations?.nodes)
    )
      return unavailable;
    if (
      e.values.nodes.some((v) => v.spaceId !== SPACE) ||
      e.relations.nodes.some((r) => r.spaceId !== SPACE)
    )
      return unavailable;
    if (!e.relations.nodes.some((r) => r.toEntityId === type))
      return unavailable;
    const text = (p) => {
      const vs = [
        ...new Set(
          e.values.nodes
            .filter((v) => v.propertyId === p && typeof v.text === 'string')
            .map((v) => v.text),
        ),
      ];
      if (vs.length > 1) throw Error('Conflicting text.');
      return vs[0] || '';
    };
    try {
      const name = text(NAME);
      return {
        id: e.id,
        name: name || 'Untitled entry',
        description: text(DESC),
        url: text(URL),
        unavailable: !name,
      };
    } catch {
      return unavailable;
    }
  });
}
async function records(ids, type) {
  const all = [];
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    all.push(
      ...(await geoReader.read(
        QUERY,
        { space: SPACE, ids: batch },
        (d) => parseRecords(d, batch, type),
        `questions-${type}`,
      )),
    );
  }
  return all;
}
export async function loadQuestions() {
  const blocks = await completeEdges(SPACE, QUESTION_COLLECTION, REL.blocks);
  const edges = [];
  for (const b of blocks)
    edges.push(...(await completeEdges(SPACE, b.toEntityId, REL.item)));
  const ids = [...new Set(edges.map((e) => e.toEntityId))];
  if (ids.length > 1000) throw Error('This collection is too large to open.');
  const entries = new Map((await records(ids, QUESTION)).map((e) => [e.id, e]));
  return ids.map(
    (id) =>
      entries.get(id) || {
        id,
        name: 'Entry unavailable',
        description: '',
        url: '',
        unavailable: true,
      },
  );
}
export async function loadAnswers(id) {
  const edges = await completeEdges(SPACE, id, ANSWERS);
  const ids = [...new Set(edges.map((e) => e.toEntityId))];
  const entries = new Map((await records(ids, ANSWER)).map((e) => [e.id, e]));
  return ids.map(
    (id) =>
      entries.get(id) || {
        id,
        name: 'Answer unavailable',
        description: '',
        url: '',
        unavailable: true,
      },
  );
}
