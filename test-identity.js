// Run with: glib-compile-schemas --strict schemas && gjs test-identity.js
// All settings below share an in-memory backend; no user configuration is written.
const {Gio, GLib, GObject} = imports.gi;
const ByteArray = imports.byteArray;
function read(path) {
    return ByteArray.toString(GLib.file_get_contents(path)[1]);
}
function assert(value, message) {
    if (!value)
        throw new Error(message);
}

const metadata = JSON.parse(read('metadata.json'));
const originalUuid = 'BingWallpaper@ineffable-gmail.com';
const originalSchema = 'org.gnome.shell.extensions.bingwallpaper';
assert(metadata.name === 'Windows Spotlight Wallpaper', 'Project display name');
assert(metadata.uuid !== originalUuid, 'Independent extension UUID');
const source = Gio.SettingsSchemaSource.new_from_directory('schemas', null, false);
const schema = source.lookup(metadata['settings-schema'], false);
assert(schema !== null, 'Packaged schema matches metadata');
assert(source.lookup(originalSchema, false) === null, 'Original schema is not packaged');
assert(schema.get_path() !== '/org/gnome/shell/extensions/bingwallpaper/', 'Independent settings path');
assert(schema.has_key('spotlight-json') && !schema.has_key('bing-json'), 'Independent history key');

// Check the actual new schema against the original settings path using the
// same backend, including the shared "state" key used for startup restoration.
const directory = GLib.dir_make_tmp('spotlight-identity-tests-XXXXXX');
try {
    GLib.file_set_contents(directory + '/original.gschema.xml',
        '<schemalist><schema id="' + originalSchema + '" path="/org/gnome/shell/extensions/bingwallpaper/">' +
        '<key name="state" type="s"><default>\'[]\'</default></key></schema></schemalist>');
    const [, , error, status] = GLib.spawn_sync(null,
        ['glib-compile-schemas', '--strict', directory], null, GLib.SpawnFlags.SEARCH_PATH, null);
    assert(status === 0, 'Compile original-path fixture: ' + ByteArray.toString(error));
    const originalSource = Gio.SettingsSchemaSource.new_from_directory(directory, null, false);
    const backend = Gio.memory_settings_backend_new();
    const original = new Gio.Settings({settings_schema: originalSource.lookup(originalSchema, false), backend});
    const current = new Gio.Settings({settings_schema: schema, backend});
    current.set_string('state', '{"source":"spotlight"}');
    assert(original.get_string('state') === '[]', 'New state must not change original state');
    original.set_string('state', '{"source":"bing"}');
    assert(current.get_string('state') === '{"source":"spotlight"}', 'Original state must not change new state');

    // Register the real indicator class beside a legacy type in this process,
    // without starting GNOME Shell or constructing any panel widgets.
    GObject.registerClass(class BingWallpaperIndicator extends GObject.Object {});
    let extensionSource = read('extension.js');
    extensionSource = extensionSource.slice(extensionSource.indexOf('const IndicatorName ='));
    const Indicator = new Function('GObject', 'PanelMenu', 'Me', 'Convenience',
        extensionSource + '\nreturn WindowsSpotlightWallpaperIndicator;')(
        GObject, {Button: GObject.Object}, {dir: Gio.File.new_for_path(GLib.get_current_dir())},
        {currentVersionGreaterEqual: () => true});
    assert(GObject.type_name(Indicator.$gtype) !== 'Gjs_BingWallpaperIndicator', 'Independent runtime GType');
    assert(GObject.type_from_name('Gjs_BingWallpaperIndicator') !== GObject.TYPE_INVALID, 'Original type remains registered');
    print('Independent identity, settings isolation and GObject coexistence tests passed');
} finally {
    Gio.File.new_for_path(directory + '/original.gschema.xml').delete(null);
    const compiled = Gio.File.new_for_path(directory + '/gschemas.compiled');
    if (compiled.query_exists(null))
        compiled.delete(null);
    Gio.File.new_for_path(directory).delete(null);
}
