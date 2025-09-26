# JIPipe

A graphical batch processing language for image analysis.

https://www.jipipe.org/

Zoltán Cseresnyés, Ruman Gerst, Marc Thilo Figge

Research Group Applied Systems Biology - Head: Prof. Dr. Marc Thilo Figge\
https://www.leibniz-hki.de/en/applied-systems-biology.html \
HKI-Center for Systems Biology of Infection\
Leibniz Institute for Natural Product Research and Infection Biology - Hans Knöll Institute (HKI)\
Adolf-Reichwein-Straße 23, 07745 Jena, Germany

The project code is licensed under MIT.\
See the LICENSE file provided with the code for the full license.


## Artifacts index

This repository contains the index of available JIPipe artifacts, which is required for discovery of ORAS-based artifacts.

A GitHub pages workflow automatically builds an index JSON that can be access via https://applied-systems-biology.github.io/JIPipe-Artifacts/index.json

## Contributing

Fork this project and create a package entry in `packages/artifacts` using the following format:

```json
{
    "name": "PACKAGE_NAME",
    "version": "PACKAGE_VERSION",
    "query": "MAVEN_GROUP.PACKAGE_NAME:PACKAGE_VERSION-*",
    "container": "artifacts/MAVEN_GROUP_AS_DIRECTORIES/PACKAGE_NAME",
    "maintainer": {
        "name": "YOUR_NAME",
        "email": "YOUR_EMAIL"
    },
    "description": "SHORT_DESCRIPTION",
    "homepage": "URL",
    "license": "LICENSE",
    "tags": [
        "PACKAGE_VERSION-PACKAGE_CLASSIFIER",
        "<All other tags>"
    ],
    "includes": {
        "pip": [
            "FOR PYTHON ENVIRONMENTS THE ENTRIES FROM requirements.txt",
            "<All requirements.txt entries>"
        ]
    }
}
```