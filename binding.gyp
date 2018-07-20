{
'make_global_settings': [
    ['CXX','/usr/bin/clang++'],
    ['LINK','/usr/bin/clang++'],
  ],
  "targets": [
    {
      "target_name": "tableau",
      "sources": [
        "src/node-tde.cc",
        "src/TableauHyperExtract.cc",
        "src/TableauTable.cc",
        "src/TableauTableDefinition.cc",
        "src/TableauRow.cc",
        "src/TableauServerConnection.cc"
      ],
      "cflags": [
        "-std=c++11",
        "-stdlib=libc++"
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
            "cflags+": [
              "-std=c++11",
              "-stdlib=libc++"
            ],
            "cflags_c+": [
              "-std=c++11",
              "-stdlib=libc++"
            ],
            "cflags_cc+": [
              "-I/usr/include"
              "-std=c++0x"
            ],
            "include_dirs+": [
              "<!@(node -p \"require('fs').readdirSync('/usr/include/c++').map(f=>'/usr/include/c++/' + f + ' /usr/include/c++/' + f + '/bits')[0]\")"
            ],
            "link_settings": {
              "libraries": [
                "-lTableauCommon",
                "-lTableauHyperExtract",
                "-lTableauServer"
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
                "-stdlib=libc++"
              ],
              "OTHER_LDFLAGS": [
                "-stdlib=libc++",
                "-framework TableauCommon",
                "-framework TableauHyperExtract",
                "-framework TableauServer"
              ],
              "MACOSX_DEPLOYMENT_TARGET": "10.7",
              "GCC_ENABLE_CPP_EXCEPTIONS": "YES"
            }
          }
        ]
      ]
    }
  ]
}
