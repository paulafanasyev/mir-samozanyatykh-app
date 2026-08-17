/// Whitelisted commands that may cross the Svetlana WebView/native bridge.
enum BridgeCommand {
  speak,
  emotion,
  stop,
}

BridgeCommand? parseBridgeCommand(String value) {
  switch (value) {
    case 'speak':
      return BridgeCommand.speak;
    case 'emotion':
      return BridgeCommand.emotion;
    case 'stop':
      return BridgeCommand.stop;
    default:
      return null;
  }
}
