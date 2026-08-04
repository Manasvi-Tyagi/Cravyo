const { Client } = require('@opensearch-project/opensearch');
const config = require('../config');

let client;
let available = false;

function getSearchClient() {
  if (!config.opensearchNode) return null;
  if (!client) {
    const options = {
      node: config.opensearchNode,
      ssl: { rejectUnauthorized: config.opensearchSslRejectUnauthorized },
    };
    if (config.opensearchUsername) {
      options.auth = { username: config.opensearchUsername, password: config.opensearchPassword };
    }
    client = new Client(options);
  }
  return client;
}

async function connectSearch() {
  const search = getSearchClient();
  if (!search) {
    console.warn('[OpenSearch] OPENSEARCH_NODE is not configured; indexed search is disabled');
    return false;
  }
  await search.ping();
  const existsResponse = await search.indices.exists({ index: config.opensearchIndex });
  const exists = existsResponse.body ?? existsResponse;
  if (!exists) {
    await search.indices.create({
      index: config.opensearchIndex,
      body: {
        mappings: {
          properties: {
            name: { type: 'text' }, description: { type: 'text' },
            restaurantName: { type: 'text' }, cuisine: { type: 'keyword' },
            ingredients: { type: 'text' }, dietary: { type: 'keyword' },
            mood: { type: 'keyword' }, createdAt: { type: 'date' },
          },
        },
      },
    });
  }
  available = true;
  console.log('OpenSearch connected');
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
    index: config.opensearchIndex,
    id: product._id.toString(),
    body: productDocument(product),
    refresh: false,
  });
  return true;
}

async function searchProductIds(query, page, limit) {
  if (!isSearchAvailable()) return null;
  const response = await client.search({
    index: config.opensearchIndex,
    body: {
      from: (page - 1) * limit,
      size: limit,
      query: {
        multi_match: {
          query,
          fields: ['name^4', 'restaurantName^3', 'description^2', 'cuisine', 'ingredients', 'dietary', 'mood'],
          fuzziness: 'AUTO',
        },
      },
    },
  });
  const result = response.body ?? response;
  const total = typeof result.hits.total === 'number' ? result.hits.total : result.hits.total.value;
  return { ids: result.hits.hits.map((hit) => hit._id), total };
}

async function bulkReplaceProducts(products) {
  if (!isSearchAvailable()) return false;
  const operations = products.flatMap((product) => [
    { index: { _index: config.opensearchIndex, _id: product._id.toString() } },
    productDocument(product),
  ]);
  if (operations.length) {
    const response = await client.bulk({ body: operations, refresh: true });
    const result = response.body ?? response;
    if (result.errors) throw new Error('OpenSearch bulk product synchronization failed');
  }
  const liveIds = products.map((product) => product._id.toString());
  await client.deleteByQuery({
    index: config.opensearchIndex,
    body: {
      query: liveIds.length ? { bool: { must_not: { ids: { values: liveIds } } } } : { match_all: {} },
    },
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
