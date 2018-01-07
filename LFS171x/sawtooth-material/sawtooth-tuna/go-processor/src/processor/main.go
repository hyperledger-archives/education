package main

import (
	"fmt"
	"handler"
	"sawtooth_sdk/processor"
	"sawtooth_sdk/logging"
	"syscall"
)

func main() {
	endpoint := "tcp://localhost:4004"
	logger := logging.Get()
	tp := processor.NewTransactionProcessor(endpoint)
	// tp.SetMaxQueueSize(10)
	tp.SetThreadCount(1)
	tp.AddHandler(handler.NewJSONHandler())
	fmt.Printf("Handler added \n")
	tp.ShutdownOnSignal(syscall.SIGINT, syscall.SIGTERM)
	err := tp.Start()
	if err != nil {
		logger.Error("Processor stopped: ", err)
	}
	// prefix := handler.Hexdigest("noop")[:6]
	// handler := handler.NewNoopHandler(prefix)
	// processor := processor.NewTransactionProcessor(endpoint)
	// processor.AddHandler(handler)
	// processor.ShutdownOnSignal(syscall.SIGINT, syscall.SIGTERM)
	// err := processor.Start()
	// if err != nil {
	// 	logger.Error("Processor stopped: ", err)
	// }
}
