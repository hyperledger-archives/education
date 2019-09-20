package handler

import "fmt"
import "bytes"
import "crypto/sha512"
import "encoding/hex"
import "sawtooth_sdk/processor"
import "sawtooth_sdk/protobuf/processor_pb2"
// import "sawtooth_sdk/protobuf/transaction_pb2"
import "encoding/json"
import "strings"
import "sawtooth_sdk/logging"
import "unicode/utf8"

var logger  = logging.Get()

type jsonHandler struct {
  familyName string
  familyVersion string
  namespaces []string
  encoding string
}

type TransactionPayload struct {
  Action string
  Asset string
  Owner string
}

func (j jsonHandler) FamilyName() (string){
  return j.familyName
}

func (j jsonHandler) FamilyVersion() (string){
  return j.familyVersion
}

func (j jsonHandler) Namespaces() ([]string) {
  return j.namespaces
}

func (self jsonHandler) Encoding() string {
	return "application/json"
}

func buildString(strs ...string) string {
  var buffer bytes.Buffer
  for _, s := range strs{
    buffer.WriteString(s)
  }
  return buffer.String()
}

func getTransferAddress(asset string) string{
  return buildString(prefix, "01", Hexdigest(asset, 62))
}

func getAssetAddress(asset string) string{
  return buildString(prefix, "00", Hexdigest(asset, 62))
}

func createAsset(tp *TransactionPayload, c *processor.Context, signer string) ([]string, error) {
  address := getAssetAddress(tp.Asset)
  entries, err := c.Get([]string{address})
  if err != nil {
    return nil,&processor.InvalidTransactionError{Msg: err.Error()}
  }
  var collisionMap map[string][]byte
  data, exists := entries[address]
  if exists && len(data) > 0 {
    return nil,&processor.InvalidTransactionError{Msg: "Asset already in use!"}
  }
  tp.Owner = signer
  collisionMap = make(map[string][]byte)
  collisionMap[address], err = json.Marshal(map[string]string{"name": tp.Asset, "owner": tp.Owner})
  if err!= nil {
    return nil,&processor.InvalidTransactionError{Msg: err.Error()}
  }
  return c.Set(collisionMap)
}

func transferAsset(tp *TransactionPayload, c *processor.Context, signer string) ([]string, error) {
  address := getTransferAddress(tp.Asset)
  assetAddress := getAssetAddress(tp.Asset)

  entries, err := c.Get([]string{assetAddress})
  if err != nil {
    return nil,&processor.InvalidTransactionError{Msg: err.Error()}
  }
  var collisionMap map[string][]byte
  data, exists := entries[assetAddress]
  if !exists && len(data) == 0 {
    return nil,&processor.InvalidTransactionError{Msg: "Asset does not exist"}
  }
  tpData := TransactionPayload{}
  err = json.Unmarshal(data, &tpData)
  if err != nil {
    return nil,&processor.InvalidTransactionError{Msg: "Could not unmarshall entry"}
  }
  if (signer != tpData.Owner){
    return nil,&processor.InvalidTransactionError{Msg: "Signer cannot be different from owner"}
  }

  collisionMap = make(map[string][]byte)
  collisionMap[address], err = json.Marshal(map[string]string{"asset": tp.Asset, "owner": tp.Owner})
  logger.Warn(fmt.Sprintf("address %v asset %v", address, string(collisionMap[address])))
  if err!= nil {
    return nil,&processor.InvalidTransactionError{Msg: err.Error()}
  }
  logger.Info("Transfer awaiting approval")
  return c.Set(collisionMap)
}

func acceptAsset(tp *TransactionPayload, c *processor.Context, signer string) ([]string, error) {
  address := getTransferAddress(tp.Asset)

  entries, err := c.Get([]string{address})
  if err != nil {
    return nil,&processor.InvalidTransactionError{Msg: err.Error()}
  }

  data, exists := entries[address]
  if !exists && len(data) == 0 {
    return nil,&processor.InvalidTransactionError{Msg: "Asset  cannot be accepted for transfer"}
  }
  tpData := TransactionPayload{}
  err = json.Unmarshal(data, &tpData)
  if err != nil {
    return nil,&processor.InvalidTransactionError{Msg: "Could not unmarshall entry"}
  }
  if (signer != tpData.Owner){
    return nil,&processor.InvalidTransactionError{Msg: "Signer cannot be different from owner"}
  }
  var collisionMap map[string][]byte
  collisionMap = make(map[string][]byte)
  collisionMap[address] = []byte{}
  collisionMap[getAssetAddress(tp.Asset)], err = json.Marshal(map[string]string{"name": tp.Asset, "owner": tpData.Owner})
  if err!= nil {
    return nil,&processor.InvalidTransactionError{Msg: err.Error()}
  }
  return c.Set(collisionMap)
}

func rejectAsset(tp *TransactionPayload, c *processor.Context, signer string) ([]string, error) {
  address := getTransferAddress(tp.Asset)

  entries, err := c.Get([]string{address})
  if err != nil {
    return nil,&processor.InvalidTransactionError{Msg: err.Error()}
  }

  data, exists := entries[address]
  if !exists && len(data) == 0 {
    return nil,&processor.InvalidTransactionError{Msg: "Asset  cannot be transfered"}
  }
  tpData := TransactionPayload{}
  err = json.Unmarshal(data, &tpData)
  if err != nil {
    return nil,&processor.InvalidTransactionError{Msg: "Could not unmarshall entry"}
  }
  if (signer != tpData.Owner){
    return nil,&processor.InvalidTransactionError{Msg: "Signer cannot be different from owner"}
  }
  var collisionMap map[string][]byte
  collisionMap = make(map[string][]byte)
  collisionMap[address] = []byte{}
  return c.Set(collisionMap)
}

func (j jsonHandler) Apply(txn *processor_pb2.TpProcessRequest , c *processor.Context)  error{
  logger.Info("In Handler")
  header :=  txn.GetHeader()
  signer := string(header)[2:68] //dodgy code needs improvement
  tp := TransactionPayload{}
  logger.Info()
  err := json.Unmarshal(txn.GetPayload(), &tp)
  if err != nil{
    logger.Error("Cannot unmarshall current payload")
  }
  logger.Info(fmt.Sprintf("Handling transaction %v > %v with owner %v signed by %v", tp.Action, tp.Asset, tp.Owner[0:utf8.RuneCountInString(tp.Owner)], signer[0:8]))
  if tp.Action == "create"{
    _, err = createAsset(&tp, c, signer)
    return err
  }
  if tp.Action == "transfer"{
    _, err = transferAsset(&tp, c, signer)
    return err
  }
  if tp.Action == "accept"{
    _, err = acceptAsset(&tp, c, signer)
    return err
  }
  if tp.Action == "reject"{
    _, err = rejectAsset(&tp, c, signer)
    return err
  }
  return &processor.InvalidTransactionError{Msg: "Action must be 'create', 'transfer', 'accept', or 'reject'"}
}

var family = "transfer-chain"

func Hexdigest(str string, l int) string {
	hash := sha512.New()
	hash.Write([]byte(str))
	hashBytes := hash.Sum(nil)
	return strings.ToLower(hex.EncodeToString(hashBytes))[0:l]
}


var prefix = Hexdigest(family, 6)


//NewJSONHandler handles transaction in json
func NewJSONHandler()(processor.TransactionHandler) {
  logger.Infof("Creating Handler")
  handler := jsonHandler {familyName: family,
    familyVersion: "0.0",
    namespaces: []string{prefix}}
  return handler
}
