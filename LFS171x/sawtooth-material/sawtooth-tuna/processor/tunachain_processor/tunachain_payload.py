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

import json

from sawtooth_sdk.processor.exceptions import InvalidTransaction


class TunachainPayload(object):

    def __init__(self, payload):
        try:
            data = json.loads(payload.decode('utf-8'))
        except ValueError:
            raise InvalidTransaction("Invalid payload serialization")

        action = data.get('action')
        asset = data.get('asset')
        owner = data.get('owner')

        if not action:
            raise InvalidTransaction('Action is required')
        if action not in ('create', 'transfer', 'accept', 'reject'):
            raise InvalidTransaction('Invalid action: {}'.format(action))

        if not asset:
            raise InvalidTransaction('Asset is required')

        if action == 'transfer':
            if not owner:
                raise InvalidTransaction(
                    'Owner is required for "transfer" transaction')

        self._action = action
        self._asset = asset
        self._owner = owner

    @property
    def action(self):
        return self._action

    @property
    def asset(self):
        return self._asset

    @property
    def owner(self):
        return self._owner
