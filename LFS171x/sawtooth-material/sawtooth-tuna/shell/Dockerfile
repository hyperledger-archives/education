# Copyright 2018 Intel Corporation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# -----------------------------------------------------------------------------

FROM hyperledger/sawtooth-shell:1.0

RUN echo "deb apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 8AA7AF1F1091A5FD" \
 && apt-get update \
 && apt-get install -y --allow-unauthenticated -q \
    curl \
    python3-pip

RUN curl -sL https://deb.nodesource.com/setup_6.x | bash - \
 && apt-get install -y nodejs


RUN pip3 install \
    pylint \
    pycodestyle

WORKDIR /project/sawtooth-tuna

COPY client/package.json /project/sawtooth-tuna/client/

RUN cd client/ && npm install

ENV PATH $PATH:/project/sawtooth-tuna/bin
