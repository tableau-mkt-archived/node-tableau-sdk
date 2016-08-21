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
        "src/TableauExtract.cc",
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
            "link_settings": {
              "libraries": [
                "-lTableauCommon",
                "-lTableauExtract",
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
                "-framework TableauExtract",
                "-framework TableauServer"
              ],
              "MACOSX_DEPLOYMENT_TARGET": "10.7",
              "GCC_ENABLE_CPP_EXCEPTIONS": "YES"
            }
          }
        ],
        [
          "OS==\"win\"",
          {
            "cflags_cc+": [
              "IC:\Program Files\Tableau\SDK\include /EHsc"
            ],
            "cflags_cc!": [
              "-fno-exceptions"
            ],
            "include_dirs": [
              "C:\\Program Files\\Tableau\\SDK\\include"
            ],
            "libraries": [
              "C:\\Program Files\\Tableau\\SDK\\lib\\TableauCommon.lib",
              "C:\\Program Files\\Tableau\\SDK\\lib\\TableauExtract.lib",
              "C:\\Program Files\\Tableau\\SDK\\lib\\TableauServer.lib"
            ],
            "ldflags": [
              "/LIBPATH:C:\\Program Files\\Tableau\\SDK\\lib tableaucommon.lib tableauextract.lib tableauserver.lib"
            ],
            "msvs_settings": {
              "VCCLCompilerTool": {
                "ExceptionHandling": 1
              },
              "VCLinkerTool": {
                "GenerateDebugInformation": "true",
                "AdditionalLibraryDirectories": [
                  "C:\\Program Files\\Tableau\\SDK\\lib"
                ]
              }
            }
          }
        ]
      ]
    }
  ]
}
