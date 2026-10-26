// Run with: gjs test-spotlight.js
imports.searchPath.unshift('.');
const S = imports.spotlight;
function assert(value, message) { if (!value) throw new Error(message); }
function response(ad) { return {batchrsp: {items: [{item: JSON.stringify({ad})}]}}; }
const base = {title: 'Title (place)', copyright: '© Author', entityId: 'stable-id', landscapeImage: {asset: 'https://example.com/land.jpg'}};
let image = S.parse(response(base))[0];
assert(image.title === base.title && image.copyright === base.copyright, 'metadata');
assert(image.url === base.landscapeImage.asset, 'landscape');
assert(/^Spotlight-[a-f0-9]{64}$/.test(image.urlbase), 'safe filename');
assert(S.parse(response({...base, landscapeImage: {asset: 'https://example.com/new.jpg'}}))[0].urlbase === image.urlbase, 'stable identity');
assert(S.parse(response({portraitImage: {asset: 'https://example.com/p.jpg'}}))[0].url.endsWith('/p.jpg'), 'portrait fallback');
assert(S.parse(response({video: {PreviewImagePath: 'https://example.com/v.jpg'}}))[0].url.endsWith('/v.jpg'), 'video fallback');
for (const value of [{}, {batchrsp: {items: []}}, response({}), response({landscapeImage: {asset: 'http://invalid'}})]) {
    let rejected = false;
    try { S.parse(value); } catch (_) { rejected = true; }
    assert(rejected, 'invalid response rejected');
}
assert(S.requestUrl('zh-CN').includes('country=CN&locale=zh-CN'), 'region');
assert(S.requestUrl('ru-RU', true).includes('country=US&locale=en-US'), 'fallback');
assert(S.requestUrl('auto').startsWith('https://'), 'automatic locale');
print('Spotlight parser and request tests passed');
