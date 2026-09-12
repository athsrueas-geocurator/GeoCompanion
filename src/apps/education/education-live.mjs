export const SPACE = 'dac259bad48a11adf97fe36857d85206';
export const STAR = '9220554acfd249a18920b301dcbb6cf0';
export const STUDY = 'd68c6d1d10af47418fc80ed09d4e097f';
export const P = {
  effect: 'e500e2585a964d2c9df4a47b199616c3',
  se: 'cc28953bd89e406096c9627021f4713d',
  unit: '8405509cc7354655a348591349a5f025',
  n: 'bf0249bb71924460bfe6b35394ed0781',
  locator: '84dacbddca6a44079edb5e11a4c66b40',
  followup: 'c962e0fb4a3148e5ba125144691236a8',
  estimand: 'ba643714da274c37a340a7f8396198dc',
};
export const GRADES = {
  '32ef1b9c498b42c18725f72a93fd2917': 'K',
  c66d539b68a54250889bee59b97fcfc0: '1',
  '74a01717791841c3beef132e8e5cec4e': '2',
  '6fc7ceeb03bf486da5b79bb3874b46ef': '3',
};
export const ARMS = {
  '9c49d94122dc4f54b9311d20b9b10c33': 'Small class',
  '04cc2815daee4657879fd16d5cbec2b2': 'Regular class + aide',
};
export const QUERY = `query StudyEstimates($spaceId: UUID!, $filter: EntityFilter!, $after: Cursor) {
 entitiesConnection(spaceId:$spaceId,typeId:"96f859efa1ca4b229372c86ad58b694b",first:20,after:$after,filter:$filter){
 nodes{id name values(first:30,filter:{spaceId:{is:$spaceId}}){nodes{propertyId text decimal integer} pageInfo{hasNextPage}}
 relations(first:30,filter:{spaceId:{is:$spaceId}}){nodes{typeId toEntityId} pageInfo{hasNextPage}}}
 pageInfo{hasNextPage endCursor}}
}`;
export const VARIABLES = {
  spaceId: SPACE,
  filter: {
    and: [
      {
        relations: {
          some: {
            spaceId: { is: SPACE },
            typeId: { is: 'dfa6aebe1ca94bf29faccc4cc7afb24c' },
            toEntityId: { is: STUDY },
          },
        },
      },
    ],
  },
};
export function parseStudy(payload) {
  const c = payload?.data?.entitiesConnection;
  if (
    payload?.errors?.length ||
    !Array.isArray(c?.nodes) ||
    typeof c.pageInfo?.hasNextPage !== 'boolean'
  )
    throw Error('Geo returned an unreadable study response.');
  if (c.pageInfo.hasNextPage)
    throw Error(
      'This study exceeds the 20-row preview limit. Open the complete dataset on Geo.',
    );
  return c.nodes
    .map((e) => {
      if (
        !/^[a-f0-9]{32}$/i.test(e.id) ||
        !Array.isArray(e.values?.nodes) ||
        !Array.isArray(e.relations?.nodes) ||
        e.values.pageInfo?.hasNextPage !== false ||
        e.relations.pageInfo?.hasNextPage !== false
      )
        throw Error(
          'A study record is incomplete; partial estimates are hidden.',
        );
      const value = (id) => {
        const matches = e.values.nodes.filter((v) => v?.propertyId === id);
        if (matches.length > 1)
          throw Error(
            'A study field has multiple values; inspect the record on Geo.',
          );
        return matches[0];
      };
      const numeric = (id) => {
        const v = value(id);
        const raw = v?.decimal ?? v?.integer;
        if (raw === null || raw === undefined || raw === '') return null;
        if (!['number', 'string'].includes(typeof raw))
          throw Error('A study value has an invalid number.');
        const n = Number(raw);
        if (!Number.isFinite(n))
          throw Error('A study value has an invalid number.');
        return n;
      };
      const text = (id) => {
        const t = value(id)?.text;
        return typeof t === 'string' ? t : null;
      };
      const related = (type) =>
        e.relations.nodes
          .filter((r) => r.typeId === type)
          .map((r) => r.toEntityId);
      const grade =
        GRADES[related('98c0849922164db0822b5a78444c17b3')[0]] ?? 'Unknown';
      const arm =
        ARMS[related('a0109f6192b1414fa93fb756779643ed')[0]] ?? 'Unknown';
      const comparator = related('061dbc4816b0413b83ebe771ef3d9875').includes(
        '4fcc10047b6648f9a9d3aa077e33aadf',
      );
      const effect = numeric(P.effect),
        se = numeric(P.se),
        n = numeric(P.n),
        unit = text(P.unit);
      if (
        (se !== null && se < 0) ||
        (n !== null && (!Number.isSafeInteger(n) || n < 0))
      )
        throw Error('A study record has invalid uncertainty or sample size.');
      return {
        id: e.id,
        name: typeof e.name === 'string' ? e.name : 'Unnamed estimate',
        effect,
        se,
        n,
        unit,
        grade,
        arm,
        locator: text(P.locator),
        followup: text(P.followup),
        estimand: text(P.estimand),
        sources: related('49c5d5e1679a4dbdbfd33f618f227c94'),
        plot:
          effect !== null &&
          se !== null &&
          unit === 'percentile points' &&
          comparator &&
          grade !== 'Unknown' &&
          arm !== 'Unknown',
      };
    })
    .sort(
      (a, b) =>
        ['K', '1', '2', '3'].indexOf(a.grade) -
          ['K', '1', '2', '3'].indexOf(b.grade) || a.arm.localeCompare(b.arm),
    );
}
