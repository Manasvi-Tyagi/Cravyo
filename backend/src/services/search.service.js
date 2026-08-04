const { Client } = require('@elastic/elasticsearch');
const config = require('../config');

let client;
let available = false;

function getSearchClient() {
  if (!config.elasticsearchNode) return null;
  if (!client) {
    const options = { node: config.elasticsearchNode };
    if (config.elasticsearchApiKey) options.auth = { apiKey: config.elasticsearchApiKey };
    client = new Client(options);
  }
  return client;
}

async function connectSearch() {
  const search = getSearchClient();
  if (!search) {
    console.warn('[Elasticsearch] ELASTICSEARCH_NODE is not configured; indexed search is disabled');
    return false;
  }
  await search.ping();
  const exists = await search.indices.exists({ index: config.elasticsearchIndex });
  if (!exists) {
    await search.indices.create({
      index: config.elasticsearchIndex,
      mappings: {
        properties: {
          name: { type: 'text' }, description: { type: 'text' },
          restaurantName: { type: 'text' }, cuisine: { type: 'keyword' },
          ingredients: { type: 'text' }, dietary: { type: 'keyword' },
          mood: { type: 'keyword' }, createdAt: { type: 'date' },
        },
      },
    });
  }
  available = true;
  console.log('Elasticsearch connected');
  return true;
}

function isSearchAvailable() { return available; }

function productDocument(product) {
  const raw = product.toObject ? product.toObject() : product;
  return {
    name: raw.name,
    description: raw.description || '',
    restaurantName: raw.merchant?.restaurantName || raw.merchant?.name || '',
    cuisine: raw.tags?.cuisine || '',
    ingredients: raw.tags?.ingredients || [],
    dietary: raw.tags?.dietary || [],
    mood: raw.tags?.mood || [],
    createdAt: raw.createdAt,
  };
}

async function indexProduct(product) {
  if (!isSearchAvailable()) return false;
  await client.index({
    index: config.elasticsearchIndex,
    id: product._id.toString(),
    document: productDocument(product),
    refresh: false,
  });
  return true;
}

async function searchProductIds(query, page, limit) {
  if (!isSearchAvailable()) return null;
  const result = await client.search({
    index: config.elasticsearchIndex,
    from: (page - 1) * limit,
    size: limit,
    query: {
      multi_match: {
        query,
        fields: ['name^4', 'restaurantName^3', 'description^2', 'cuisine', 'ingredients', 'dietary', 'mood'],
        fuzziness: 'AUTO',
      },
    },
  });
  const total = typeof result.hits.total === 'number' ? result.hits.total : result.hits.total.value;
  return { ids: result.hits.hits.map((hit) => hit._id), total };
}

async function bulkReplaceProducts(products) {
  if (!isSearchAvailable()) return false;
  const operations = products.flatMap((product) => [
    { index: { _index: config.elasticsearchIndex, _id: product._id.toString() } },
    productDocument(product),
  ]);
  if (operations.length) {
    const result = await client.bulk({ operations, refresh: true });
    if (result.errors) throw new Error('Elasticsearch bulk product synchronization failed');
  }
  const liveIds = products.map((product) => product._id.toString());
  await client.deleteByQuery({
    index: config.elasticsearchIndex,
    query: liveIds.length ? { bool: { must_not: { ids: { values: liveIds } } } } : { match_all: {} },
    refresh: true,
  });
  return true;
}

async function closeSearch() {
  if (client) await client.close();
  client = undefined;
  available = false;
}

module.exports = {
  connectSearch, getSearchClient, isSearchAvailable,
  indexProduct, searchProductIds, bulkReplaceProducts, productDocument,
  closeSearch,
};
