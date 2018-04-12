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

import argparse
import sys

from sawtooth_sdk.processor.core import TransactionProcessor
from sawtooth_sdk.processor.log import init_console_logging

from tunachain_processor.handler import TunachainTransactionHandler


def parse_args(args):
    parser = argparse.ArgumentParser(
        formatter_class=argparse.RawTextHelpFormatter)

    parser.add_argument(
        '-C', '--connect',
        default='tcp://localhost:4004',
        help='Endpoint for the validator connection')

    parser.add_argument(
        '-v', '--verbose',
        action='count',
        default=0,
        help='Increase output sent to stderr')

    return parser.parse_args(args)


def main(args=None):
    if args is None:
        args = sys.argv[1:]
    opts = parse_args(args)
    processor = None
    try:
        processor = TransactionProcessor(url=opts.connect)

        init_console_logging(verbose_level=opts.verbose)

        handler = TunachainTransactionHandler()

        processor.add_handler(handler)

        processor.start()
    except KeyboardInterrupt:
        pass
    except Exception as err:  # pylint: disable=broad-except
        print("Error: {}".format(err))
    finally:
        if processor is not None:
            processor.stop()
