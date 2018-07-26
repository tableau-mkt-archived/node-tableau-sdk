{
  "targets": [
    {
      "target_name": "tableau",
      "sources": [
        "src/node-tde.cc",
        "src/TableauHyperExtract.cc",
        "src/TableauTable.cc",
        "src/TableauTableDefinition.cc",
        "src/TableauRow.cc",
      ],
      "cflags": [
        "-std=c++11",
      ],
      "cflags!": [
        "-fno-exceptions"
      ],
      "cflags_cc!": [
        "-fno-exceptions"
      ],
      "conditions": [
        [
          "OS==\"linux\"",
          {
            "link_settings": {
              "libraries": [
                "-lTableauCommon",
                "-lTableauHyperExtract",
              ],
              "ldflags": [
                "-L/usr/lib64/tableausdk",
                "-Wl,-rpath,/usr/lib64/tableausdk"
              ]
            }
          }
        ],
        [
          "OS==\"mac\"",
          {
            "xcode_settings": {
              "OTHER_CPLUSPLUSFLAGS": [
                "-std=c++11",
              ],
              "OTHER_LDFLAGS": [
                "-stdlib=libc++",
                "-framework TableauCommon",
                "-framework TableauHyperExtract",
              ],
              "MACOSX_DEPLOYMENT_TARGET": "10.9",
              "GCC_ENABLE_CPP_EXCEPTIONS": "YES"
            }
          }
        ]
      ]
    }
  ]
}
