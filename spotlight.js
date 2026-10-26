// Windows Spotlight Iris adapter, based on equinox's spotlight.rs.
const GLib = imports.gi.GLib;
var USER_AGENT = 'WindowsShellClient/10.0.22631.1';
var REFRESH_SECONDS = 4 * 60 * 60;

function requestUrl(market, fallback = false) {
    let locale = market;
    if (!locale || locale === 'auto')
        locale = GLib.get_language_names()[0].split('.')[0].split('@')[0].replace(/_/g, '-');
    if (!/^[a-z]{2,3}-[A-Z]{2}$/.test(locale))
        locale = /^(zh|bo)/.test(locale) ? 'zh-CN' : 'en-US';
    if (fallback)
        locale = 'en-US';
    let country = locale.split('-')[1];
    return 'https://fd.api.iris.microsoft.com/v4/api/selection?placement=88000820&bcnt=1&fmt=json' +
        '&country=' + encodeURIComponent(country) + '&locale=' + encodeURIComponent(locale);
}

function hasItems(data) {
    return !!(data.batchrsp && Array.isArray(data.batchrsp.items) && data.batchrsp.items.length);
}

function parse(data) {
    if (!hasItems(data))
        throw new Error('Spotlight response missing items: ' + JSON.stringify(data.batchrsp || {}));
    const now = GLib.DateTime.new_now_utc();
    return data.batchrsp.items.map(entry => {
        const ad = JSON.parse(entry.item).ad;
        if (!ad)
            throw new Error('Spotlight response missing ad data');
        const url = (ad.landscapeImage || {}).asset || (ad.portraitImage || {}).asset ||
            (ad.video || {}).PreviewImagePath;
        if (typeof url !== 'string' || !url.startsWith('https://'))
            throw new Error('Spotlight response missing HTTPS image URL');
        const id = GLib.compute_checksum_for_string(GLib.ChecksumType.SHA256, ad.entityId || url, -1);
        return {
            source: 'spotlight', urlbase: 'Spotlight-' + id, url,
            startdate: now.format('%Y%m%d'), fullstartdate: now.format('%Y%m%d%H%M'),
            title: ad.title || 'Windows Spotlight', copyright: ad.copyright || '',
            copyrightlink: url, description: ad.description || '', wp: true,
        };
    });
}
