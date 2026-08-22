{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    crane.url = "github:ipetkov/crane";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, crane, flake-utils }:
    flake-utils.lib.eachDefaultSystem(system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
        deps = with pkgs; [
            alsa-lib
            librsvg
            glib
            webkitgtk_4_1
            gtk3
            gdk-pixbuf
            libsoup_3
            pango
            cairo

            gst_all_1.gstreamer
            gst_all_1.gst-plugins-base
            gst_all_1.gst-plugins-good
            gst_all_1.gst-plugins-bad
            gst_all_1.gst-plugins-ugly

            pkg-config
        ] ++ pkgs.lib.optionals pkgs.stdenv.hostPlatform.isDarwin [
          pkgs.libiconv
        ];

        craneLib = crane.mkLib pkgs;
        fe-studio = craneLib.buildPackage {
          src = craneLib.cleanCargoSource (craneLib.path ./.);
          buildInputs = deps;
        };
      in
      {
        devShells.default = craneLib.devShell {
          packages = with pkgs; [
            nodejs
            yarn-berry
            rust-analyzer
            mold
            gdb
            gsettings-desktop-schemas
          ] ++ deps;

          LD_LIBRARY_PATH = "${pkgs.lib.makeLibraryPath deps}";
          XDG_DATA_DIRS = "${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}:${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}";
          GIO_MODULE_DIR = "${pkgs.glib-networking}/lib/gio/modules/";
        };
      }
    );
}
