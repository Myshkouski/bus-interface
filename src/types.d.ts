type RawData = Buffer|Uint8Array
type Data = RawData|string
type ConsumableSample = number|Function
type Sample = ConsumableSample|Data
type ConsumablePattern = Data|Array<ConsumableSample>
type Pattern = ConsumablePattern|Array<ConsumablePattern>

declare class WatcherBase {
    public pattern: ConsumablePattern
    public callback: Function|undefined
    public match?: ConsumablePattern
    public matchIndex?: number
}

declare class Watcher extends WatcherBase {
    public match
    public matchIndex
}