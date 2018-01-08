### Setting up the project

You are going to have to download a few packages:

* `go get -u github.com/golang/protobuf/proto`
* `go get -u github.com/satori/go.uuid`
* `go get -u github.com/pebbe/zmq4`

Now since the golang sawtooth_sdk has been commited to this repo (given https://jira.hyperledger.org/browse/STL-974 ), you are ready to go.

### Launch the project

* First start the docker with `docker-compose -f sawtooth-default.yaml up` in the folder `sawtooth-material`
* Now go to the folder `sawtooth-material/sawtooth-tuna/go-processor` and in your shell run: `export GOPATH=$PWD`
* Finally run `go run src/processor/main.go`

The transaction processor should start, and you should see at the end

```
2018/01/08 21:49:30.017209 processor.go:351: [INFO] Successfully registered handler (transfer-chain, 0x525b60, application/json, [19d832])
```
